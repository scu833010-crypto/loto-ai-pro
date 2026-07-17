function proponerConfiguracion(evaluaciones, configuracionActual) {
  if (!Array.isArray(evaluaciones) || evaluaciones.length === 0) return { configuracion: configuracionActual, motivo: "Sin evidencia suficiente para ajustar parametros." };
  const ordenadas = [...evaluaciones].filter((e) => e.muestras >= 30 && e.tasaObservada !== null).sort((a, b) => (b.tasaObservada - b.tasaBaseAleatoria) - (a.tasaObservada - a.tasaBaseAleatoria));
  const mejor = ordenadas[0];
  if (!mejor || mejor.tasaObservada <= mejor.tasaBaseAleatoria) return { configuracion: configuracionActual, motivo: "No hay mejora historica frente a la linea base aleatoria." };
  return {
    configuracion: { ...configuracionActual, ventana: mejor.ventana || configuracionActual.ventana },
    motivo: "Propuesta basada en evidencia historica; requiere aprobacion externa antes de aplicarse.",
    evidencia: mejor,
  };
}

module.exports = { proponerConfiguracion };
