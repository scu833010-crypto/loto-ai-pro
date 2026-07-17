// ============================================================
// RUTAS — /api/resultados
// Lee de SQLite (ya poblado por el job de sincronización), nunca
// dispara un scrape en vivo por cada request — eso vive en /api/sync.
// ============================================================

const express = require("express");
const { obtenerResultadosRecientes } = require("../db/resultadosRepo");
const { LOTERIAS } = require("../config/loterias");

const router = express.Router();

// GET /api/resultados/loterias -> catálogo soportado (id + nombre)
router.get("/loterias", (req, res) => {
  res.json(LOTERIAS.map((l) => ({ id: l.id, nombre: l.nombre })));
});

// GET /api/resultados/recientes?rango=hoy|ayer|7dias|personalizada&fecha=YYYY-MM-DD&loteriaId=...
router.get("/recientes", (req, res) => {
  const { rango = "hoy", fecha = null, loteriaId = null } = req.query;
  try {
    const resultados = obtenerResultadosRecientes({ rango, fecha, loteriaId });
    res.json({ resultados, rango, fecha, loteriaId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/resultados?rango=hoy|ayer|7dias|todo -> por defecto 'hoy'
// (compatibilidad histórica), pero ahora acepta rango explícito — antes
// estaba fijo a 'hoy' sin excepción, y la función del lado móvil que la
// llama se llama "obtenerTodosDesdeFuenteReal" (esperaba TODO, recibía
// solo hoy). Ver src/core/syncService.js del lado móvil.
router.get("/", (req, res) => {
  const { rango = "hoy", fecha = null } = req.query;
  try {
    const resultados = obtenerResultadosRecientes({ rango, fecha });
    res.json({ resultados, errores: [], actualizadoEn: new Date().toISOString() });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/resultados/:loteriaId?rango=hoy|ayer|7dias|todo|personalizada&fecha=YYYY-MM-DD
// Por defecto da el histórico completo guardado de esa lotería — antes
// estaba fijo a 7 días sin importar lo que pidiera quien llama, lo cual
// no coincidía con lo que las pantallas de estadísticas necesitan.
router.get("/:loteriaId", (req, res) => {
  const { loteriaId } = req.params;
  const { rango = "todo", fecha = null } = req.query;
  const existe = LOTERIAS.some((l) => l.id === loteriaId);
  if (!existe) return res.status(404).json({ error: `Lotería desconocida: ${loteriaId}` });

  try {
    const resultados = obtenerResultadosRecientes({ rango, fecha, loteriaId });
    res.json(resultados);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
