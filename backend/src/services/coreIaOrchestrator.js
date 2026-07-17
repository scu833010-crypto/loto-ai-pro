const { crearServicioAnalitico, crearApiInterna } = require("../../core-ia");

function crearOrquestadorCoreIa({ resultadosAdapter }) {
  if (!resultadosAdapter?.obtenerHistoricoReal) throw new Error("Se requiere un adaptador de resultados para CORE IA.");
  const api = crearApiInterna(crearServicioAnalitico());

  async function analizar(loteriaId, opciones = {}) {
    const limite = Math.min(Number(opciones.limite) || 1000, 2000);
    const resultados = resultadosAdapter.obtenerHistoricoReal(loteriaId, limite);
    return api.analizarLoteria({ loteriaId, resultados, diasEsperados: opciones.diasEsperados || 90 });
  }

  return { analizar, estado: () => ({ disponible: true, modo: "analisis_descriptivo", version: "core-ia-v0.2.0" }) };
}

module.exports = { crearOrquestadorCoreIa };
