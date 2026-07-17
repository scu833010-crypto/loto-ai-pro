// ============================================================
// SERVICIO DE SINCRONIZACIÓN — cliente del backend real de
// LOTO IA RD (ver /backend en la raíz del proyecto).
//
// Mientras CONFIG.habilitado sea false, la app usa datos de ejemplo
// automáticamente — nunca se rompe por falta de configuración.
//
// Para activarlo:
// 1. Despliega /backend en Render o Railway (instrucciones en
//    backend/README.md — incluye render.yaml listo para usar).
// 2. Copia la URL pública que te den (ej. https://tu-app.onrender.com).
// 3. Pon esa URL en BASE_URL abajo y cambia habilitado a true.
// ============================================================

const apiUrlConfigurada = String(process.env.EXPO_PUBLIC_API_URL || "").trim().replace(/\/$/, "");
const CONFIG = {
  habilitado: /^https:\/\//i.test(apiUrlConfigurada),
  baseUrl: apiUrlConfigurada,
};

function mapearRespuestaAResultado(item) {
  return {
    id: item.id,
    loteriaId: item.loteriaId,
    nombreJuego: item.nombreJuego || null,   // antes se descartaba: sin esto, dos sorteos de la misma lotería se veían iguales
    fecha: item.fecha,
    hora: item.hora,
    tipoJuego: item.tipoJuego || "QUINIELA",
    numeros: item.numeros,
    money: item.money || null,               // bote/jackpot, cuando el sorteo lo tiene (antes se descartaba)
    fuente: item.fuente || "Backend LOTO IA RD",
    verificationStatus: item.verificationStatus || "pending",
    recibidoEn: item.recibidoEn || null,
    actualizadoEn: item.actualizadoEn || null, // timestamp real del último resultado (antes se descartaba)
    seRealizaEseDia: typeof item.seRealizaEseDia === "boolean" ? item.seRealizaEseDia : null, // antes se descartaba
  };
}

async function pedir(path) {
  const resp = await fetch(`${CONFIG.baseUrl}${path}`);
  if (!resp.ok) throw new Error(`Backend respondió ${resp.status} en ${path}`);
  return resp.json();
}

/**
 * Trae TODAS las loterías en una sola llamada (endpoint agregado del
 * backend). Más eficiente que pedir lotería por lotería.
 */
export async function obtenerTodosDesdeFuenteReal() {
  if (!CONFIG.habilitado) {
    throw new Error("Backend real no configurado todavía (ver src/core/syncService.js).");
  }
  // rango=todo: antes esta función pedía "/api/resultados" a secas, que
  // el backend siempre resuelve como "solo hoy" — el nombre de la
  // función prometía el histórico completo pero no lo pedía.
  const data = await pedir("/api/resultados?rango=todo");
  return (data.resultados || []).map(mapearRespuestaAResultado);
}

/**
 * Trae una lotería puntual.
 */
export async function obtenerResultadosDesdeFuenteReal(loteriaId) {
  if (!CONFIG.habilitado) {
    throw new Error("Backend real no configurado todavía (ver src/core/syncService.js).");
  }
  const data = await pedir(`/api/resultados/${encodeURIComponent(loteriaId)}`);
  return data.map(mapearRespuestaAResultado);
}

export function fuenteRealHabilitada() {
  return CONFIG.habilitado;
}

export function modoFuente() {
  return CONFIG.habilitado ? "backend" : "demostracion";
}

export function obtenerBaseUrl() {
  return CONFIG.baseUrl;
}

/**
 * Resultados recientes con rango de fechas (Hoy/Ayer/7 días/personalizada),
 * respaldados por SQLite en el backend.
 */
export async function obtenerRecientesDesdeFuenteReal({ rango = "hoy", fecha = null, loteriaId = null } = {}) {
  if (!CONFIG.habilitado) {
    throw new Error("Backend real no configurado todavía (ver src/core/syncService.js).");
  }
  const params = new URLSearchParams({ rango });
  if (fecha) params.set("fecha", fecha);
  if (loteriaId) params.set("loteriaId", loteriaId);
  const data = await pedir(`/api/resultados/recientes?${params.toString()}`);
  return (data.resultados || []).map(mapearRespuestaAResultado);
}

/**
 * Estado real de cada etapa del pipeline (Internet, MIVR/scraper,
 * Normalizador, SQLite, Dashboard) — para el panel Monitor.
 * Devuelve null si el backend no está configurado o no responde,
 * nunca datos inventados.
 */
export async function obtenerEstadoBackend() {
  if (!CONFIG.habilitado) return null;
  try {
    return await pedir("/api/estado");
  } catch (e) {
    return null;
  }
}

/**
 * Bitácora real de eventos del sistema — para el panel Noticias.
 * Devuelve [] si el backend no está configurado o no responde.
 */
export async function obtenerEventosBackend(limite = 30) {
  if (!CONFIG.habilitado) return [];
  try {
    const data = await pedir(`/api/eventos?limite=${limite}`);
    return data || [];
  } catch (e) {
    return [];
  }
}

/** Análisis descriptivo generado por el CORE IA del backend. */
export async function obtenerAnaliticaCoreIa(loteriaId) {
  if (!CONFIG.habilitado) return null;
  try {
    const data = await pedir(`/api/v1/analitica?loteriaId=${encodeURIComponent(loteriaId)}`);
    return data?.datos || null;
  } catch (e) {
    return null;
  }
}
