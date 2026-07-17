function evaluarRiesgoDatos(resultados, diasEsperados) {
  const fechas = new Set(resultados.map((r) => r.fecha));
  const cobertura = diasEsperados > 0 ? fechas.size / diasEsperados : 0;
  return {
    diasConDatos: fechas.size,
    diasEsperados,
    coberturaPorcentaje: Math.round(cobertura * 100),
    nivel: cobertura < 0.5 ? "alto" : cobertura < 0.8 ? "medio" : "bajo",
    advertencia: "La cobertura mide disponibilidad de datos; no mide capacidad predictiva.",
  };
}

module.exports = { evaluarRiesgoDatos };
