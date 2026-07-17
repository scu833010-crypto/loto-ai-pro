function explicarAnalisis({ loteriaId, resultados, riesgo }) {
  return {
    resumen: `Analisis descriptivo de ${resultados.length} resultados reales de ${loteriaId}.`,
    variables: ["frecuencia absoluta", "frecuencia relativa", "retrasos", "distribuciones", "patrones conjuntos"],
    limitaciones: [
      "Los sorteos se tratan como eventos independientes.",
      "El historico describe el pasado y no determina resultados futuros.",
      riesgo.advertencia,
    ],
  };
}

module.exports = { explicarAnalisis };
