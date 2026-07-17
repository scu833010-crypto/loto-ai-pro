const { validarResultadoHistorico } = require("../shared/validation");

function crearServicioAprendizaje({ analyticsService, knowledgeStore }) {
  if (!analyticsService?.analizar || !knowledgeStore?.append) throw new Error("Se requieren analyticsService y knowledgeStore compatibles.");
  async function procesarNuevoResultado({ resultado, historico, diasEsperados }) {
    const error = validarResultadoHistorico(resultado);
    if (error) throw new Error(error);
    const historicoActualizado = [...historico, resultado];
    const analisis = analyticsService.analizar({ loteriaId: resultado.loteriaId, resultados: historicoActualizado, diasEsperados });
    const evidencia = await knowledgeStore.append("evaluacion-historica", {
      resultadoId: resultado.id,
      loteriaId: resultado.loteriaId,
      evaluacion: analisis.evaluacion,
      versionModelo: "descriptivo-v1",
    });
    return { analisis, evidencia, nota: "Se registra evidencia historica; no se ajustan pesos para predecir resultados." };
  }
  return { procesarNuevoResultado };
}

module.exports = { crearServicioAprendizaje };
