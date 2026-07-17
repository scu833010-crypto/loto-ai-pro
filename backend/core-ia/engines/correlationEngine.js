function correlacionPhi(resultados, numeroA, numeroB) {
  let ambos = 0; let soloA = 0; let soloB = 0; let ninguno = 0;
  resultados.forEach((resultado) => {
    const tieneA = resultado.numeros.includes(numeroA);
    const tieneB = resultado.numeros.includes(numeroB);
    if (tieneA && tieneB) ambos += 1;
    else if (tieneA) soloA += 1;
    else if (tieneB) soloB += 1;
    else ninguno += 1;
  });
  const denominador = Math.sqrt((ambos + soloA) * (soloB + ninguno) * (ambos + soloB) * (soloA + ninguno));
  return {
    numeroA,
    numeroB,
    coeficientePhi: denominador ? (ambos * ninguno - soloA * soloB) / denominador : 0,
    observaciones: resultados.length,
    limitacion: "Correlacion observada no implica causalidad ni predice sorteos posteriores.",
  };
}

module.exports = { correlacionPhi };
