function resumenMatematico(resultados) {
  const sumas = resultados.flatMap((r) => r.numeros.map((numero) => Number(numero))).reduce((total, valor) => total + valor, 0);
  const cantidad = resultados.reduce((total, r) => total + r.numeros.length, 0);
  return {
    totalApariciones: cantidad,
    promedioNumericoHistorico: cantidad ? sumas / cantidad : 0,
    alcance: "Resumen matematico de datos pasados; no es una proyeccion.",
  };
}

module.exports = { resumenMatematico };
