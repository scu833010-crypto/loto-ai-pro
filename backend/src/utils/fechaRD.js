// ============================================================
// FECHA — República Dominicana (America/Santo_Domingo, UTC-4 todo el
// año, sin horario de verano).
//
// BUG CORREGIDO: antes se usaba `date.toISOString().slice(0,10)` para
// calcular "hoy" — eso da el día calendario en UTC, no en RD. Durante
// la ventana de 00:00 a 03:59 hora de RD (que es 04:00-07:59 UTC), el
// día UTC ya es el día siguiente al día real en RD. Resultado: el
// backend podía guardar o consultar resultados con la fecha de mañana
// durante esas 4 horas cada noche.
//
// Esta función usa Intl.DateTimeFormat con el timeZone explícito, así
// que el resultado es correcto sin importar en qué zona horaria esté
// el servidor (Render corre en UTC, pero esto ya no depende de eso).
// ============================================================

const ZONA_RD = "America/Santo_Domingo";

/**
 * Devuelve la fecha calendario de RD (YYYY-MM-DD) correspondiente a
 * un instante dado (por defecto, ahora mismo).
 */
function fechaLocalRD(fecha = new Date()) {
  // en-CA formatea como YYYY-MM-DD directamente, sin necesidad de reordenar.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_RD,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}

/** Fecha de RD hace N días, en formato YYYY-MM-DD. */
function fechaLocalRDHaceNDias(n, desde = new Date()) {
  const base = new Date(desde);
  base.setUTCDate(base.getUTCDate() - n);
  return fechaLocalRD(base);
}

module.exports = { fechaLocalRD, fechaLocalRDHaceNDias, ZONA_RD };
