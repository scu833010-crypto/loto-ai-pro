// ============================================================
// RANKING ENGINE
// Ordena los números de UNA lotería por su frecuencia histórica real.
// A propósito, esto es TODO lo que hace: no combina la frecuencia con
// ninguna otra señal en un "puntaje" o "índice" compuesto, porque
// cualquier combinación así sería una fórmula inventada presentada
// como si midiera algo real sobre el próximo sorteo (que es un evento
// independiente del historial). Ranking = orden por conteo, y nada más.
// ============================================================

import { calcularFrecuenciaPorLoteria } from "../statsEngine";

/**
 * Ranking de números por frecuencia histórica real, para UNA lotería.
 * Cada posición incluye una explicación en texto plano de por qué está
 * ahí (siempre: "salió N veces en el histórico"), nunca un puntaje.
 */
export function generarRanking(resultados, loteriaId, top = 10) {
  const frecuencias = calcularFrecuenciaPorLoteria(resultados, loteriaId);
  return frecuencias.slice(0, top).map((item, idx) => ({
    posicion: idx + 1,
    numero: item.numero,
    veces: item.veces,
    explicacion:
      idx === 0
        ? `Es el número que más veces apareció en el histórico cargado de esta lotería (${item.veces} veces).`
        : `Ocupa el puesto ${idx + 1} por frecuencia histórica, con ${item.veces} apariciones registradas.`,
  }));
}

export default { generarRanking };
