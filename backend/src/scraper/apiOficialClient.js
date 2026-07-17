// ============================================================
// CLIENTE DE LA API REAL DE LOTERIASDOMINICANAS.COM
//
// Reemplaza al scraping con navegador headless (Puppeteer). El sitio
// es una SPA (Vue/Nuxt) que carga sus resultados vía fetch a esta API
// pública, descubierta inspeccionando la pestaña Network del
// navegador (no documentada oficialmente, pero es la misma que usa
// el sitio real — no hay "otra" fuente más oficial disponible).
//
// Endpoint: GET https://api.loteriasdominicanas.com/dominicana/sessions?date=<ISO>
// Devuelve, en una sola llamada, la última sesión de TODOS los
// sorteos activos (game_id -> sessions[]). Se cruza cada game_id
// contra CATALOGO (config/catalogoGameIds.js) para saber a qué
// lotería y sorteo pertenece. Un game_id que no está en el catálogo
// simplemente se ignora — nunca se inventa un nombre.
//
// Ventajas sobre el navegador headless:
//  - Sin Chromium: no depende de que Render tenga los binarios, no
//    se cae por límites de memoria del plan gratuito.
//  - Una sola petición HTTP para las 11 loterías en vez de 11
//    navegaciones de página completa.
//  - Responde en JSON ya estructurado, no depende de selectores CSS
//    que se rompen con cada rediseño del sitio.
// ============================================================

const { CATALOGO } = require("../config/catalogoGameIds");
const { LOTERIAS } = require("../config/loterias");
const { calcularHorario } = require("../config/horarios");
const cache = require("../cache/memoryCache");

const BASE_URL = process.env.RESULTS_API_URL || "https://api.loteriasdominicanas.com/dominicana/sessions";
const TIMEOUT_MS = 15000;
const REINTENTOS_MAXIMOS = 2;
const CACHE_PREFIX = "loterias-dominicanas:sessions:";

async function fetchConTimeout(url, intento = 0) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "LotoIARD/1.0 (+app de estadisticas de loteria; contacto: configurar-email-de-soporte)",
        ...(process.env.RESULTS_API_KEY ? { Authorization: `Bearer ${process.env.RESULTS_API_KEY}` } : {}),
      },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} al consultar ${url}`);
    return await resp.json();
  } catch (error) {
    if (intento >= REINTENTOS_MAXIMOS) throw error;
    await new Promise((resolve) => setTimeout(resolve, 300 * (intento + 1)));
    return fetchConTimeout(url, intento + 1);
  } finally {
    clearTimeout(timer);
  }
}

/** Fecha en el formato exacto que usa la API: medianoche UTC-4 del día pedido. */
function fechaISOParaAPI(fecha = new Date()) {
  const y = fecha.getUTCFullYear();
  const m = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const d = String(fecha.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}T04:00:00.000Z`;
}

/**
 * Determina un tipoJuego genérico a partir de la forma real del
 * resultado (no de un supuesto fijo) — así un sorteo que en realidad
 * tiene 5 números no se fuerza a caber en "TRIPLETA".
 */
function inferirTipoJuego(numeros) {
  const soloDosDigitos = numeros.every((n) => /^\d{2}$/.test(n));
  if (soloDosDigitos) {
    if (numeros.length === 1) return "QUINIELA";
    if (numeros.length === 2) return "PALE";
    if (numeros.length === 3) return "TRIPLETA";
  }
  return "MULTIPLE"; // loto de 5-6 bolas, pick de un dígito, bolas especiales, etc.
}

/**
 * Trae y mapea TODOS los sorteos conocidos para una fecha dada.
 * Devuelve un array de Resultado listo para el normalizador — no
 * hace scraping por lotería individual porque la API ya trae todo
 * junto (más eficiente y con menos puntos de falla que 11 llamadas).
 */
async function obtenerResultadosDelDia(fecha = new Date()) {
  const dateParam = fechaISOParaAPI(fecha);
  const url = `${BASE_URL}?date=${dateParam}`;
  const cacheKey = `${CACHE_PREFIX}${dateParam}`;
  let data = cache.get(cacheKey);
  if (!data) {
    data = await fetchConTimeout(url);
    cache.set(cacheKey, data);
  }

  if (!Array.isArray(data)) {
    throw new Error("Respuesta inesperada de la API oficial (se esperaba un array)");
  }

  const fechaYMD = dateParam.slice(0, 10);
  const resultados = [];
  const sinCatalogar = [];

  for (const entrada of data) {
    const info = CATALOGO[entrada.game_id];
    if (!info) {
      sinCatalogar.push(entrada.game_id);
      continue;
    }

    const sesion = entrada.lastSession;
    if (!sesion || !Array.isArray(sesion.score) || sesion.score.length === 0) continue;

    // El campo "score" viene como array de arrays (una fila por premio
    // o una sola fila con todos los números, según el sorteo). Se
    // aplana y se limpia sin alterar los valores reales.
    const numeros = sesion.score
      .flat()
      .map((n) => String(n).trim())
      .filter((n) => n.length > 0);

    if (numeros.length === 0) continue;

    const fechaDelResultado = sesion.date ? sesion.date.slice(0, 10) : fechaYMD;
    const { hora, seRealizaEseDia } = calcularHorario(info.nombreJuego, info.loteriaId, fechaDelResultado);

    resultados.push({
      id: `${info.loteriaId}-${entrada.game_id}-${sesion._id}`,
      loteriaId: info.loteriaId,
      nombreJuego: info.nombreJuego,
      fecha: fechaDelResultado,
      hora,
      seRealizaEseDia, // true/false/null (null = sorteo aún sin catalogar en horarios.js)
      tipoJuego: inferirTipoJuego(numeros),
      numeros,
      money: sesion.money || null, // bote/jackpot, cuando aplica (ej. Mega Millions, Powerball)
      fuente: "https://loteriasdominicanas.com (API pública del sitio)",
      providerGameId: entrada.game_id,
      referenciaFuente: url,
      verificationStatus: info.status,
      recibidoEn: new Date().toISOString(),
      actualizadoEn: sesion.updatedAt || sesion.createdAt || null,
    });
  }

  return { resultados, sinCatalogar };
}

/** Compatibilidad con el resto del pipeline: misma firma que el scraper anterior. */
async function scrapearTodas() {
  const { resultados, sinCatalogar } = await obtenerResultadosDelDia(new Date());
  const errores = sinCatalogar.length
    ? [{ loteriaId: "desconocido", error: `${sinCatalogar.length} game_id sin catalogar: ${sinCatalogar.slice(0, 10).join(", ")}` }]
    : [];
  return { resultados, errores };
}

async function scrapearLoteria(loteriaId) {
  const config = LOTERIAS.find((l) => l.id === loteriaId);
  if (!config) throw new Error(`Lotería desconocida: ${loteriaId}`);
  const { resultados } = await obtenerResultadosDelDia(new Date());
  return resultados.filter((r) => r.loteriaId === loteriaId);
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * BACKFILL — carga histórica inicial. Recorre los últimos `dias` días
 * (por defecto 90) pidiendo cada fecha a la API oficial, una por una,
 * con una pausa entre peticiones (por respeto a la fuente externa —
 * no es nuestra API, es un tercero, y golpearla con 90 peticiones
 * simultáneas sería un mal vecino, además de arriesgar bloqueo por
 * rate-limit).
 *
 * NOTA IMPORTANTE: esto reconstruye lo que la API todavía conserva en
 * su historial — si la fuente solo guarda "lastSession" (última por
 * game_id, que es lo que devuelve /sessions), un backfill día-por-día
 * SÍ trae resultados distintos para cada fecha porque el parámetro
 * `date` cambia qué "lastSession" se considera vigente en ese momento.
 * Aun así, no hay garantía de que la fuente conserve 90 días completos
 * para cada sorteo — se reporta cuántos días realmente devolvieron
 * datos nuevos, sin inventar los que falten.
 */
async function backfillHistorico({ dias = 90, pausaMs = 800, onProgreso = null } = {}) {
  const resultadosPorFecha = [];
  const erroresPorFecha = [];

  for (let i = 0; i < dias; i++) {
    const fecha = new Date();
    fecha.setUTCDate(fecha.getUTCDate() - i);

    try {
      const { resultados } = await obtenerResultadosDelDia(fecha);
      resultadosPorFecha.push(...resultados);
      if (onProgreso) onProgreso({ diaActual: i + 1, totalDias: dias, fecha: fechaISOParaAPI(fecha).slice(0, 10), obtenidos: resultados.length });
    } catch (e) {
      erroresPorFecha.push({ fecha: fechaISOParaAPI(fecha).slice(0, 10), error: e.message });
    }

    if (i < dias - 1) await esperar(pausaMs);
  }

  return { resultados: resultadosPorFecha, errores: erroresPorFecha };
}

module.exports = { obtenerResultadosDelDia, scrapearTodas, scrapearLoteria, fechaISOParaAPI, backfillHistorico };
