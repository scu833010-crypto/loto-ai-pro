function registrarEvidencia(registro, evaluacion) {
  return [...registro, {
    id: `evidence-${Date.now()}`,
    tipo: evaluacion.hipotesis,
    muestras: evaluacion.muestras,
    tasaObservada: evaluacion.tasaObservada,
    tasaBaseAleatoria: evaluacion.tasaBaseAleatoria,
    creadoEn: new Date().toISOString(),
  }];
}

module.exports = { registrarEvidencia };
