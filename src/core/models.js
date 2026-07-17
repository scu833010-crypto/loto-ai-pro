// ============================================================
// CORE — Entidades de dominio
// Sin dependencias de React Native, de la base de datos ni de la API.
// Reglas de negocio puras: si esto cambia, cambia el negocio, no la UI.
// ============================================================

/**
 * Tipos de juego soportados por lotería (extensible sin tocar el motor).
 */
export const TipoJuego = {
  QUINIELA: "QUINIELA",   // 1 número de 2 dígitos
  PALE: "PALE",           // 2 números de 2 dígitos
  TRIPLETA: "TRIPLETA",   // 3 números de 2 dígitos
  MULTIPLE: "MULTIPLE",   // loto de varias bolas, cuartetas, formatos especiales
};

/**
 * Catálogo de loterías dominicanas — alcance confirmado por el
 * usuario (2026-07-17): Lotería Nacional, Leidsa, Loteka, Lotería
 * Real, La Primera, LoteDom, La Suerte Dominicana, Anguilla Lottery,
 * Nueva York y Florida. NO incluye King Lottery ni Haiti Bolet (fuera
 * de alcance). Nueva York y Florida muestran solo su quiniela
 * principal (Día/Noche) — sin Mega Millions, Powerball, Cash 4 Life,
 * Pick 2/3/4/5, etc., que son loterías/juegos aparte.
 *
 * Cada lotería puede tener VARIOS sorteos (juegos) — cada uno con su
 * propio nombre y hora, verificados contra el horario oficial
 * publicado en loteriasdominicanas.com/pagina/horarios (algunos
 * cambian de hora domingo, o solo sortean ciertos días de la semana;
 * ver backend/src/config/horarios.js, que es la fuente de verdad para
 * esa lógica día-por-día — este catálogo trae la hora "típica").
 */
export const Loterias = [
  {
    id: "loteria-nacional",
    nombre: "Lotería Nacional",
    colorKey: "nacional",
    sorteos: [
      { hora: "14:30", nombre: "Gana Más" },
      { hora: "14:30", nombre: "Juega + Pega +" },
      { hora: "21:00", nombre: "Lotería Nacional" }, // lunes a sábado
      { hora: "18:00", nombre: "Billetes Domingo" },  // solo domingo, reemplaza la Quiniela Nacional
    ],
  },
  {
    id: "leidsa",
    nombre: "Leidsa",
    colorKey: "leidsa",
    sorteos: [
      { hora: "20:55", nombre: "Quiniela Leidsa" },   // 15:55 los domingos
      { hora: "20:55", nombre: "Pega 3 Más" },        // 15:55 los domingos
      { hora: "20:55", nombre: "Loto Pool" },         // 15:55 los domingos
      { hora: "20:55", nombre: "Súper Kino TV" },     // 15:55 los domingos
      { hora: "20:55", nombre: "Súper Palé" },        // 15:55 los domingos
      { hora: "20:55", nombre: "Loto - Super Loto Más" }, // solo miércoles y sábado
    ],
  },
  {
    id: "real",
    nombre: "Lotería Real",
    colorKey: "real",
    sorteos: [
      { hora: "12:55", nombre: "Quiniela Real" },
      { hora: "12:55", nombre: "Tu Fecha Real" },
      { hora: "12:55", nombre: "Súper Palé" },
      { hora: "12:55", nombre: "Pega 4 Real" },
      { hora: "12:55", nombre: "Loto Pool Real" },
      { hora: "12:55", nombre: "Nueva Yol Real" },
      { hora: "12:55", nombre: "Loto Real" }, // solo miércoles y sábado
      { hora: "20:00", nombre: "Chance Real" },
      { hora: "20:00", nombre: "Repartidera Real" },
      { hora: "20:00", nombre: "Loto Pool Noche" },
    ],
  },
  {
    id: "loteka",
    nombre: "Loteka",
    colorKey: "loteka",
    sorteos: [
      { hora: "19:55", nombre: "Quiniela Loteka" },
      { hora: "19:55", nombre: "Mega Chances" },
      { hora: "19:55", nombre: "MC Repartidera" },
      { hora: "19:55", nombre: "Toca 3" },
      { hora: "19:55", nombre: "MegaLotto" }, // solo lunes y jueves
    ],
  },
  {
    id: "la-primera",
    nombre: "La Primera",
    colorKey: "primera",
    sorteos: [
      { hora: "12:00", nombre: "La Primera Día" },
      { hora: "12:00", nombre: "El Quinielón Día" },
      { hora: "20:00", nombre: "Primera Noche" },
      { hora: "20:00", nombre: "Loto 5" },
      { hora: "20:00", nombre: "El Quinielón Noche" },
    ],
  },
  {
    id: "la-suerte",
    nombre: "La Suerte Dominicana",
    colorKey: "suerte",
    sorteos: [
      { hora: "12:30", nombre: "La Suerte 12:30" },
      { hora: "18:00", nombre: "La Suerte 18:00" },
    ],
  },
  {
    id: "lotedom",
    nombre: "Lotedom",
    colorKey: "lotedom",
    sorteos: [
      { hora: "12:00", nombre: "Quiniela LoteDom" },
      { hora: "12:00", nombre: "El Quemaito Mayor" },
      { hora: "12:00", nombre: "Súper Palé LoteDom" },
      { hora: "12:00", nombre: "Agarra 4" },
    ],
  },
  {
    id: "anguila",
    nombre: "Anguilla Lottery",
    colorKey: "anguila",
    sorteos: [
      { hora: "08:00", nombre: "Anguila 8:00 AM" },
      { hora: "09:00", nombre: "Anguila 9:00 AM" },
      { hora: "10:00", nombre: "Anguila 10:00 AM" },
      { hora: "11:00", nombre: "Anguila 11:00 AM" },
      { hora: "12:00", nombre: "Anguila 12:00 PM" },
      { hora: "13:00", nombre: "Anguila 1:00 PM" },
      { hora: "14:00", nombre: "Anguila 2:00 PM" },
      { hora: "15:00", nombre: "Anguila 3:00 PM" },
      { hora: "16:00", nombre: "Anguila 4:00 PM" },
      { hora: "17:00", nombre: "Anguila 5:00 PM" },
      { hora: "18:00", nombre: "Anguila 6:00 PM" },
      { hora: "19:00", nombre: "Anguila 7:00 PM" },
      { hora: "20:00", nombre: "Anguila 8:00 PM" },
      { hora: "21:00", nombre: "Anguila 9:00 PM" },
      { hora: "22:00", nombre: "Anguila 10:00 PM" },
      { hora: "10:00", nombre: "La Cuarteta 10:00 AM" },
      { hora: "13:00", nombre: "La Cuarteta 1:00 PM" },
      { hora: "18:00", nombre: "La Cuarteta 6:00 PM" },
      { hora: "21:00", nombre: "La Cuarteta 9:00 PM" },
    ],
  },
  {
    id: "nueva-york",
    nombre: "Nueva York",
    colorKey: "americana",
    sorteos: [
      { hora: "14:30", nombre: "New York Tarde" },
      { hora: "22:30", nombre: "New York Noche" },
    ],
  },
  {
    id: "florida",
    nombre: "Florida",
    colorKey: "florida",
    sorteos: [
      { hora: "13:30", nombre: "Florida Día" },
      { hora: "21:45", nombre: "Florida Noche" },
    ],
  },
];

/**
 * Valida que un número de juego esté dentro del rango permitido (00-99).
 */
export function validarNumero(numero) {
  const n = Number(numero);
  return Number.isInteger(n) && n >= 0 && n <= 99;
}

/**
 * Entidad Resultado: un sorteo publicado y validado.
 * Esta es la forma canónica que produce el Servicio de Sincronización
 * y que consume todo el resto de la aplicación.
 *
 * nombreJuego identifica el sorteo específico dentro de la lotería
 * (ej. "Chance Real" dentro de "La Real") — así dos sorteos de la
 * misma compañía nunca se confunden visualmente.
 */
export class Resultado {
  constructor({
    id,
    loteriaId,
    fecha,
    hora,
    tipoJuego,
    numeros,
    fuente,
    version = 1,
    nombreJuego = null,
    money = null,
    actualizadoEn = null,
    seRealizaEseDia = null,
  }) {
    this.id = id;
    this.loteriaId = loteriaId;
    this.fecha = fecha;           // ISO string 'YYYY-MM-DD'
    this.hora = hora;              // 'HH:mm'
    this.tipoJuego = tipoJuego;    // TipoJuego.*
    this.numeros = numeros;        // array de strings de 2 dígitos, ej. ['34'] o ['34','56']
    this.fuente = fuente;          // texto: fuente oficial del dato
    this.version = version;        // para versionado/auditoría
    this.nombreJuego = nombreJuego; // nombre específico del sorteo (opcional)
    this.money = money;             // bote/jackpot, cuando el sorteo lo tiene (opcional)
    this.actualizadoEn = actualizadoEn; // timestamp real de la última actualización (opcional)
    this.seRealizaEseDia = seRealizaEseDia; // true/false/null — si el sorteo corre ese día de la semana
  }

  esValido() {
    if (!Array.isArray(this.numeros) || this.numeros.length === 0) return false;
    return this.numeros.every((n) => validarNumero(n));
  }
}

/**
 * Entidad Combinacion: conjunto de números que el usuario guarda para
 * comparar contra resultados futuros (no implica apuesta real).
 */
export class Combinacion {
  constructor({ id, nombre, loteriaId, tipoJuego, numeros, creadaEn }) {
    this.id = id;
    this.nombre = nombre;
    this.loteriaId = loteriaId;
    this.tipoJuego = tipoJuego;
    this.numeros = numeros;
    this.creadaEn = creadaEn;
  }
}

/**
 * Entidad Inversion: jugada registrada manualmente por el usuario
 * para llevar control de gasto/ganancia. Puramente informativo:
 * la app no procesa pagos ni apuestas reales.
 */
export class Inversion {
  constructor({ id, combinacionId, monto, fecha, resultadoCoincidente = null, gananciaEstimada = 0 }) {
    this.id = id;
    this.combinacionId = combinacionId;
    this.monto = monto;
    this.fecha = fecha;
    this.resultadoCoincidente = resultadoCoincidente;
    this.gananciaEstimada = gananciaEstimada;
  }
}

export function obtenerLoteriaPorId(id) {
  return Loterias.find((l) => l.id === id) || null;
}
