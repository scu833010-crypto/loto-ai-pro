// ============================================================
// MEZCLADOR — técnicas numéricas tradicionales usadas por jugadores
// para derivar números relacionados a partir de uno base.
//
// IMPORTANTE: esto son transformaciones matemáticas fijas sobre el
// número que el usuario ingresa (invertir dígitos, vecinos, etc.),
// igual que en un cuaderno de jugador. No analizan el histórico,
// no son estadística y no predicen ningún sorteo. Se presentan
// siempre como "combinaciones derivadas", nunca como pronóstico.
// ============================================================

function n2(n) {
  const x = ((n % 100) + 100) % 100; // siempre en rango 00-99
  return String(x).padStart(2, "0");
}

/**
 * Invierte los dos dígitos: 56 -> 65.
 */
export function invertido(numero) {
  const [d1, d2] = numero.split("");
  return `${d2}${d1}`;
}

/**
 * Complemento a 9 ("el 9"): cada dígito se resta de 9. 56 -> 43.
 */
export function complementoA9(numero) {
  const [d1, d2] = numero.split("").map(Number);
  return `${9 - d1}${9 - d2}`;
}

/**
 * Vecinos: el número inmediatamente anterior y siguiente (con vuelta 00-99).
 */
export function vecinoAnterior(numero) {
  return n2(Number(numero) - 1);
}
export function vecinoSiguiente(numero) {
  return n2(Number(numero) + 1);
}

/**
 * Suma de los dos dígitos, reducida a un solo dígito ("el 6" / la reducción
 * numerológica tradicional): 56 -> 5+6=11 -> 1+1=2.
 */
export function sumaReducida(numero) {
  let n = numero.split("").reduce((acc, d) => acc + Number(d), 0);
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return String(n).padStart(2, "0");
}

/**
 * El doble del número, en módulo 100: 56 -> 112 -> 12.
 */
export function doble(numero) {
  return n2(Number(numero) * 2);
}

/**
 * Genera el set completo de combinaciones derivadas para un número base.
 * Devuelve [{ id, tecnica, numero, descripcion }] listo para pintar en UI.
 */
export function generarMezcla(numeroBase) {
  return [
    {
      id: "invertido",
      tecnica: "Invertido",
      numero: invertido(numeroBase),
      descripcion: "Los mismos dígitos, en orden contrario",
    },
    {
      id: "complemento9",
      tecnica: "Complemento a 9",
      numero: complementoA9(numeroBase),
      descripcion: "Cada dígito restado de 9",
    },
    {
      id: "vecinoAnterior",
      tecnica: "Vecino anterior",
      numero: vecinoAnterior(numeroBase),
      descripcion: "Un número antes",
    },
    {
      id: "vecinoSiguiente",
      tecnica: "Vecino siguiente",
      numero: vecinoSiguiente(numeroBase),
      descripcion: "Un número después",
    },
    {
      id: "sumaReducida",
      tecnica: "Suma reducida",
      numero: sumaReducida(numeroBase),
      descripcion: "Dígitos sumados hasta quedar en uno solo",
    },
    {
      id: "doble",
      tecnica: "Doble",
      numero: doble(numeroBase),
      descripcion: "El número base multiplicado por 2",
    },
  ];
}
