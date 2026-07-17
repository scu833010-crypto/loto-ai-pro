// ============================================================
// SCRAPER CON NAVEGADOR — necesario porque tanto loteriasdominicanas.com
// como enloteria.com cargan los números con JavaScript (y en el caso de
// enloteria.com, por WebSocket/ActionCable) en vez de traerlos en el
// HTML inicial. Un scraper de solo-HTML (como la primera versión de
// este backend) siempre devuelve 0 resultados contra estos sitios —
// no es un problema de selector, es que el contenido no existe todavía
// cuando se descarga la página. Confirmado navegando ambos sitios
// manualmente durante el desarrollo de este módulo.
//
// Puppeteer/Chromium son dependencias OPCIONALES a propósito: si el
// hosting no puede instalarlas (memoria/plataforma), el resto del
// backend (SQLite, rutas, caché) sigue funcionando — solo el scraping
// en vivo queda inactivo y se registra como evento de error, nunca
// tumba el proceso.
//
// ⚠️ CALIBRACIÓN PENDIENTE: los selectores en config/loterias.js son
// el punto de partida. Deben verificarse contra el DOM YA RENDERIZADO
// (después de que Puppeteer ejecuta el JavaScript de la página) — eso
// no se pudo hacer desde este entorno de desarrollo porque el sitio
// bloquea tráfico automatizado. Para calibrar: despliega esto,
// llama a /api/resultados/:loteriaId, y si sigue en 0, activa
// DEBUG_SCREENSHOT=true (guarda una captura en /tmp) para ver qué
// devolvió el navegador y ajustar selectores desde ahí.
// ============================================================

const { registrarEvento, actualizarEstadoEtapa } = require("../db/eventosRepo");
const { obtenerConfigLoteria } = require("../config/loterias");

let chromium = null;
let puppeteer = null;
let dependenciasDisponibles = false;

try {
  chromium = require("@sparticuz/chromium");
  puppeteer = require("puppeteer-core");
  dependenciasDisponibles = true;
} catch (_e) {
  // Entorno sin soporte para Chromium headless (ej. plan gratuito muy
  // limitado). El resto del sistema sigue funcionando sin scraping en vivo.
}

const TIMEOUT_MS = 35000;

async function lanzarNavegador() {
  if (!dependenciasDisponibles) {
    throw new Error("Puppeteer/Chromium no están disponibles en este entorno.");
  }
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
}

function n2(valor) {
  const soloDigitos = String(valor).replace(/\D/g, "");
  if (soloDigitos.length === 0) return null;
  const num = Number(soloDigitos) % 100;
  return String(num).padStart(2, "0");
}

/**
 * Scrapea una lotería usando un navegador ya abierto (se reutiliza
 * entre loterías para no pagar el costo de lanzar Chromium N veces
 * en un plan gratuito con poca RAM/CPU).
 *
 * IMPORTANTE: se espera solo por 'domcontentloaded', NO por
 * 'networkidle2'. Estos sitios mantienen una conexión en vivo abierta
 * (WebSocket/ActionCable para actualizar resultados en tiempo real),
 * así que la red nunca "queda inactiva" — esperar eso agota siempre
 * el timeout. En su lugar, se espera un tiempo fijo adicional para
 * que el JavaScript inicial termine de pintar el DOM.
 */
async function scrapearLoteriaConNavegador(loteriaId, browserCompartido = null) {
  const config = obtenerConfigLoteria(loteriaId);
  if (!config) throw new Error(`Lotería desconocida: ${loteriaId}`);

  const browser = browserCompartido || (await lanzarNavegador());
  const cerrarAlFinal = !browserCompartido;

  try {
    const page = await browser.newPage();
    try {
      await page.setUserAgent(
        "Mozilla/5.0 (compatible; LotoAIProBot/1.0; +resultados de loteria para app de estadisticas)"
      );
      await page.goto(config.fuenteUrl, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });

      // Espera fija (no basada en red) para dejar que el JS inicial
      // pinte los resultados en el DOM.
      await new Promise((r) => setTimeout(r, 4000));

      if (process.env.DEBUG_SCREENSHOT === "true") {
        await page.screenshot({ path: `/tmp/debug-${loteriaId}.png`, fullPage: true });
      }

      const bloques = await page.$$eval(
        config.selectorContenedor,
        (elementos, selectorHora, selectorNumeros) =>
          elementos.map((el) => {
            const horaEl = el.querySelector(selectorHora);
            const numeroEls = Array.from(el.querySelectorAll(selectorNumeros));
            return {
              hora: horaEl ? horaEl.textContent.trim() : null,
              numerosTexto: numeroEls.map((n) => n.textContent.trim()),
            };
          }),
        config.selectorHora,
        config.selectorNumeros
      );

      const hoy = new Date().toISOString().slice(0, 10);
      const resultados = [];

      bloques.forEach((bloque, idx) => {
        const numeros = bloque.numerosTexto.map(n2).filter(Boolean);
        if (numeros.length === 0) return;
        resultados.push({
          id: `${loteriaId}-${hoy}-${bloque.hora || idx}`,
          loteriaId,
          fecha: hoy,
          hora: bloque.hora || "--:--",
          tipoJuego: numeros.length >= 3 ? "TRIPLETA" : numeros.length === 2 ? "PALE" : "QUINIELA",
          numeros,
          fuente: config.fuenteUrl,
        });
      });

      if (resultados.length === 0) {
        registrarEvento(
          "advertencia",
          "scraper",
          `${config.nombre}: 0 bloques de resultado extraídos. Selectores probablemente desactualizados — ver nota de calibración en el código.`
        );
      } else {
        registrarEvento("info", "scraper", `${config.nombre}: ${resultados.length} resultado(s) extraído(s) correctamente.`);
      }

      actualizarEstadoEtapa("scraper", resultados.length > 0);
      return resultados;
    } finally {
      await page.close();
    }
  } finally {
    if (cerrarAlFinal) await browser.close();
  }
}

module.exports = { scrapearLoteriaConNavegador, lanzarNavegador, dependenciasDisponibles, obtenerHTMLRenderizado };

/**
 * Devuelve el HTML YA RENDERIZADO (después de que corrió el JS de la
 * página) de una lotería puntual. Solo para calibración de selectores
 * — no se usa en el pipeline normal.
 */
async function obtenerHTMLRenderizado(loteriaId) {
  const config = obtenerConfigLoteria(loteriaId);
  if (!config) throw new Error(`Lotería desconocida: ${loteriaId}`);

  const browser = await lanzarNavegador();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (compatible; LotoAIProBot/1.0; +resultados de loteria para app de estadisticas)"
    );
    await page.goto(config.fuenteUrl, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });
    await new Promise((r) => setTimeout(r, 4000));
    return await page.content();
  } finally {
    await browser.close();
  }
}
