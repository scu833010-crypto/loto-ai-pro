// ============================================================
// REPOSITORIO — capa de acceso a la tabla `resultados`.
// Soporta los rangos que pidió el producto: hoy, ayer, últimos 7
// días, o una fecha puntual.
// ============================================================

const db = require("./database");
const { fechaLocalRD } = require("../utils/fechaRD");

const upsertStmt = db.prepare(`
  INSERT INTO resultados (id, loteriaId, nombreJuego, fecha, hora, tipoJuego, numeros, money, fuente, actualizadoEn, seRealizaEseDia, providerGameId, referenciaFuente, verificationStatus, recibidoEn)
  VALUES (@id, @loteriaId, @nombreJuego, @fecha, @hora, @tipoJuego, @numeros, @money, @fuente, @actualizadoEn, @seRealizaEseDia, @providerGameId, @referenciaFuente, @verificationStatus, @recibidoEn)
  ON CONFLICT(id) DO UPDATE SET
    numeros = excluded.numeros,
    hora = excluded.hora,
    money = excluded.money,
    fuente = excluded.fuente,
    actualizadoEn = excluded.actualizadoEn,
    seRealizaEseDia = excluded.seRealizaEseDia,
    providerGameId = excluded.providerGameId,
    referenciaFuente = excluded.referenciaFuente,
    verificationStatus = excluded.verificationStatus,
    recibidoEn = excluded.recibidoEn
`);

function boolASqlite(valor) {
  if (valor === true) return 1;
  if (valor === false) return 0;
  return null;
}

function guardarResultados(resultados) {
  const transaccion = db.transaction((lista) => {
    lista.forEach((r) =>
      upsertStmt.run({
        ...r,
        hora: r.hora || "", // columna es NOT NULL en despliegues previos; algunos sorteos aún no están en horarios.js
        nombreJuego: r.nombreJuego || null,
        money: r.money || null,
        actualizadoEn: r.actualizadoEn || null,
        providerGameId: r.providerGameId || null,
        referenciaFuente: r.referenciaFuente || null,
        verificationStatus: r.verificationStatus || "pending",
        recibidoEn: r.recibidoEn || null,
        seRealizaEseDia: boolASqlite(r.seRealizaEseDia),
        numeros: JSON.stringify(r.numeros),
      })
    );
  });
  transaccion(resultados);
}

function filaAResultado(fila) {
  return {
    ...fila,
    numeros: JSON.parse(fila.numeros),
    seRealizaEseDia: fila.seRealizaEseDia === null ? null : Boolean(fila.seRealizaEseDia),
  };
}

function fechaISO(date) {
  return fechaLocalRD(date);
}

/**
 * rango: 'hoy' | 'ayer' | '7dias' | 'todo' | 'personalizada'
 * fecha: requerida solo si rango === 'personalizada' (YYYY-MM-DD)
 * 'todo' = histórico completo guardado, sin filtrar por fecha (lo usa
 * la app cuando pide "todos los resultados" para calcular estadísticas
 * — antes no existía esta opción y la app recibía solo el día de hoy
 * sin darse cuenta, lo que invalidaba cualquier estadística histórica).
 */
function obtenerResultadosRecientes({ rango = "hoy", fecha = null, loteriaId = null } = {}) {
  const hoy = new Date();
  let desde = null, hasta = null;

  if (rango === "hoy") {
    desde = hasta = fechaISO(hoy);
  } else if (rango === "ayer") {
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    desde = hasta = fechaISO(ayer);
  } else if (rango === "7dias") {
    const hace7 = new Date(hoy);
    hace7.setDate(hoy.getDate() - 7);
    desde = fechaISO(hace7);
    hasta = fechaISO(hoy);
  } else if (rango === "todo") {
    desde = null; // sin límite inferior: todo lo que haya en la base
    hasta = null;
  } else if (rango === "personalizada") {
    if (!fecha) throw new Error("Falta 'fecha' para rango personalizada");
    desde = hasta = fecha;
  } else {
    throw new Error(`Rango desconocido: ${rango}`);
  }

  let sql = `SELECT * FROM resultados WHERE 1=1`;
  const params = [];
  if (desde !== null) {
    sql += ` AND fecha >= ? AND fecha <= ?`;
    params.push(desde, hasta);
  }
  if (loteriaId) {
    sql += ` AND loteriaId = ?`;
    params.push(loteriaId);
  }
  sql += ` ORDER BY fecha DESC, hora DESC`;

  const filas = db.prepare(sql).all(...params);
  return filas.map(filaAResultado);
}

function contarResultados() {
  return db.prepare(`SELECT COUNT(*) AS total FROM resultados`).get().total;
}

module.exports = { guardarResultados, obtenerResultadosRecientes, contarResultados };
