// ============================================================
// RUTA — /api/eventos
// Feed real de eventos del sistema (scraping, normalización, base de
// datos). Alimenta el panel "Noticias" de la app. Si no hay eventos
// todavía, devuelve un array vacío — nunca contenido inventado.
// ============================================================

const express = require("express");
const { obtenerEventosRecientes } = require("../db/eventosRepo");

const router = express.Router();

router.get("/", (req, res) => {
  const limite = Math.min(Number(req.query.limite) || 30, 100);
  const eventos = obtenerEventosRecientes(limite);
  res.json(eventos);
});

module.exports = router;
