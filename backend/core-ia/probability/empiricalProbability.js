function probabilidadesEmpiricas(frecuencias, totalApariciones) {
  return frecuencias.map(({ numero, veces }) => ({
    numero,
    probabilidadEmpiricaHistorica: totalApariciones ? veces / totalApariciones : 0,
    nota: "Proporcion observada en el historico; no es probabilidad del proximo sorteo.",
  }));
}

module.exports = { probabilidadesEmpiricas };
