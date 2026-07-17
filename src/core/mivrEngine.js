// ============================================================
// MIVR — Módulo de Inversión y Verificación de Resultados.
// Lógica pura: recibe datos, devuelve si hubo coincidencia.
// No conoce AsyncStorage ni React Native.
// ============================================================

import { TipoJuego } from "./models";

/**
 * Verifica si una inversión (ligada a una combinación) coincidió con
 * algún resultado publicado desde la fecha de la inversión en adelante.
 *
 * - QUINIELA: coincide si el número de la combinación salió en cualquier
 *   sorteo de esa lotería desde la fecha de la inversión.
 * - PALE / TRIPLETA: coincide si TODOS los números de la combinación
 *   aparecieron el mismo día (agregando todos los sorteos de ese día
 *   para esa lotería), ya que estas jugadas combinan varios números
 *   publicados en la jornada.
 */
export function verificarInversion(inversion, combinacion, resultadosLoteria) {
  const resultadosDesdeFecha = resultadosLoteria.filter((r) => r.fecha >= inversion.fecha);

  if (combinacion.tipoJuego === TipoJuego.QUINIELA) {
    const numeroBuscado = combinacion.numeros[0];
    const acierto = resultadosDesdeFecha.find((r) => r.numeros.includes(numeroBuscado));
    return acierto ? { coincide: true, resultado: acierto } : { coincide: false, resultado: null };
  }

  // PALE / TRIPLETA
  const porFecha = {};
  resultadosDesdeFecha.forEach((r) => {
    porFecha[r.fecha] = porFecha[r.fecha] || [];
    porFecha[r.fecha].push(...r.numeros);
  });

  const fechasOrdenadas = Object.keys(porFecha).sort();
  for (const fecha of fechasOrdenadas) {
    const numerosDelDia = porFecha[fecha];
    const todosPresentes = combinacion.numeros.every((n) => numerosDelDia.includes(n));
    if (todosPresentes) {
      return { coincide: true, resultado: { fecha, numeros: numerosDelDia } };
    }
  }
  return { coincide: false, resultado: null };
}

/**
 * Calcula la ganancia estimada según el monto y un factor de pago
 * referencial (ver payoutRules.js). Devuelve 0 si el tipo de juego
 * no tiene factor configurado.
 */
export function calcularGanancia(monto, tipoJuego, factorPago) {
  return monto * (factorPago[tipoJuego] || 0);
}
