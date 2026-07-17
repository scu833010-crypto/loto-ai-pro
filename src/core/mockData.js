// ============================================================
// Datos de ejemplo — sustituir por el Servicio de Sincronización real
// cuando exista integración con las fuentes oficiales.
// La forma de estos objetos es el CONTRATO que debe respetar la API real.
//
// Se generan automáticamente a partir del catálogo `Loterias` (models.js):
// cada sorteo de cada lotería recibe su propio histórico de 90 días,
// con nombreJuego incluido para poder distinguir sorteos de la misma
// compañía (ej. "Quiniela Real" vs "Chance Real").
// ============================================================

import { Resultado, TipoJuego, Loterias } from "./models";

function n2(x) {
  return String(x).padStart(2, "0");
}

// Semilla determinística por texto, para que la demo sea consistente
// entre recargas sin tener que mantener una lista de números a mano.
function semillaDesdeTexto(texto) {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) % 233280;
  }
  return hash || 1;
}

// Genera N días de histórico simulado para un sorteo puntual.
// Una quiniela dominicana real siempre da 3 números en el mismo sorteo
// (primer, segundo y tercer premio) — por eso generamos 3 distintos,
// no 1 solo, para que el FORMATO se parezca al real aunque el VALOR
// sea inventado.
function generarHistorico(loteriaId, hora, dias, seed, nombreJuego) {
  const resultados = [];
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const hoy = new Date();
  for (let i = 0; i < dias; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    const iso = fecha.toISOString().slice(0, 10);

    // 3 números distintos entre sí (primer/segundo/tercer premio),
    // igual que en una quiniela real.
    const vistos = new Set();
    while (vistos.size < 3) {
      vistos.add(Math.floor(rnd() * 100));
    }
    const numeros = [...vistos].map(n2);

    resultados.push(
      new Resultado({
        id: `${loteriaId}-${nombreJuego.replace(/\s+/g, "")}-${iso}-${hora}`,
        loteriaId,
        fecha: iso,
        hora,
        tipoJuego: TipoJuego.QUINIELA,
        numeros,
        fuente: "⚠️ SIMULADO — no es un resultado oficial",
        version: 1,
        nombreJuego,
      })
    );
  }
  return resultados;
}

export const historicoMock = {};
Loterias.forEach((loteria) => {
  historicoMock[loteria.id] = loteria.sorteos.flatMap((sorteo) =>
    generarHistorico(
      loteria.id,
      sorteo.hora,
      90,
      semillaDesdeTexto(loteria.id + sorteo.nombre),
      sorteo.nombre
    )
  );
});

export function obtenerUltimosResultados(limite = 6) {
  const todos = Object.values(historicoMock).flat();
  return todos
    .sort((a, b) => (a.fecha + a.hora < b.fecha + b.hora ? 1 : -1))
    .slice(0, limite);
}

export function obtenerHistoricoPorLoteria(loteriaId) {
  return (historicoMock[loteriaId] || []).sort((a, b) =>
    a.fecha < b.fecha ? 1 : -1
  );
}
