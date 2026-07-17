// ============================================================
// SCRAPER — trae el HTML de la fuente pública configurada y lo
// convierte al formato interno de Resultado que consume la app.
//
// IMPORTANTE (calibración pendiente): los selectores en
// src/config/loterias.js son un punto de partida razonable según la
// estructura típica de sitios de resultados de lotería, pero NO se
// pudieron verificar contra el HTML real porque el sitio bloquea
// tráfico de scraping desde el entorno donde se escribió este código.
// Antes de usar en producción: abrir la fuenteUrl en el navegador,
// inspeccionar un resultado con las herramientas de desarrollador, y
// ajustar los tres selectores en loterias.js si no calzan. El resto
// del sistema (caché, rutas, la app) no necesita cambios cuando eso
// pase — es la única pieza que depende de la estructura externa.
// ============================================================

const cheerio = require("cheerio");
const cache = require("../cache/memoryCache");
const { obtenerConfigLoteria, LOTERIAS } = require("../config/loterias");

const TIMEOUT_MS = 10000;
const USER_AGENT =
  "LotoAIProBot/1.0 (+resultados de lotería para app de estadisticas; contacto: configurar-email-de-soporte)";

function n2(valor) {
  const soloDigitos = String(valor).replace(/\D/g, "");
  if (soloDigitos.length === 0) return null;
  const num = Number(soloDigitos) % 100;
  return String(num).padStart(2, "0");
}

async function fetchConTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "es-DO,es;q=0.9" },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} al consultar ${url}`);
    return await resp.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Scrapea una lotería puntual. Devuelve un array de Resultado (puede
 * estar vacío si la fuente no publicó nada todavía hoy, o si los
 * selectores no calzan — ver nota de calibración arriba).
 */
async function scrapearLoteria(loteriaId) {
  const config = obtenerConfigLoteria(loteriaId);
  if (!config) throw new Error(`Lotería desconocida: ${loteriaId}`);

  const cacheKey = `resultados:${loteriaId}`;
  const enCache = cache.get(cacheKey);
  if (enCache) return enCache;

  const html = await fetchConTimeout(config.fuenteUrl);
  const $ = cheerio.load(html);
  const hoy = new Date().toISOString().slice(0, 10);
  const resultados = [];

  $(config.selectorContenedor).each((_, el) => {
    const bloque = $(el);
    const horaTexto = bloque.find(config.selectorHora).first().text().trim();
    const numerosTexto = bloque
      .find(config.selectorNumeros)
      .map((__, n) => $(n).text().trim())
      .get();

    const numeros = numerosTexto.map(n2).filter(Boolean);
    if (numeros.length === 0) return;

    resultados.push({
      id: `${loteriaId}-${hoy}-${horaTexto || resultados.length}`,
      loteriaId,
      fecha: hoy,
      hora: horaTexto || "--:--",
      tipoJuego: numeros.length >= 3 ? "TRIPLETA" : numeros.length === 2 ? "PALE" : "QUINIELA",
      numeros,
      fuente: config.fuenteUrl,
    });
  });

  cache.set(cacheKey, resultados);
  return resultados;
}

/**
 * Scrapea todas las loterías del catálogo en paralelo. Si una falla,
 * no tumba a las demás — devuelve lo que sí se pudo obtener y reporta
 * los errores por separado para que la ruta decida qué responder.
 */
async function scrapearTodas() {
  const resultadosPorLoteria = await Promise.allSettled(
    LOTERIAS.map((l) => scrapearLoteria(l.id))
  );

  const resultados = [];
  const errores = [];

  resultadosPorLoteria.forEach((r, idx) => {
    const loteriaId = LOTERIAS[idx].id;
    if (r.status === "fulfilled") {
      resultados.push(...r.value);
    } else {
      errores.push({ loteriaId, error: r.reason?.message || "Error desconocido" });
    }
  });

  return { resultados, errores };
}

module.exports = { scrapearLoteria, scrapearTodas };
