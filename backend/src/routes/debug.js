// ============================================================
// RUTA — /api/debug/html/:loteriaId
// SOLO para calibrar selectores. Devuelve el HTML ya renderizado
// (después del JS) de una lotería puntual, como texto plano, para
// poder inspeccionarlo sin necesitar acceso al sistema de archivos
// del servidor. No se usa en el pipeline normal.
// ============================================================

const express = require("express");
const { obtenerHTMLRenderizado } = require("../scraper/browserScraper");
const { obtenerResultadosDelDia } = require("../scraper/apiOficialClient");

const router = express.Router();

// Ruta legada (Puppeteer). Ya no la usa el pipeline; se deja solo por
// si hiciera falta volver a inspeccionar el HTML renderizado a mano.
router.get("/html/:loteriaId", async (req, res) => {
  try {
    const html = await obtenerHTMLRenderizado(req.params.loteriaId);
    res.type("text/plain").send(html);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// /api/debug/api?fecha=YYYY-MM-DD — llama directo a la API oficial y
// muestra el resultado del mapeo (útil para confirmar que un game_id
// nuevo del sitio ya está catalogado, o para ver cuáles faltan).
router.get("/api", async (req, res) => {
  try {
    const fecha = req.query.fecha ? new Date(req.query.fecha) : new Date();
    const { resultados, sinCatalogar } = await obtenerResultadosDelDia(fecha);
    res.json({
      totalResultados: resultados.length,
      totalSinCatalogar: sinCatalogar.length,
      sinCatalogar,
      resultados,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
