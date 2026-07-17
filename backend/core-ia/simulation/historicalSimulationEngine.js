function simularVentanasHistoricas(resultados, tamanoVentana = 30) {
  if (!Number.isInteger(tamanoVentana) || tamanoVentana < 1) throw new Error("tamanoVentana debe ser un entero positivo.");
  const ventanas = [];
  for (let inicio = 0; inicio + tamanoVentana <= resultados.length; inicio += tamanoVentana) {
    const ventana = resultados.slice(inicio, inicio + tamanoVentana);
    ventanas.push({ inicio, fin: inicio + ventana.length - 1, resultadosUsados: ventana.length, ids: ventana.map((r) => r.id) });
  }
  return {
    tipo: "reproduccion_de_ventanas_historicas",
    ventanas,
    limitacion: "Solo reorganiza observaciones historicas existentes; no genera resultados ficticios.",
  };
}

module.exports = { simularVentanasHistoricas };
