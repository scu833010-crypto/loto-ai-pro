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
que queda pendiente: cada vez que se completa un período completo sin
abono, se le suma su interés (la "cuota" de ese período, como en el
esquema de interés-solo-sobre-saldo típico de préstamos informales).

Cuando registras un abono, se aplica en este orden: primero a la **mora**
acumulada (si hay), luego al **interés** acumulado, y lo que sobra reduce
el **capital** — igual que en la mayoría de préstamos informales entre
personas.

**Mora por atraso**: si defines un % de mora al crear o editar el
préstamo, se calcula automáticamente cuando un período vence sin que haya
un abono que lo cubra — es un % sobre el interés de ese período, aplicado
una sola vez por período vencido (no se repite cada día).

**Préstamo adicional**: si a alguien que ya tenía saldo pendiente le
prestas más dinero, usa el botón **"Préstamo adicional"** en su tarjeta en
vez de crear un préstamo nuevo. El monto se suma al capital pendiente
desde la fecha que indiques, manteniendo la misma tasa, frecuencia y fecha
de inicio original — todo queda en un solo registro por persona.

Si necesitas otro tipo de cálculo (por ejemplo cuotas fijas tipo bancario,
con tabla de amortización), es un cambio en `calcularEstado()` dentro de
`app.js` — dilo y se ajusta.

## Caja: cuánto dinero ha entrado realmente

Además del resumen de "lo que falta por cobrar", hay una sección **"Caja:
dinero que realmente ha entrado"** que suma, entre todos los préstamos:

- **Capital prestado (total histórico)**: todo lo que se ha prestado en
  total, incluyendo adicionales.
- **Capital recuperado**: la parte de los abonos que efectivamente redujo
  capital (no cuenta lo que se fue en interés o mora).
- **Interés + mora cobrados**: la parte de los abonos que pagó interés o
  mora.
- **Debería haber en caja**: capital recuperado + interés/mora cobrados —
  es decir, cuánto dinero deberías tener en mano de estos préstamos, sin
  confundirlo con el saldo que todavía falta por cobrar.

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
