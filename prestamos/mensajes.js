// mensajes.js
//
// Mensajes predeterminados para enviar a quienes te deben dinero.
// Edita el texto libremente, en español o como prefieras.
//
// Placeholders disponibles (se reemplazan automáticamente):
//   {nombre}   -> nombre del deudor
//   {monto}    -> monto de la cuota o del abono, con símbolo de moneda
//   {fecha}    -> fecha relevante (vencimiento o fecha de pago), formato DD/MM/AAAA
//   {saldo}    -> saldo total pendiente (capital + interés + mora), con símbolo de moneda
//   {capital}  -> capital que queda pendiente, con símbolo de moneda
//   {interes}  -> interés acumulado pendiente, con símbolo de moneda
//   {mora}     -> mora acumulada por atraso, con símbolo de moneda (0 si no aplica)
//   {dias}     -> días de atraso (solo tiene sentido en el mensaje de vencido)
//
// Puedes agregar tus propias plantillas nuevas: solo dales una clave (el
// nombre antes de los dos puntos) y úsala igual que las demás desde la app.

const MENSAJES_PREDETERMINADOS = {
  prestamoNuevo:
    "Hola {nombre}, quedó registrado tu préstamo de {monto}. " +
    "Cualquier duda sobre las fechas de pago me avisas. ¡Gracias!",

  recordatorioProximo:
    "Hola {nombre}, te recuerdo que tu próximo pago de {monto} vence el {fecha}. " +
    "Saldo total pendiente: {saldo}. ¡Gracias!",

  recordatorioVencido:
    "Hola {nombre}, tu pago venció el {fecha} ({dias} día(s) de atraso), " +
    "generando una mora de {mora}. Saldo total pendiente: {saldo}. " +
    "Por favor coordinemos el pago cuando puedas.",

  confirmacionPago:
    "Hola {nombre}, confirmo que recibí tu pago de {monto} el {fecha}. " +
    "Saldo pendiente: {saldo}. ¡Gracias!",

  saldoAlDia:
    "Hola {nombre}, para que tengas el dato: tu saldo pendiente actual es {saldo} " +
    "(capital: {capital}, interés: {interes}). Vas al día, gracias por cumplir.",
};

// No tocar esta línea: hace que app.js pueda usar el objeto de arriba.
if (typeof window !== "undefined") {
  window.MENSAJES_PREDETERMINADOS = MENSAJES_PREDETERMINADOS;
}
