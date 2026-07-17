// ============================================================
// RUTA — /api/estado
// Devuelve el estado REAL de cada etapa del pipeline, tal como quedó
// registrado la última vez que corrió. Nunca inventa valores: si una
// etapa nunca corrió, se reporta como "desconocido", no como verde.
// ============================================================

const express = require("express");
const { obtenerEstadoPipeline } = require("../db/eventosRepo");
const { contarResultados } = require("../db/resultadosRepo");

const router = express.Router();

const ETAPAS = ["internet", "scraper", "normalizador", "baseDatos"];

router.get("/", (req, res) => {
  const estados = obtenerEstadoPipeline();

  const pipeline = ETAPAS.map((etapa) => ({
    etapa,
    ok: estados[etapa]?.ok ?? null, // null = todavía no corrió ninguna vez
    detalle: estados[etapa]?.detalle ?? "Sin datos todavía",
    actualizadoEn: estados[etapa]?.actualizadoEn ?? null,
  }));

  // "dashboard" es implícito: si esta respuesta llegó, el backend
  // que alimenta al dashboard está vivo.
  pipeline.push({ etapa: "dashboard", ok: true, detalle: "Backend respondiendo", actualizadoEn: new Date().toISOString() });

  res.json({
    pipeline,
    totalResultadosGuardados: contarResultados(),
  });
});

module.exports = router;
