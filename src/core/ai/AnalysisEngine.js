// ============================================================
// ANALYSIS ENGINE
// Punto único de entrada para pedir "todo el análisis" de una lotería:
// junta frecuencia, números calientes, tendencia diaria/semanal/mensual,
// palés y tríos — todo llamando a StatsEngine (nunca lo reemplaza ni
// lo duplica). Incluye una caché en memoria para no recalcular lo
// mismo dos veces si no cambiaron los datos (se invalida sola en
// cuanto llega un resultado nuevo).
//
// Esto es, a propósito, el techo de lo que este motor hace: describe
// el histórico. No genera un puntaje de "qué tan probable es ganar"
// para ningún número — ver RankingEngine.js para la explicación larga
// de por qué esa pieza no existe aquí.
// ============================================================

import {
  filtrarPorLoteria,
  calcularFrecuencias,
  tendenciaDiaria,
  tendenciaSemanal,
  tendenciaMensual,
  calcularPalesFrecuentes,
  calcularTriosFrecuentes,
  calidadDeDatos,
} from "../statsEngine";
import { generarRanking } from "./RankingEngine";

const cache = new Map();

function claveCache(loteriaId, resultadosLoteria) {
  const ultimoId = resultadosLoteria.length > 0 ? resultadosLoteria[resultadosLoteria.length - 1].id : "vacio";
  return `${loteriaId}:${resultadosLoteria.length}:${ultimoId}`;
}

/**
 * Análisis completo de una lotería a partir del histórico GLOBAL
 * (se encarga de filtrar por loteriaId internamente — nunca mezcla
 * loterías). Cachea el resultado mientras no cambien los datos de
 * esa lotería puntual.
 */
export function analizarLoteria(todosLosResultados, loteriaId) {
  const resultadosLoteria = filtrarPorLoteria(todosLosResultados, loteriaId);
  const clave = claveCache(loteriaId, resultadosLoteria);

  if (cache.has(clave)) return cache.get(clave);

  const frecuencias = calcularFrecuencias(resultadosLoteria);
  const numeroTop = frecuencias[0]?.numero ?? null;

  const analisis = {
    loteriaId,
    totalResultados: resultadosLoteria.length,
    calidad: calidadDeDatos(resultadosLoteria, 90),
    ranking: generarRanking(todosLosResultados, loteriaId, 10),
    numerosCalientes: frecuencias.slice(0, 5),
    tendenciaNumeroTop: numeroTop
      ? {
          numero: numeroTop,
          diaria: tendenciaDiaria(resultadosLoteria, numeroTop, 14),
          semanal: tendenciaSemanal(resultadosLoteria, numeroTop, 8),
          mensual: tendenciaMensual(resultadosLoteria, numeroTop, 6),
        }
      : null,
    pales: calcularPalesFrecuentes(resultadosLoteria, 8),
    trios: calcularTriosFrecuentes(resultadosLoteria, 8),
    calculadoEn: new Date().toISOString(),
  };

  cache.set(clave, analisis);
  return analisis;
}

/**
 * Compara varias loterías entre sí usando SOLO métricas ya calculadas
 * por separado (nunca mezcla los números de una lotería con los de
 * otra) — útil para el panel de "comparación entre loterías".
 */
export function compararLoterias(todosLosResultados, loteriaIds) {
  return loteriaIds.map((id) => {
    const analisis = analizarLoteria(todosLosResultados, id);
    return {
      loteriaId: id,
      totalResultados: analisis.totalResultados,
      coberturaPorcentaje: analisis.calidad.coberturaPorcentaje,
      numeroMasFrecuente: analisis.numerosCalientes[0] ?? null,
    };
  });
}

/**
 * Limpia la caché por completo (útil tras una sincronización manual
 * grande, o en pruebas).
 */
export function limpiarCache() {
  cache.clear();
}

export default { analizarLoteria, compararLoterias, limpiarCache };
