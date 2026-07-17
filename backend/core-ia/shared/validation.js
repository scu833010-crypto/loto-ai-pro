const NUMERO_RE = /^\d{2}$/;
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

function validarResultadoHistorico(resultado) {
  if (!resultado || typeof resultado !== "object") return "El resultado debe ser un objeto.";
  if (!resultado.id || !resultado.loteriaId) return "Faltan id o loteriaId.";
  if (!FECHA_RE.test(resultado.fecha || "")) return "La fecha debe usar YYYY-MM-DD.";
  if (!Array.isArray(resultado.numeros) || resultado.numeros.length === 0 || !resultado.numeros.every((n) => NUMERO_RE.test(n))) {
    return "Los numeros deben ser valores entre 00 y 99.";
  }
  if (!resultado.fuente || /simulad|mock|fictici/i.test(resultado.fuente)) {
    return "El CORE solo acepta resultados historicos con fuente real identificable.";
  }
  return null;
}

function validarHistorico(resultados) {
  if (!Array.isArray(resultados) || resultados.length === 0) throw new Error("Se requiere un historico real no vacio.");
  const ids = new Set();
  resultados.forEach((resultado) => {
    const error = validarResultadoHistorico(resultado);
    if (error) throw new Error(`${resultado?.id || "sin-id"}: ${error}`);
    if (ids.has(resultado.id)) throw new Error(`Resultado duplicado: ${resultado.id}`);
    ids.add(resultado.id);
  });
  return resultados;
}

module.exports = { validarHistorico, validarResultadoHistorico };
