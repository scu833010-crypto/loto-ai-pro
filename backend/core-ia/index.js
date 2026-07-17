const { crearServicioAnalitico } = require("./analytics/analyticsService");
const { crearApiInterna } = require("./api/internalApi");
const { crearServicioAprendizaje } = require("./learning/evidenceLearningService");
const { crearArchivoKnowledgeStore } = require("./knowledge/fileKnowledgeStore");
const { proponerConfiguracion } = require("./optimization/autoImprovementEngine");
const { engines } = require("./engines/engineCatalog");

module.exports = { crearServicioAnalitico, crearApiInterna, crearServicioAprendizaje, crearArchivoKnowledgeStore, proponerConfiguracion, engines };
