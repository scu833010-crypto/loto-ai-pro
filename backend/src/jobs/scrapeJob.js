// ============================================================
// JOB DE SINCRONIZACIÓN — ejecuta el pipeline completo:
//   Internet -> API oficial -> Normalizador -> SQLite
// y deja registrado el estado real de cada etapa para que el panel
// "Monitor" de la app lo muestre en verde/rojo, y cada evento para
// que "Noticias" tenga contenido real (nunca inventado).
//
// CAMBIO IMPORTANTE: ya no usa Puppeteer/Chromium. El sitio fuente es
// una SPA que carga sus datos vía fetch a una API JSON pública — se
// llama esa API directamente (ver scraper/apiOficialClient.js). Esto
// elimina la causa más común de fallos en hosting gratuito (falta de
// memoria/binarios de Chromium) y reduce 11 navegaciones de página
// completa a 1 sola petición HTTP.
// ============================================================

const cron = require("node-cron");
const { scrapearTodas } = require("../scraper/apiOficialClient");
const { normalizar } = require("../normalizer/normalizador");
const { guardarResultados } = require("../db/resultadosRepo");
const { registrarEvento, actualizarEstadoEtapa } = require("../db/eventosRepo");

const INTERNET_CHECK_URL = "https://www.google.com";
const INTERVALO_CRON = process.env.SYNC_CRON || "*/10 * * * *"; // cada 10 min por defecto

async function verificarInternet() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(INTERNET_CHECK_URL, { signal: controller.signal });
    clearTimeout(timer);
    const ok = resp.ok;
    actualizarEstadoEtapa("internet", ok, ok ? "Conectividad OK" : `HTTP ${resp.status}`);
    return ok;
  } catch (e) {
    actualizarEstadoEtapa("internet", false, e.message);
    registrarEvento("error", "internet", `Sin conectividad de salida: ${e.message}`);
    return false;
  }
}

async function ejecutarPipeline() {
  const hayInternet = await verificarInternet();
  if (!hayInternet) {
    registrarEvento("error", "scraper", "Se omite la sincronización: no hay conectividad de salida.");
    actualizarEstadoEtapa("scraper", false, "Sin internet");
    return { ok: false, motivo: "sin-internet" };
  }

  let crudos = [];
  try {
    const { resultados, errores } = await scrapearTodas();
    crudos = resultados;

    if (errores.length > 0) {
      errores.forEach((e) => registrarEvento("advertencia", "scraper", `${e.loteriaId}: ${e.error}`));
    }

    actualizarEstadoEtapa(
      "scraper",
      true,
      `${resultados.length} resultado(s) obtenidos de la API oficial${errores.length ? ` (${errores.length} advertencia(s))` : ""}`
    );
    registrarEvento("info", "scraper", `${resultados.length} resultado(s) real(es) obtenidos correctamente.`);
  } catch (e) {
    actualizarEstadoEtapa("scraper", false, e.message);
    registrarEvento("error", "scraper", `Fallo consultando la API oficial: ${e.message}`);
    return { ok: false, motivo: "fallo-api", error: e.message };
  }

  const normalizados = normalizar(crudos);

  try {
    guardarResultados(normalizados);
    actualizarEstadoEtapa("baseDatos", true, `${normalizados.length} registro(s) guardado(s)`);
    registrarEvento("info", "baseDatos", `${normalizados.length} resultado(s) guardado(s) en SQLite.`);
  } catch (e) {
    actualizarEstadoEtapa("baseDatos", false, e.message);
    registrarEvento("error", "baseDatos", `Fallo guardando en SQLite: ${e.message}`);
  }

  return { ok: true, extraidos: crudos.length, normalizados: normalizados.length };
}

function iniciarProgramador() {
  registrarEvento("info", "scraper", `Sincronización programada cada: ${INTERVALO_CRON}`);
  cron.schedule(INTERVALO_CRON, () => {
    ejecutarPipeline().catch((e) => registrarEvento("error", "scraper", `Pipeline falló sin capturar: ${e.message}`));
  });
}

module.exports = { ejecutarPipeline, iniciarProgramador, verificarInternet };
