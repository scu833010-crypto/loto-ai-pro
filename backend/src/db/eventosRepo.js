// ============================================================
// REPOSITORIO — bitácora de eventos reales del sistema.
// Cada intento de scraping, éxito o fallo, escribe aquí. Esto
// alimenta tanto el panel "Monitor" (estado por etapa) como el
// panel "Noticias" (feed de eventos) — con datos reales, no
// inventados: si no hay eventos, el feed sale vacío.
// ============================================================

const db = require("./database");

const insertEvento = db.prepare(`
  INSERT INTO eventos (tipo, etapa, mensaje) VALUES (@tipo, @etapa, @mensaje)
`);

const upsertEstado = db.prepare(`
  INSERT INTO estado_pipeline (etapa, ok, detalle, actualizadoEn)
  VALUES (@etapa, @ok, @detalle, datetime('now'))
  ON CONFLICT(etapa) DO UPDATE SET ok = excluded.ok, detalle = excluded.detalle, actualizadoEn = datetime('now')
`);

function registrarEvento(tipo, etapa, mensaje) {
  insertEvento.run({ tipo, etapa, mensaje });
}

function actualizarEstadoEtapa(etapa, ok, detalle = "") {
  upsertEstado.run({ etapa, ok: ok ? 1 : 0, detalle });
}

function obtenerEventosRecientes(limite = 30) {
  return db.prepare(`SELECT * FROM eventos ORDER BY creadoEn DESC LIMIT ?`).all(limite);
}

function obtenerEstadoPipeline() {
  const filas = db.prepare(`SELECT * FROM estado_pipeline`).all();
  const mapa = {};
  filas.forEach((f) => {
    mapa[f.etapa] = { ok: !!f.ok, detalle: f.detalle, actualizadoEn: f.actualizadoEn };
  });
  return mapa;
}

module.exports = { registrarEvento, actualizarEstadoEtapa, obtenerEventosRecientes, obtenerEstadoPipeline };
