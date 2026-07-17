// ============================================================
// CATÁLOGO DE LOTERÍAS — alcance confirmado por el usuario (2026-07-17):
//   Lotería Nacional, Leidsa, Loteka, Lotería Real, La Primera,
//   LoteDom, La Suerte Dominicana, Anguilla Lottery, Nueva York,
//   Florida. Sin King Lottery ni Haiti Bolet. Nueva York y Florida
//   muestran solo su quiniela principal (Día/Noche), sin los
//   sub-juegos americanos (Mega Millions, Powerball, Pick 3/4/5, etc.)
//
// "fuenteUrl" queda documentado por si en el futuro se necesita volver
// a inspeccionar el HTML de origen a mano; el pipeline real ya no lo
// usa (ver scraper/apiOficialClient.js).
// ============================================================

const LOTERIAS = [
  { id: "loteria-nacional", nombre: "Lotería Nacional", fuenteUrl: "https://loteriasdominicanas.com/loteria-nacional" },
  { id: "leidsa", nombre: "Leidsa", fuenteUrl: "https://loteriasdominicanas.com/leidsa" },
  { id: "real", nombre: "Lotería Real", fuenteUrl: "https://loteriasdominicanas.com/loto-real" },
  { id: "loteka", nombre: "Loteka", fuenteUrl: "https://loteriasdominicanas.com/loteka" },
  { id: "la-primera", nombre: "La Primera", fuenteUrl: "https://loteriasdominicanas.com/la-primera" },
  { id: "la-suerte", nombre: "La Suerte Dominicana", fuenteUrl: "https://loteriasdominicanas.com/la-suerte-dominicana" },
  { id: "lotedom", nombre: "Lotedom", fuenteUrl: "https://loteriasdominicanas.com/lotedom" },
  { id: "anguila", nombre: "Anguilla Lottery", fuenteUrl: "https://loteriasdominicanas.com/anguila" },
  { id: "nueva-york", nombre: "Nueva York", fuenteUrl: "https://loteriasdominicanas.com/nueva-york" },
  { id: "florida", nombre: "Florida", fuenteUrl: "https://loteriasdominicanas.com/loteria-de-florida" },
];

function obtenerConfigLoteria(loteriaId) {
  return LOTERIAS.find((l) => l.id === loteriaId) || null;
}

module.exports = { LOTERIAS, obtenerConfigLoteria };
