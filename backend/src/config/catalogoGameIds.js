// ============================================================
// CATÁLOGO game_id -> sorteo real
//
// Alcance confirmado por el usuario (2026-07-17): solo las loterías
// de interés. Se excluyeron a propósito:
//  - King Lottery y Haiti Bolet (no están en la lista de interés)
//  - Todos los sub-juegos americanos que NO son la quiniela principal
//    de Nueva York/Florida (Mega Millions, Powerball, Cash 4 Life,
//    Pick 2/3/4/5, Win 4, Numbers, Take 5, NY Lotto, Florida Lotto,
//    Jackpot Triple Play — son loterías/juegos aparte, no la quiniela
//    "Nueva York"/"Florida" que se pedía)
//
// Este mapeo se extrajo del payload __NUXT_DATA__ público de
// loteriasdominicanas.com y se verificó contra resultados reales de
// https://api.loteriasdominicanas.com/dominicana/sessions.
//
// Un game_id no listado aquí simplemente se omite en la respuesta —
// así es como se "quitan" King Lottery/Haiti Bolet/sub-juegos: dejan
// de aparecer, pero no rompe nada si se necesitan de vuelta después
// (solo hay que volver a agregar sus líneas, ya están documentadas
// en el historial del proyecto).
// ============================================================

const CATALOGO_BASE = {
  // ---------- LEIDSA ----------
  "6966a6d1ea7015c3b8a3d44d": { loteriaId: "leidsa", nombreJuego: "Loto - Super Loto Más" },
  "6966a6d1ea7015c3b8a3d453": { loteriaId: "leidsa", nombreJuego: "Quiniela Leidsa" },
  "6966a6d1ea7015c3b8a3d459": { loteriaId: "leidsa", nombreJuego: "Súper Kino TV" },
  "6966a6d1ea7015c3b8a3d45f": { loteriaId: "leidsa", nombreJuego: "Loto Pool" },
  "6966a6d1ea7015c3b8a3d465": { loteriaId: "leidsa", nombreJuego: "Súper Palé" },
  "6966a6d1ea7015c3b8a3d471": { loteriaId: "leidsa", nombreJuego: "Pega 3 Más" },

  // ---------- LOTERÍA NACIONAL ----------
  "6966a6d1ea7015c3b8a3d47c": { loteriaId: "loteria-nacional", nombreJuego: "Lotería Nacional" },
  "6966a6d1ea7015c3b8a3d482": { loteriaId: "loteria-nacional", nombreJuego: "Gana Más" },
  "6966a6d2ea7015c3b8a3d488": { loteriaId: "loteria-nacional", nombreJuego: "Billetes Domingo" },
  "6966a6d2ea7015c3b8a3d48e": { loteriaId: "loteria-nacional", nombreJuego: "Juega + Pega +" },

  // ---------- LOTERÍA REAL ----------
  "6966a6d2ea7015c3b8a3d4a8": { loteriaId: "real", nombreJuego: "Loto Real" },
  "6966a6d2ea7015c3b8a3d4ae": { loteriaId: "real", nombreJuego: "Quiniela Real" },
  "6966a6d2ea7015c3b8a3d4b4": { loteriaId: "real", nombreJuego: "Súper Palé" },
  "6966a6d2ea7015c3b8a3d4ba": { loteriaId: "real", nombreJuego: "Tu Fecha Real" },
  "6966a6d2ea7015c3b8a3d4c0": { loteriaId: "real", nombreJuego: "Pega 4 Real" },
  "6966a6d2ea7015c3b8a3d4c6": { loteriaId: "real", nombreJuego: "Loto Pool Real" },
  "6966a6d2ea7015c3b8a3d4cc": { loteriaId: "real", nombreJuego: "Nueva Yol Real" },
  "69fd98465e76585b602695be": { loteriaId: "real", nombreJuego: "Chance Real" },
  "69fd98465e76585b602695c5": { loteriaId: "real", nombreJuego: "Repartidera Real" },
  "69fd98465e76585b602695cc": { loteriaId: "real", nombreJuego: "Loto Pool Noche" },

  // ---------- LOTEKA ----------
  "6966a6d2ea7015c3b8a3d4d7": { loteriaId: "loteka", nombreJuego: "Quiniela Loteka" },
  "6966a6d2ea7015c3b8a3d4dd": { loteriaId: "loteka", nombreJuego: "Mega Chances" },
  "6966a6d2ea7015c3b8a3d4e6": { loteriaId: "loteka", nombreJuego: "MegaLotto" },
  "6966a6d2ea7015c3b8a3d4ec": { loteriaId: "loteka", nombreJuego: "MC Repartidera" },
  "6966a6d2ea7015c3b8a3d4f2": { loteriaId: "loteka", nombreJuego: "Toca 3" },

  // ---------- NUEVA YORK (solo quiniela principal Día/Noche) ----------
  "6966a6d2ea7015c3b8a3d509": { loteriaId: "nueva-york", nombreJuego: "New York Tarde" },
  "6966a6d2ea7015c3b8a3d50f": { loteriaId: "nueva-york", nombreJuego: "New York Noche" },

  // ---------- FLORIDA (solo quiniela principal Día/Noche) ----------
  "6966a6d2ea7015c3b8a3d515": { loteriaId: "florida", nombreJuego: "Florida Día" },
  "6966a6d2ea7015c3b8a3d51b": { loteriaId: "florida", nombreJuego: "Florida Noche" },

  // ---------- LA PRIMERA ----------
  "6966a6d3ea7015c3b8a3d5c0": { loteriaId: "la-primera", nombreJuego: "La Primera Día" },
  "6966a6d3ea7015c3b8a3d5c6": { loteriaId: "la-primera", nombreJuego: "Primera Noche" },
  "6966a6d3ea7015c3b8a3d5cc": { loteriaId: "la-primera", nombreJuego: "Loto 5" },
  "6966a6d3ea7015c3b8a3d5d2": { loteriaId: "la-primera", nombreJuego: "El Quinielón Día" },
  "6966a6d3ea7015c3b8a3d5d8": { loteriaId: "la-primera", nombreJuego: "El Quinielón Noche" },

  // ---------- LA SUERTE DOMINICANA ----------
  "6966a6d3ea7015c3b8a3d5e3": { loteriaId: "la-suerte", nombreJuego: "La Suerte 12:30" },
  "6966a6d3ea7015c3b8a3d5e9": { loteriaId: "la-suerte", nombreJuego: "La Suerte 18:00" },

  // ---------- LOTEDOM ----------
  "6966a6d3ea7015c3b8a3d5f4": { loteriaId: "lotedom", nombreJuego: "Quiniela LoteDom" },
  "6966a6d3ea7015c3b8a3d5fa": { loteriaId: "lotedom", nombreJuego: "El Quemaito Mayor" },
  "6966a6d3ea7015c3b8a3d600": { loteriaId: "lotedom", nombreJuego: "Súper Palé LoteDom" },
  "6966a6d3ea7015c3b8a3d606": { loteriaId: "lotedom", nombreJuego: "Agarra 4" },

  // ---------- ANGUILA (Anguilla Lottery) ----------
  "6966a6d3ea7015c3b8a3d611": { loteriaId: "anguila", nombreJuego: "Anguila 1:00 PM" },
  "6966a6d3ea7015c3b8a3d617": { loteriaId: "anguila", nombreJuego: "Anguila 6:00 PM" },
  "6966a6d3ea7015c3b8a3d61d": { loteriaId: "anguila", nombreJuego: "Anguila 9:00 PM" },
  "6966a6d3ea7015c3b8a3d623": { loteriaId: "anguila", nombreJuego: "La Cuarteta 1:00 PM" },
  "6966a6d3ea7015c3b8a3d629": { loteriaId: "anguila", nombreJuego: "La Cuarteta 6:00 PM" },
  "6966a6d3ea7015c3b8a3d62f": { loteriaId: "anguila", nombreJuego: "La Cuarteta 9:00 PM" },
  "6966a6d3ea7015c3b8a3d635": { loteriaId: "anguila", nombreJuego: "Anguila 10:00 AM" },
  "6966a6d3ea7015c3b8a3d63b": { loteriaId: "anguila", nombreJuego: "La Cuarteta 10:00 AM" },
  "6a3e91bd5036a431f5f3e801": { loteriaId: "anguila", nombreJuego: "Anguila 9:00 AM" },
  "6a3e935d5036a431f5f3e8b2": { loteriaId: "anguila", nombreJuego: "Anguila 11:00 AM" },
  "6a3e94f85036a431f5f407b0": { loteriaId: "anguila", nombreJuego: "Anguila 12:00 PM" },
  "6a3e96e25036a431f5f40c87": { loteriaId: "anguila", nombreJuego: "Anguila 2:00 PM" },
  "6a3e97a25036a431f5f41eef": { loteriaId: "anguila", nombreJuego: "Anguila 3:00 PM" },
  "6a5114d907d516b9c5101dd5": { loteriaId: "anguila", nombreJuego: "Anguila 8:00 AM" },
  "6a5116a607d516b9c5102db7": { loteriaId: "anguila", nombreJuego: "Anguila 4:00 PM" },
  "6a5116f607d516b9c510302f": { loteriaId: "anguila", nombreJuego: "Anguila 5:00 PM" },
  "6a51185b07d516b9c5104c69": { loteriaId: "anguila", nombreJuego: "Anguila 7:00 PM" },
  "6a511ab407d516b9c510788d": { loteriaId: "anguila", nombreJuego: "Anguila 8:00 PM" },
  "6a511b0a07d516b9c5107d05": { loteriaId: "anguila", nombreJuego: "Anguila 10:00 PM" },
};

const FUENTES_VERIFICACION = [
  "https://loteriasdominicanas.com (catálogo público Nuxt: compañía, juego y game_id)",
  "https://api.loteriasdominicanas.com/dominicana/sessions (sesiones y score por game_id)",
  "https://loteriasdominicanas.com/pagina/horarios/ (horarios publicados; sujetos a feriados)",
];

// Los registros aquí presentes fueron cruzados contra el catálogo público
// del proveedor y el endpoint de sesiones el 2026-07-17. Los game_id que
// el proveedor expone pero no están en CATALOGO_BASE no se integran.
const CATALOGO = Object.fromEntries(Object.entries(CATALOGO_BASE).map(([gameId, item]) => [gameId, {
  provider: "loteriasdominicanas.com",
  gameId,
  lotteryId: item.loteriaId,
  lotteryName: item.loteriaId,
  gameName: item.nombreJuego,
  country: "DO",
  timezone: "America/Santo_Domingo",
  drawTimes: [],
  resultFormat: { source: "score[][]", normalized: "string[]" },
  status: "verified",
  confidence: 1,
  verifiedAt: "2026-07-17",
  sources: FUENTES_VERIFICACION,
  ...item,
}]));

module.exports = { CATALOGO, CATALOGO_BASE, FUENTES_VERIFICACION };
