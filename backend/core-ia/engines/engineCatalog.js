// Fachadas de motores: reutilizan statisticsEngine sin duplicar calculos.
const statistics = require("./statisticsEngine");
const { resumenMatematico } = require("./mathematicalEngine");

const engines = {
  statistics: { analizar: statistics.frecuencias },
  frequency: { analizar: statistics.frecuencias },
  delay: { analizar: statistics.retrasos },
  pattern: { analizar: statistics.patronesConjuntos },
  mathematical: { analizar: resumenMatematico },
};

module.exports = { engines };
