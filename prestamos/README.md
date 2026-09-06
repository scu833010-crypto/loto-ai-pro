# Registro de Préstamos

Herramienta simple para llevar el control de préstamos que le haces a otras
personas: cuánto prestaste, cuánto interés se acumula, cuándo toca el
próximo pago y mensajes listos para recordarles.

No tiene relación con la app de lotería de este mismo repositorio (`src/`,
`backend/`) — es una herramienta aparte, independiente, en esta carpeta.

## Cómo usarla

No requiere instalación ni servidor. Abre el archivo `index.html` en
cualquier navegador (doble clic, o clic derecho → Abrir con → tu navegador).

Todo se guarda en el navegador (`localStorage`), así que:

- Es completamente gratis, no depende de ningún servicio externo ni de
  internet para funcionar.
- Los datos quedan guardados en **ese** navegador y **esa** computadora. Si
  cambias de navegador o de equipo, usa el botón **"Descargar respaldo
  (JSON)"** para exportar tus préstamos, y **"Importar respaldo"** en el
  otro lado para recuperarlos.
- Si borras el historial/caché del navegador, perderás los datos a menos
  que tengas un respaldo exportado.

## Cómo funciona el cálculo

Cada préstamo tiene una tasa de interés simple por período (semanal,
quincenal o mensual, según elijas). El interés se calcula sobre el capital
que queda pendiente, proporcional a los días transcurridos desde el último
abono (o desde el inicio, si no hay abonos todavía).

Cuando registras un abono, primero se descuenta del interés acumulado, y lo
que sobra reduce el capital — igual que en la mayoría de préstamos
informales entre personas.

Si necesitas otro tipo de cálculo (por ejemplo cuotas fijas tipo bancario,
con tabla de amortización), es un cambio en `calcularEstado()` dentro de
`app.js` — dilo y se ajusta.

## Mensajes predeterminados

Los textos de los recordatorios están en `mensajes.js`, en español y
totalmente editables — ábrelo con cualquier editor de texto. Cada préstamo,
desde el botón **"Recordatorio"**, arma el mensaje automáticamente con el
nombre, monto y fecha correspondientes, y lo deja listo para:

- Copiar con un botón.
- Enviar directo por WhatsApp (si le pusiste el teléfono al préstamo).

## Recordatorios de pago

No hay notificaciones push (eso tendría que ser una app instalada o un
servicio con costo). En su lugar, cada vez que abres la página:

- El resumen de arriba muestra cuántos préstamos están **vencidos** o
  **por vencer**.
- Cada préstamo tiene una etiqueta de color (verde = al día, amarillo =
  vence pronto, rojo = vencido) para verlo de un vistazo.

## Estructura de archivos

```
prestamos/
  index.html   → estructura de la página
  style.css    → estilos (simple, sin dependencias)
  app.js       → lógica: cálculos, guardado, recordatorios
  mensajes.js  → plantillas de mensajes, editable
  README.md    → este archivo
```
