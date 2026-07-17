// ============================================================
// HORARIOS OFICIALES POR SORTEO
//
// Fuente: https://loteriasdominicanas.com/pagina/horarios (verificado
// dos veces, 2026-07-16 y 2026-07-17 — contenido idéntico).
//
// Alcance alineado con catalogoGameIds.js: sin King Lottery ni Haiti
// Bolet, y Nueva York/Florida reducidos a su quiniela principal.
//
// Se indexa por clave compuesta "loteriaId::nombreJuego" porque
// varios nombres podrían repetirse entre loterías con horarios
// distintos (se cuidó especialmente al separar Nueva York de
// Florida, que antes compartían un solo "loteriaId: americana").
//
// IMPORTANTE: los horarios pueden variar en días feriados (ver la
// misma página oficial). Este catálogo cubre el horario normal; no
// hay, por ahora, un calendario de excepciones por feriado.
// ============================================================

// getDay(): 0=domingo, 1=lunes, ... 6=sábado
const LUN_A_SAB = [1, 2, 3, 4, 5, 6];
const TODOS_LOS_DIAS = [0, 1, 2, 3, 4, 5, 6];
const SOLO_DOMINGO = [0];
const MIE_Y_SAB = [3, 6]; // Loto Real (verificado en su página individual)
const MIE_Y_SAB_LEIDSA = [3, 6]; // Loto Leidsa
const LUN_Y_JUE = [1, 4]; // MegaLotto

/**
 * Cada entrada define en qué días de la semana se realiza el sorteo y
 * a qué hora. "horaDomingo" es opcional — solo se usa si el domingo
 * tiene un horario distinto al resto de la semana.
 */
const HORARIOS = {
  // ---------- LOTERÍA NACIONAL ----------
  "loteria-nacional::Lotería Nacional": { dias: LUN_A_SAB, hora: "21:00" },
  "loteria-nacional::Billetes Domingo": { dias: SOLO_DOMINGO, hora: "18:00" },
  "loteria-nacional::Gana Más": { dias: TODOS_LOS_DIAS, hora: "14:30" },
  "loteria-nacional::Juega + Pega +": { dias: TODOS_LOS_DIAS, hora: "14:30" },

  // ---------- LEIDSA ----------
  "leidsa::Quiniela Leidsa": { dias: TODOS_LOS_DIAS, hora: "20:55", horaDomingo: "15:55" },
  "leidsa::Pega 3 Más": { dias: TODOS_LOS_DIAS, hora: "20:55", horaDomingo: "15:55" },
  "leidsa::Loto Pool": { dias: TODOS_LOS_DIAS, hora: "20:55", horaDomingo: "15:55" },
  "leidsa::Súper Kino TV": { dias: TODOS_LOS_DIAS, hora: "20:55", horaDomingo: "15:55" },
  "leidsa::Súper Palé": { dias: TODOS_LOS_DIAS, hora: "20:55", horaDomingo: "15:55" },
  "leidsa::Loto - Super Loto Más": { dias: MIE_Y_SAB_LEIDSA, hora: "20:55" },

  // ---------- LOTERÍA REAL ----------
  "real::Quiniela Real": { dias: TODOS_LOS_DIAS, hora: "12:55" },
  "real::Tu Fecha Real": { dias: TODOS_LOS_DIAS, hora: "12:55" },
  "real::Súper Palé": { dias: TODOS_LOS_DIAS, hora: "12:55" },
  "real::Pega 4 Real": { dias: TODOS_LOS_DIAS, hora: "12:55" },
  "real::Loto Pool Real": { dias: TODOS_LOS_DIAS, hora: "12:55" },
  "real::Nueva Yol Real": { dias: TODOS_LOS_DIAS, hora: "12:55" },
  "real::Loto Real": { dias: MIE_Y_SAB, hora: "12:55" },
  "real::Chance Real": { dias: TODOS_LOS_DIAS, hora: "20:00" },
  "real::Repartidera Real": { dias: TODOS_LOS_DIAS, hora: "20:00" },
  "real::Loto Pool Noche": { dias: TODOS_LOS_DIAS, hora: "20:00" },

  // ---------- LOTEKA ----------
  "loteka::Quiniela Loteka": { dias: TODOS_LOS_DIAS, hora: "19:55" },
  "loteka::Mega Chances": { dias: TODOS_LOS_DIAS, hora: "19:55" },
  "loteka::MC Repartidera": { dias: TODOS_LOS_DIAS, hora: "19:55" },
  "loteka::Toca 3": { dias: TODOS_LOS_DIAS, hora: "19:55" },
  "loteka::MegaLotto": { dias: LUN_Y_JUE, hora: "19:55" },

  // ---------- LOTEDOM ----------
  "lotedom::Quiniela LoteDom": { dias: TODOS_LOS_DIAS, hora: "12:00" },
  "lotedom::El Quemaito Mayor": { dias: TODOS_LOS_DIAS, hora: "12:00" },
  "lotedom::Súper Palé LoteDom": { dias: TODOS_LOS_DIAS, hora: "12:00" },
  "lotedom::Agarra 4": { dias: TODOS_LOS_DIAS, hora: "12:00" },

  // ---------- LA PRIMERA ----------
  "la-primera::La Primera Día": { dias: TODOS_LOS_DIAS, hora: "12:00" },
  "la-primera::El Quinielón Día": { dias: TODOS_LOS_DIAS, hora: "12:00" },
  "la-primera::Primera Noche": { dias: TODOS_LOS_DIAS, hora: "20:00" },
  "la-primera::Loto 5": { dias: TODOS_LOS_DIAS, hora: "20:00" },
  "la-primera::El Quinielón Noche": { dias: TODOS_LOS_DIAS, hora: "20:00" },

  // ---------- LA SUERTE DOMINICANA ----------
  "la-suerte::La Suerte 12:30": { dias: TODOS_LOS_DIAS, hora: "12:30" },
  "la-suerte::La Suerte 18:00": { dias: TODOS_LOS_DIAS, hora: "18:00" },

  // ---------- NUEVA YORK (quiniela principal, solo Día/Noche) ----------
  "nueva-york::New York Tarde": { dias: TODOS_LOS_DIAS, hora: "14:30" },
  "nueva-york::New York Noche": { dias: TODOS_LOS_DIAS, hora: "22:30" },

  // ---------- FLORIDA (quiniela principal, solo Día/Noche) ----------
  "florida::Florida Día": { dias: TODOS_LOS_DIAS, hora: "13:30" },
  "florida::Florida Noche": { dias: TODOS_LOS_DIAS, hora: "21:45" },
};

// Excepciones fechadas (feriados, suspensiones y horarios especiales).
// Se administran como datos; no se cambia la lógica principal al agregar
// una. Forma: "YYYY-MM-DD::loteriaId::nombreJuego": { hora, seRealizaEseDia }.
const EXCEPCIONES_HORARIOS = {};

// Sorteos cuyo NOMBRE ya trae la hora incluida (Anguila, ej. "Anguila
// 8:00 AM", "La Cuarteta 6:00 PM"). Para estos se extrae la hora
// directamente del texto en vez de mantener una tabla aparte.
const REGEX_HORA_EN_NOMBRE = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;

function horaDesdeNombre(nombreJuego) {
  const m = nombreJuego.match(REGEX_HORA_EN_NOMBRE);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2];
  const ampm = m[3];
  if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
  if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

/**
 * Calcula la hora oficial de un sorteo para una fecha dada.
 * Devuelve { hora: "HH:MM"|null, seRealizaEseDia: boolean|null }.
 * seRealizaEseDia=false: según el horario oficial, esa lotería no
 * sortea ese día de la semana (ej. Loto Real un lunes).
 * seRealizaEseDia=null: el sorteo no está en este catálogo todavía.
 */
function calcularHorario(nombreJuego, loteriaId, fechaISO) {
  const clave = `${fechaISO}::${loteriaId}::${nombreJuego}`;
  const excepcion = EXCEPCIONES_HORARIOS[clave];
  if (excepcion) {
    return { hora: excepcion.hora || null, seRealizaEseDia: Boolean(excepcion.seRealizaEseDia) };
  }
  const desdeNombre = horaDesdeNombre(nombreJuego);
  if (desdeNombre) return { hora: desdeNombre, seRealizaEseDia: true };

  const config = HORARIOS[`${loteriaId}::${nombreJuego}`];
  if (!config) return { hora: null, seRealizaEseDia: null }; // sin catalogar, no se inventa

  const fecha = new Date(`${fechaISO}T12:00:00Z`); // mediodía UTC evita corrimiento de día
  const diaSemana = fecha.getUTCDay();
  const seRealizaEseDia = config.dias.includes(diaSemana);
  const hora = diaSemana === 0 && config.horaDomingo ? config.horaDomingo : config.hora;

  return { hora, seRealizaEseDia };
}

module.exports = { calcularHorario, horaDesdeNombre, EXCEPCIONES_HORARIOS };
