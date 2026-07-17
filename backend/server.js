// ============================================================
// SERVIDOR — LOTO IA RD Backend
// Pipeline: Internet -> MIVR (scraper) -> Normalizador -> SQLite -> API
// Pensado para desplegarse gratis en Render/Railway.
// ============================================================

const express = require("express");
const cors = require("cors");
const rateLimiter = require("./src/middleware/rateLimiter");
const { requiereAdminKey } = require("./src/middleware/adminAuth");
const resultadosRouter = require("./src/routes/resultados");
const iaRouter = require("./src/routes/ia");
const estadoRouter = require("./src/routes/estado");
const eventosRouter = require("./src/routes/eventos");
const syncRouter = require("./src/routes/sync");
const debugRouter = require("./src/routes/debug");
const { iniciarProgramador } = require("./src/jobs/scrapeJob");
const { contarResultados, guardarResultados } = require("./src/db/resultadosRepo");
const { normalizar } = require("./src/normalizer/normalizador");
const { backfillHistorico } = require("./src/scraper/apiOficialClient");
const { registrarEvento } = require("./src/db/eventosRepo");
const { crearAdaptadorResultadosCoreIa } = require("./src/adapters/coreIaResultadosAdapter");
const { crearOrquestadorCoreIa } = require("./src/services/coreIaOrchestrator");
const { crearRouterV1 } = require("./src/routes/v1");

const app = express();
const PORT = process.env.PORT || 3000;

const origenesPermitidos = (process.env.CORS_ORIGINS || "").split(",").map((origen) => origen.trim()).filter(Boolean);
app.use(cors({ origin(origin, callback) {
  if (!origin || origenesPermitidos.includes(origin)) return callback(null, true);
  return callback(new Error("Origen no permitido por CORS."));
} }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});
app.use(rateLimiter);
const coreIa = crearOrquestadorCoreIa({ resultadosAdapter: crearAdaptadorResultadosCoreIa() });

app.get("/", (req, res) => {
  res.json({
    servicio: "LOTO IA RD Backend",
    estado: "activo",
    endpoints: [
      "/api/resultados/recientes?rango=hoy|ayer|7dias|personalizada",
      "/api/resultados/loterias",
      "/api/resultados/:loteriaId",
      "/api/estado",
      "/api/eventos",
      "/api/sync/ejecutar (POST/GET) — requiere header x-admin-key en producción",
      "/api/debug/html/:loteriaId (solo para calibración) — requiere header x-admin-key en producción",
      "/api/ia (reservado)",
    ],
  });
});

app.get("/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/resultados", resultadosRouter);
app.use("/api/ia", iaRouter);
app.use("/api/estado", estadoRouter);
app.use("/api/eventos", eventosRouter);
app.use("/api/sync", requiereAdminKey, syncRouter);
app.use("/api/debug", requiereAdminKey, debugRouter);
app.use("/api/v1", crearRouterV1({ coreIa }));

app.use((error, req, res, next) => {
  console.error("[api]", error.message);
  res.status(400).json({ error: "No se pudo procesar la solicitud.", detalle: process.env.NODE_ENV === "production" ? undefined : error.message });
});

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

function iniciarServidor() {
  return app.listen(PORT, () => {
    console.log(`LOTO IA RD Backend escuchando en puerto ${PORT}`);
    iniciarProgramador();
    autoBackfillSiEstaVacia();
  });
}

/**
 * AUTO-SANACIÓN: Render free no tiene disco persistente — cada
 * redeploy (o simplemente un reinicio del contenedor) empieza con
 * SQLite vacío. En vez de depender de que alguien recuerde llamar a
 * /api/sync/backfill a mano cada vez, el servidor se revisa a sí
 * mismo al arrancar: si no hay ningún resultado guardado, dispara el
 * backfill de 90 días automáticamente en segundo plano.
 *
 * Esto no reemplaza tener almacenamiento persistente de verdad (eso
 * sigue siendo lo recomendado para producción seria), pero mientras
 * tanto evita que la app se quede con la base vacía después de cada
 * despliegue sin que nadie se dé cuenta.
 */
async function autoBackfillSiEstaVacia() {
  const total = contarResultados();
  if (total > 0) {
    console.log(`[auto-backfill] Ya hay ${total} resultado(s) en la base — no hace falta backfill al arrancar.`);
    return;
  }

  console.log("[auto-backfill] Base de datos vacía al arrancar — iniciando backfill automático de 90 días...");
  registrarEvento("info", "backfill", "Base de datos vacía al arrancar. Iniciando backfill automático de 90 días.");

  try {
    const { resultados, errores } = await backfillHistorico({ dias: 90 });
    const normalizados = normalizar(resultados);
    guardarResultados(normalizados);
    registrarEvento(
      "info",
      "backfill",
      `Auto-backfill al arrancar completado: ${normalizados.length} resultado(s) guardado(s)${errores.length ? `, ${errores.length} día(s) con error` : ""}.`
    );
  } catch (e) {
    registrarEvento("error", "backfill", `Auto-backfill al arrancar falló: ${e.message}`);
  }
}

if (require.main === module) iniciarServidor();

module.exports = { app, iniciarServidor, autoBackfillSiEstaVacia };
