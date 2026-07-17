const { obtenerResultadosRecientes } = require("../db/resultadosRepo");

function crearAdaptadorResultadosCoreIa() {
  function obtenerHistoricoReal(loteriaId, limite = 1000) {
    const resultados = obtenerResultadosRecientes({ rango: "todo", loteriaId });
    return resultados
      .filter((resultado) => typeof resultado.fuente === "string" && resultado.fuente.trim())
      .slice(0, limite)
      .reverse()
      .map((resultado) => ({
      id: resultado.id,
      loteriaId: resultado.loteriaId,
      fecha: resultado.fecha,
      hora: resultado.hora || "00:00",
      numeros: resultado.numeros,
      fuente: resultado.fuente.trim(),
    }));
  }
  return { obtenerHistoricoReal };
}

module.exports = { crearAdaptadorResultadosCoreIa };
