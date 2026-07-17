const { validarHistorico } = require("../shared/validation");
const stats = require("../engines/statisticsEngine");
const { probabilidadesEmpiricas } = require("../probability/empiricalProbability");
const { crearRankingDescriptivo } = require("../ranking/descriptiveRanking");
const { evaluarRiesgoDatos } = require("../risk/dataRiskEngine");
const { explicarAnalisis } = require("../explain/explainableEngine");
const { evaluarCoberturaContraAzar } = require("../evaluation/evaluationEngine");
const { resumenMatematico } = require("../engines/mathematicalEngine");
const { calcularTendencias } = require("../engines/trendEngine");
const { correlacionPhi } = require("../engines/correlationEngine");
const { simularVentanasHistoricas } = require("../simulation/historicalSimulationEngine");

function crearServicioAnalitico() {
  function analizar({ loteriaId, resultados, diasEsperados = 90 }) {
    validarHistorico(resultados);
    const propios = resultsPorLoteria(resultados, loteriaId);
    if (!propios.length) throw new Error("No hay resultados reales para la loteria solicitada.");
    const frecuencia = stats.frecuencias(propios);
    const totalApariciones = propios.reduce((n, r) => n + r.numeros.length, 0);
    const riesgo = evaluarRiesgoDatos(propios, diasEsperados);
    const tendencias = calcularTendencias(propios);
    const correlacion = frecuencia.length >= 2 ? correlacionPhi(propios, frecuencia[0].numero, frecuencia[1].numero) : null;
    return {
      loteriaId,
      totalResultados: propios.length,
      frecuencias: frecuencia,
      retrasos: stats.retrasos(propios),
      distribuciones: stats.distribuciones(propios),
      patrones: stats.patronesConjuntos(propios),
      tendencias,
      correlacionDescriptiva: correlacion,
      resumenMatematico: resumenMatematico(propios),
      probabilidadesEmpiricas: probabilidadesEmpiricas(frecuencia, totalApariciones),
      ranking: crearRankingDescriptivo(frecuencia),
      evaluacion: evaluarCoberturaContraAzar(stats.ordenarCronologico(propios), stats.frecuencias),
      simulacionHistorica: simularVentanasHistoricas(stats.ordenarCronologico(propios)),
      riesgo,
      explicacion: explicarAnalisis({ loteriaId, resultados: propios, riesgo }),
    };
  }
  return { analizar };
}

function resultsPorLoteria(resultados, loteriaId) {
  return resultados.filter((resultado) => resultado.loteriaId === loteriaId);
}

module.exports = { crearServicioAnalitico };
