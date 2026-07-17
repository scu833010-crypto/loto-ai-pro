// ============================================================
// RUTAS — /api/ia
// Espacio reservado para funciones analíticas avanzadas futuras
// (por ejemplo, modelos de series de tiempo sobre el histórico).
// Ninguna ruta de esta sección debe devolver nunca una "predicción"
// de números ganadores — el principio del proyecto se mantiene aquí:
// estadística descriptiva del histórico, nunca pronóstico del futuro.
// Por ahora, sin implementar: responde 501 a propósito.
// ============================================================

const express = require("express");
const router = express.Router();

router.all("*", (req, res) => {
  res.status(501).json({
    error: "Endpoint reservado para funciones de IA futuras, aún no implementado.",
  });
});

module.exports = router;
