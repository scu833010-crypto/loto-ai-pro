function evaluarCoberturaContraAzar(resultados, topFrecuencias, opciones = {}) {
  const ventana = opciones.ventana || 30;
  const cantidad = opciones.cantidad || 5;
  const ordenados = [...resultados];
  let muestras = 0;
  let aciertos = 0;
  let esperado = 0;
  for (let i = ventana; i < ordenados.length; i++) {
    const seleccion = new Set(topFrecuencias(ordenados.slice(i - ventana, i)).slice(0, cantidad).map((x) => x.numero));
    const extraidos = new Set(ordenados[i].numeros);
    const exito = [...extraidos].some((n) => seleccion.has(n));
    let sinCoincidencia = 1;
    for (let posicion = 0; posicion < extraidos.size; posicion++) {
      sinCoincidencia *= (100 - cantidad - posicion) / (100 - posicion);
    }
    const p = 1 - Math.max(0, sinCoincidencia);
    muestras += 1;
    aciertos += exito ? 1 : 0;
    esperado += p;
  }
  return {
    hipotesis: "cobertura_de_frecuencias_vs_azar",
    ventana,
    cantidad,
    muestras,
    tasaObservada: muestras ? aciertos / muestras : null,
    tasaBaseAleatoria: muestras ? esperado / muestras : null,
    limitacion: "Evaluacion retrospectiva; no predice ni recomienda numeros.",
  };
}

module.exports = { evaluarCoberturaContraAzar };
