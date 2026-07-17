function validarConfiguracionAnalisis(configuracion = {}) {
  const ventana = configuracion.ventana ?? 30;
  if (!Number.isInteger(ventana) || ventana < 5 || ventana > 365) throw new Error("ventana debe estar entre 5 y 365.");
  return { ventana };
}

module.exports = { validarConfiguracionAnalisis };
