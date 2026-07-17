// ============================================================
// NORMALIZADOR — etapa del pipeline (Internet → MIVR → Normalizador
// → SQLite → Dashboard). Valida que cada resultado crudo tenga la
// forma correcta antes de persistirlo. Nada llega a SQLite sin pasar
// por aquí, así un cambio de estructura en la fuente externa no
// corrompe la base de datos — como mucho, descarta el registro y
// lo reporta como evento.
// ============================================================

const { registrarEvento, actualizarEstadoEtapa } = require("../db/eventosRepo");

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIPOS_VALIDOS = new Set(["QUINIELA", "PALE", "TRIPLETA", "MULTIPLE"]);

// Distintos sorteos reales publican sus números en formatos distintos:
// quinielas dominicanas (2 dígitos), Pick 3/4/5 y Win4/Numbers (1 dígito
// por posición), Philipsburg (bloques de 4 dígitos), o bolas especiales
// con id alfanumérico (ej. multiplicador de Powerball, color de manzana
// de Nueva Yol Real). Se acepta cualquier valor no vacío razonable — la
// validación de formato específico por tipo de juego va en la capa de
// presentación, no descartando aquí el dato real.
function numeroValido(n) {
  return typeof n === "string" && n.length > 0 && n.length <= 40;
}

function validarResultado(item) {
  if (!item || typeof item !== "object") return "no es un objeto";
  if (!item.loteriaId) return "falta loteriaId";
  if (!FECHA_RE.test(item.fecha)) return "fecha con formato inválido";
  if (!TIPOS_VALIDOS.has(item.tipoJuego)) return "tipoJuego inválido";
  if (!Array.isArray(item.numeros) || item.numeros.length === 0) return "sin números";
  if (!item.numeros.every(numeroValido)) return "algún número con formato inválido";
  return null;
}

/**
 * Normaliza un array de resultados crudos: descarta inválidos,
 * registra por qué se descartó cada uno, y devuelve solo los válidos.
 */
function normalizar(resultadosCrudos) {
  const validos = [];
  let descartados = 0;

  resultadosCrudos.forEach((item) => {
    const error = validarResultado(item);
    if (error) {
      descartados++;
      registrarEvento("advertencia", "normalizador", `Registro descartado (${error}): ${JSON.stringify(item).slice(0, 200)}`);
      return;
    }
    validos.push({
      id: item.id,
      loteriaId: item.loteriaId,
      nombreJuego: item.nombreJuego || null,
      fecha: item.fecha,
      hora: item.hora || null,
      seRealizaEseDia: typeof item.seRealizaEseDia === "boolean" ? item.seRealizaEseDia : null,
      tipoJuego: item.tipoJuego,
      numeros: item.numeros,
      money: item.money || null,
      fuente: item.fuente || null,
      actualizadoEn: item.actualizadoEn || null,
      providerGameId: item.providerGameId || null,
      referenciaFuente: item.referenciaFuente || null,
      verificationStatus: item.verificationStatus || "pending",
      recibidoEn: item.recibidoEn || null,
    });
  });

  actualizarEstadoEtapa("normalizador", true, `${validos.length} válidos, ${descartados} descartados`);
  if (validos.length > 0) {
    registrarEvento("info", "normalizador", `${validos.length} resultado(s) normalizado(s) correctamente.`);
  }

  return validos;
}

module.exports = { normalizar, validarResultado };
