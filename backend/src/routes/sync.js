// ============================================================
// RUTA — /api/sync
// Disparo manual del pipeline (Internet -> MIVR -> Normalizador ->
// SQLite). Útil para probar justo después de desplegar, sin esperar
// al cron. También la puede usar un botón "Actualizar ahora" en la app.
// ============================================================

const express = require("express");
const { ejecutarPipeline } = require("../jobs/scrapeJob");
const { backfillHistorico } = require("../scraper/apiOficialClient");
const { normalizar } = require("../normalizer/normalizador");
const { guardarResultados } = require("../db/resultadosRepo");
const { registrarEvento } = require("../db/eventosRepo");

const router = express.Router();

let backfillEnCurso = false;

async function manejarEjecucion(req, res) {
  try {
    const resultado = await ejecutarPipeline();
    res.json(resultado);
  } catch (e) {
    res.status(500).json({ error: "El pipeline falló", detalle: e.message });
  }
}

// GET además de POST: para poder disparar el pipeline con solo visitar
// la URL en el navegador, sin necesitar la consola de desarrollador.
router.get("/ejecutar", manejarEjecucion);
router.post("/ejecutar", manejarEjecucion);

// POST /api/sync/backfill?dias=90 — carga histórica inicial. Corre en
// segundo plano (puede tardar 1-2 minutos con 90 días) y responde de
// inmediato con "iniciado"; el progreso y el resultado final quedan
// en /api/eventos (panel "Noticias" de la app).
router.post("/backfill", (req, res) => {
  if (backfillEnCurso) {
    return res.status(409).json({ error: "Ya hay un backfill en curso. Revisa /api/eventos para ver el progreso." });
  }

  const dias = Math.max(1, Math.min(365, Number(req.query.dias) || 90));
  backfillEnCurso = true;
  registrarEvento("info", "backfill", `Iniciando carga histórica de los últimos ${dias} días...`);

  backfillHistorico({
    dias,
    onProgreso: ({ diaActual, totalDias, fecha, obtenidos }) => {
      if (diaActual % 10 === 0 || diaActual === totalDias) {
        registrarEvento("info", "backfill", `Progreso: día ${diaActual}/${totalDias} (${fecha}) — ${obtenidos} resultado(s) en ese día.`);
      }
    },
  })
    .then(({ resultados, errores }) => {
      const normalizados = normalizar(resultados);
      guardarResultados(normalizados);
      registrarEvento(
        "info",
        "backfill",
        `Backfill completo: ${normalizados.length} resultado(s) guardado(s) de ${dias} días${errores.length ? `, ${errores.length} día(s) con error` : ""}.`
      );
    })
    .catch((e) => {
      registrarEvento("error", "backfill", `Backfill falló: ${e.message}`);
    })
    .finally(() => {
      backfillEnCurso = false;
    });

  res.json({ ok: true, mensaje: `Backfill de ${dias} días iniciado en segundo plano. Revisa /api/eventos para el progreso.` });
});

module.exports = router;
