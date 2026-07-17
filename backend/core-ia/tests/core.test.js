const test = require("node:test");
const assert = require("node:assert/strict");
const { crearServicioAnalitico } = require("../analytics/analyticsService");
const { crearApiInterna } = require("../api/internalApi");
const { validarHistorico } = require("../shared/validation");
const { crearServicioAprendizaje } = require("../learning/evidenceLearningService");
const { crearArchivoKnowledgeStore } = require("../knowledge/fileKnowledgeStore");
const { proponerConfiguracion } = require("../optimization/autoImprovementEngine");
const { simularVentanasHistoricas } = require("../simulation/historicalSimulationEngine");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs/promises");

// Fixtures aislados de prueba: nunca son una fuente de datos de produccion.
function resultado(id, fecha, numeros) {
  return { id, loteriaId: "loteria-prueba", fecha, hora: "12:00", numeros, fuente: "registro-historico-verificado-de-prueba" };
}

test("rechaza mocks o datos sin fuente real identificable", () => {
  assert.throws(() => validarHistorico([{ ...resultado("x", "2026-01-01", ["01"]), fuente: "SIMULADO" }]), /historicos/);
});

test("entrega un analisis descriptivo separado por loteria", async () => {
  const historico = Array.from({ length: 36 }, (_, i) => resultado(`r-${i}`, `2026-01-${String((i % 28) + 1).padStart(2, "0")}`, ["01", "02", String((i + 10) % 100).padStart(2, "0")]));
  const api = crearApiInterna(crearServicioAnalitico());
  const respuesta = await api.analizarLoteria({ loteriaId: "loteria-prueba", resultados: historico, diasEsperados: 28 });
  assert.equal(respuesta.tipo, "analisis_descriptivo");
  assert.equal(respuesta.datos.totalResultados, 36);
  assert.equal(respuesta.datos.ranking[0].numero, "01");
  assert.match(respuesta.aviso, /No es una prediccion/);
  assert.equal(Object.hasOwn(respuesta.datos, "numerosSugeridos"), false);
});

test("integra memoria persistente, aprendizaje por evidencia y API interna", async () => {
  const directorio = await fs.mkdtemp(path.join(os.tmpdir(), "core-ia-"));
  const store = crearArchivoKnowledgeStore(path.join(directorio, "knowledge.jsonl"));
  const analytics = crearServicioAnalitico();
  const aprendizaje = crearServicioAprendizaje({ analyticsService: analytics, knowledgeStore: store });
  const historico = Array.from({ length: 31 }, (_, i) => resultado(`base-${i}`, `2026-02-${String((i % 28) + 1).padStart(2, "0")}`, ["01", "02", "03"]));
  const api = crearApiInterna(analytics, { aprendizaje });
  const respuesta = await api.procesarResultadoHistorico({
    resultado: resultado("nuevo-real", "2026-03-01", ["04", "05", "06"]),
    historico,
    diasEsperados: 30,
  });
  assert.equal(respuesta.tipo, "actualizacion_de_evidencia_historica");
  assert.equal((await store.list("evaluacion-historica")).length, 1);
});

test("la simulacion solo referencia ventanas historicas y la mejora requiere evidencia", () => {
  const historico = [resultado("a", "2026-01-01", ["01"]), resultado("b", "2026-01-02", ["02"])];
  const simulacion = simularVentanasHistoricas(historico, 1);
  assert.deepEqual(simulacion.ventanas[0].ids, ["a"]);
  const propuesta = proponerConfiguracion([{ muestras: 40, tasaObservada: 0.2, tasaBaseAleatoria: 0.1, ventana: 45 }], { ventana: 30 });
  assert.equal(propuesta.configuracion.ventana, 45);
  assert.match(propuesta.motivo, /aprobacion externa/);
});
