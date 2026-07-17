const { ordenarCronologico } = require("./statisticsEngine");

function calcularTendencias(resultados) {
  const porFecha = new Map();
  ordenarCronologico(resultados).forEach((resultado) => {
    porFecha.set(resultado.fecha, (porFecha.get(resultado.fecha) || 0) + resultado.numeros.length);
  });
  const puntos = [...porFecha.entries()].map(([fecha, apariciones], indice) => ({ fecha, apariciones, indice }));
  const n = puntos.length;
  const sumaX = puntos.reduce((suma, p) => suma + p.indice, 0);
  const sumaY = puntos.reduce((suma, p) => suma + p.apariciones, 0);
  const sumaXY = puntos.reduce((suma, p) => suma + p.indice * p.apariciones, 0);
  const sumaX2 = puntos.reduce((suma, p) => suma + p.indice ** 2, 0);
  const denominador = n * sumaX2 - sumaX ** 2;
  const pendiente = denominador ? (n * sumaXY - sumaX * sumaY) / denominador : 0;
  return {
    serieDiaria: puntos.map(({ fecha, apariciones }) => ({ fecha, apariciones })),
    pendienteHistorica: pendiente,
    descripcion: "Pendiente calculada sobre el historico observado; no proyecta valores futuros.",
  };
}

module.exports = { calcularTendencias };
