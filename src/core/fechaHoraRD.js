// ============================================================
// FECHA/HORA — República Dominicana (America/Santo_Domingo, UTC-4
// todo el año, sin horario de verano). Usar SIEMPRE estas funciones
// en vez de nueva Date().toLocaleString() directo, porque el
// dispositivo del usuario puede estar en otra zona horaria y producir
// horas incorrectas ("23 horas", horas negativas, etc.).
// ============================================================

const ZONA_RD = "America/Santo_Domingo";

/**
 * Formatea una fecha/hora (Date o string ISO) en la hora oficial de
 * República Dominicana, sin depender de la zona horaria del teléfono.
 */
export function formatoFechaHoraRD(fechaEntrada) {
  const fecha = fechaEntrada instanceof Date ? fechaEntrada : new Date(fechaEntrada);
  if (isNaN(fecha.getTime())) return "--";
  return new Intl.DateTimeFormat("es-DO", {
    timeZone: ZONA_RD,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(fecha);
}

/**
 * Solo la hora (HH:mm AM/PM) en horario de RD.
 */
export function formatoHoraRD(fechaEntrada) {
  const fecha = fechaEntrada instanceof Date ? fechaEntrada : new Date(fechaEntrada);
  if (isNaN(fecha.getTime())) return "--";
  return new Intl.DateTimeFormat("es-DO", {
    timeZone: ZONA_RD,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(fecha);
}

/**
 * "Hace X minutos/horas/días", calculado siempre contra la hora real
 * de RD (nunca puede dar negativo ni pasarse de 24 horas por error
 * de zona horaria).
 */
export function tiempoRelativoRD(fechaEntrada) {
  const fecha = fechaEntrada instanceof Date ? fechaEntrada : new Date(fechaEntrada);
  if (isNaN(fecha.getTime())) return "--";

  const ahora = Date.now();
  let diffMs = ahora - fecha.getTime();
  if (diffMs < 0) diffMs = 0; // nunca "hace -X" por desfase de reloj

  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return "Hace un momento";
  if (minutos < 60) return `Hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  return `Hace ${dias} día${dias === 1 ? "" : "s"}`;
}

/**
 * Fecha (YYYY-MM-DD) de RD para cualquier instante dado — no la del
 * dispositivo. Se usa tanto para "hoy" como para calcular "ayer" o
 * "hace N días" de forma consistente con la zona horaria de RD.
 */
export function fechaLocalRD(fechaEntrada = new Date()) {
  const fecha = fechaEntrada instanceof Date ? fechaEntrada : new Date(fechaEntrada);
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_RD,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);
  const obj = {};
  partes.forEach((p) => (obj[p.type] = p.value));
  return `${obj.year}-${obj.month}-${obj.day}`;
}

/**
 * Fecha de "hoy" en formato YYYY-MM-DD, según la zona horaria de RD
 * (no la del dispositivo) — importante para que "hoy" no cambie de
 * día antes/después de tiempo respecto a Santo Domingo.
 */
export function fechaHoyRD() {
  return fechaLocalRD(new Date());
}

export default { formatoFechaHoraRD, formatoHoraRD, tiempoRelativoRD, fechaHoyRD, fechaLocalRD };
