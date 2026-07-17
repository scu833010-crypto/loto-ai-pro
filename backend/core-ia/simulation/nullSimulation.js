function promedioEsperadoPorAzar(intentos, probabilidad) {
  return { intentos, probabilidad, coincidenciasEsperadas: intentos * probabilidad };
}

module.exports = { promedioEsperadoPorAzar };
