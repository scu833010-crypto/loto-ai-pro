// ============================================================
// GENERADOR DE COMBINACIONES — a partir de un conjunto de números
// elegidos por el usuario, genera TODAS las parejas (Palé) o
// tripletas posibles entre ellos. Combinatoria pura (nCr), no
// estadística ni predicción.
// ============================================================

/**
 * Todas las combinaciones de 2 elementos (Palé) sin repetir orden:
 * [12,34,56] -> [[12,34],[12,56],[34,56]]
 */
export function generarPales(numeros) {
  const combinaciones = [];
  for (let i = 0; i < numeros.length; i++) {
    for (let j = i + 1; j < numeros.length; j++) {
      combinaciones.push([numeros[i], numeros[j]]);
    }
  }
  return combinaciones;
}

/**
 * Todas las combinaciones de 3 elementos (Tripleta) sin repetir orden.
 */
export function generarTripletas(numeros) {
  const combinaciones = [];
  for (let i = 0; i < numeros.length; i++) {
    for (let j = i + 1; j < numeros.length; j++) {
      for (let k = j + 1; k < numeros.length; k++) {
        combinaciones.push([numeros[i], numeros[j], numeros[k]]);
      }
    }
  }
  return combinaciones;
}

/**
 * Cuántas combinaciones habrá sin generarlas (para avisar antes de
 * generar si el conjunto es grande). nCr clásico.
 */
export function contarCombinaciones(n, r) {
  if (r > n) return 0;
  let resultado = 1;
  for (let i = 0; i < r; i++) {
    resultado = (resultado * (n - i)) / (i + 1);
  }
  return Math.round(resultado);
}
