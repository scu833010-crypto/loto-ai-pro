const UNIVERSO = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, "0"));

function ordenarCronologico(resultados) {
  return [...resultados].sort((a, b) => `${a.fecha}T${a.hora || "00:00"}`.localeCompare(`${b.fecha}T${b.hora || "00:00"}`));
}

function frecuencias(resultados) {
  const conteo = Object.fromEntries(UNIVERSO.map((numero) => [numero, 0]));
  resultados.forEach((r) => r.numeros.forEach((numero) => { conteo[numero] += 1; }));
  const totalApariciones = resultados.reduce((total, r) => total + r.numeros.length, 0);
  return Object.entries(conteo)
    .map(([numero, veces]) => ({ numero, veces, frecuenciaRelativa: totalApariciones ? veces / totalApariciones : 0 }))
    .sort((a, b) => b.veces - a.veces || a.numero.localeCompare(b.numero));
}

function retrasos(resultados) {
  const descendente = ordenarCronologico(resultados).reverse();
  const primeraPosicion = Object.fromEntries(UNIVERSO.map((numero) => [numero, null]));
  descendente.forEach((r, indice) => r.numeros.forEach((numero) => {
    if (primeraPosicion[numero] === null) primeraPosicion[numero] = indice;
  }));
  return Object.entries(primeraPosicion)
    .map(([numero, sorteosSinAparicion]) => ({ numero, sorteosSinAparicion: sorteosSinAparicion ?? descendente.length }))
    .sort((a, b) => b.sorteosSinAparicion - a.sorteosSinAparicion || a.numero.localeCompare(b.numero));
}

function distribuciones(resultados) {
  const decenas = Array(10).fill(0);
  const terminaciones = Array(10).fill(0);
  let pares = 0;
  let impares = 0;
  resultados.forEach((r) => r.numeros.forEach((numero) => {
    const valor = Number(numero);
    decenas[Math.floor(valor / 10)] += 1;
    terminaciones[valor % 10] += 1;
    if (valor % 2 === 0) pares += 1; else impares += 1;
  }));
  return { decenas, terminaciones, pares, impares };
}

function patronesConjuntos(resultados, tamano = 2, limite = 10) {
  const conteo = new Map();
  resultados.forEach((r) => {
    const numeros = [...new Set(r.numeros)].sort();
    const visitar = (inicio, acumulado) => {
      if (acumulado.length === tamano) {
        const clave = acumulado.join("-");
        conteo.set(clave, (conteo.get(clave) || 0) + 1);
        return;
      }
      for (let i = inicio; i < numeros.length; i++) visitar(i + 1, [...acumulado, numeros[i]]);
    };
    visitar(0, []);
  });
  return [...conteo.entries()].map(([patron, veces]) => ({ patron, veces })).sort((a, b) => b.veces - a.veces).slice(0, limite);
}

module.exports = { ordenarCronologico, frecuencias, retrasos, distribuciones, patronesConjuntos };
