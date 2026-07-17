function crearApiInterna(servicioAnalitico, servicios = {}) {
  if (!servicioAnalitico || typeof servicioAnalitico.analizar !== "function") throw new Error("Se requiere un servicio analitico compatible.");
  const api = {
    analizarLoteria: async (solicitud) => ({
      version: "v1",
      tipo: "analisis_descriptivo",
      datos: servicioAnalitico.analizar(solicitud),
      aviso: "No es una prediccion ni una recomendacion de juego.",
    }),
  };
  if (servicios.aprendizaje?.procesarNuevoResultado) {
    api.procesarResultadoHistorico = async (solicitud) => ({
      version: "v1",
      tipo: "actualizacion_de_evidencia_historica",
      datos: await servicios.aprendizaje.procesarNuevoResultado(solicitud),
      aviso: "Actualiza evidencia y metricas historicas; no genera pronosticos.",
    });
  }
  return api;
}

module.exports = { crearApiInterna };
