# LotoAnalytics RD — App móvil (React Native / Expo)

App de resultados y análisis estadístico de loterías dominicanas.
**No procesa apuestas ni pagos reales.** Todo lo que muestra el motor
analítico es estadística descriptiva del histórico, nunca una predicción
garantizada. Los factores de pago en MIVR son referenciales, no oficiales.

## Rediseño visual (v0.3)

El Dashboard se rediseñó siguiendo una referencia visual estilo "panel
de control": fondo navy oscuro, acentos dorados, tarjetas de métricas,
resultados en grilla con números circulares, gráfico de tendencia,
números calientes/fríos, gráfico de frecuencia completo (00-99),
distribución por rango (donut) y mensajes del sistema.

**Un cambio deliberado:** la referencia incluía un panel de "Predicción
IA" con un % de "confianza" sobre números recomendados. Un sorteo de
lotería es aleatorio: ningún modelo puede predecirlo, y mostrar una
confianza sobre eso induce a error. Se mantuvo el mismo espacio visual
como **"Números Destacados"**: los más frecuentes del histórico
cargado, con la cobertura de datos real (no una confianza inventada).
Toda la app sigue el mismo principio: estadística descriptiva del
pasado, nunca predicción del futuro.

## Consistencia visual (v0.4)

Todas las pantallas ahora comparten el mismo lenguaje visual del
Dashboard: paneles con título dorado (`src/components/Panel.js`) y
botón de acción principal dorado (`src/components/GoldButton.js`),
usados en Estadísticas, Combinaciones, Inversiones, Reportes y
Administración. Los números de combinaciones y resultados usan el
mismo estilo de círculo con borde de color por lotería en toda la app.

## Rebranding a LOTO IA RD (v0.5)

Se aplicó la paleta e identidad de marca provista: fondo `#0A1E3F`,
azul `#007BFF`, dorado `#FFD700`/`#FFC107`. El nombre de la app pasó a
**LOTO IA RD** en `app.json` y en el encabezado del Dashboard.

**Nota sobre el copy de marketing:** si vas a usar frases del kit de
marca como "mejores predicciones" o "100% confiable" en la tienda de
apps o publicidad, ten cuidado — ningún análisis puede predecir un
sorteo aleatorio, y prometerlo puede ser publicidad engañosa además de
alentar a alguien a jugar más de lo que debería. "Análisis profundo del
histórico" y "datos verificados" comunican lo mismo sin esa promesa.

## Mezclador (nuevo módulo)

A partir de un número base, genera las combinaciones que tradicionalmente
usan los jugadores dominicanos (`src/core/mezcladorEngine.js`):

- **Invertido**: 56 → 65
- **Complemento a 9** ("el 9"): 56 → 43
- **Vecino anterior / siguiente**: 56 → 55 / 57
- **Suma reducida** ("el 6", la reducción numerológica): 5+6=11 → 2
- **Doble**: 56 → 12 (112 mod 100)

Cada resultado se puede guardar directo como Combinación desde la
misma pantalla. Son transformaciones matemáticas fijas sobre el número
que ingresas — no analizan el histórico ni predicen nada.

## Datos en tiempo real: lo que investigué

Para resultados oficiales en vivo hay dos caminos reales (no hipotéticos):

1. **API comercial de downtack.com** — cubre Nacional, Leidsa, La
   Suerte, Lotería Real, Loteka, La Primera, Lotedom y King Lottery en
   JSON/XML/CSV. No es autoservicio: hay que escribirles a
   hola@downtack.com para acceso y precio. Es el camino más confiable.
2. **Backend propio** que reúna datos de una fuente pública (ej.
   loteriasdominicanas.com) y te los sirva en JSON — hay proyectos de
   referencia en GitHub (buscar "LotteryScraping-RD") que ya hacen ese
   trabajo en Python. Esto **no puede vivir solo en el celular**: hace
   falta un pequeño servidor intermedio (Node, Cloud Function, etc.).
   Antes de scrapear en producción, revisa los términos de uso del
   sitio que elijas.

Ninguna de las dos se pudo probar en vivo desde este entorno de
desarrollo porque los sitios bloquean tráfico automatizado (normal en
producción). El código ya está listo para conectar cualquiera de las
dos: `src/core/syncService.js` — cambia `CONFIG.habilitado` a `true` y
ajusta `baseUrl` cuando tengas la fuente real. Mientras tanto, la app
sigue funcionando con datos de ejemplo automáticamente.

## Ideas para que la app se sienta más completa como jugadora

Algunas de estas se pueden construir ya, con lo que existe hoy:

- **Recordatorio antes de cada sorteo** (notificación local X minutos antes).
- **Comparador de loterías**: ver dos loterías lado a lado en Estadísticas.
- **"Mi número de la suerte"**: fijar un número favorito y verlo resaltado
  automáticamente en Resultados y Estadísticas cada vez que aparece.
- **Compartir resultado o combinación** por WhatsApp con un botón directo.
- **Calendario semanal de sorteos** por lotería (ya tenemos los horarios
  en `Loterias[].sorteos`, falta la vista de calendario).
- **Modo sin conexión**: guardar el último resultado visto para
  consultarlo sin internet.
- **Racha de verificación**: cuántas veces seguidas revisaste tus
  inversiones en MIVR, como hábito, no como logro de juego.

## Cómo correrla

```bash
npm install
npx expo start
```

Escanea el QR con la app **Expo Go** (Android/iOS), o presiona `w` para
verla en el navegador.

> Requisitos: Node.js 18+, y la app **Expo Go** instalada en tu teléfono.

## Módulos construidos (todos funcionales, ninguno vacío)

- **CORE** (`src/core/`): entidades de dominio, catálogo de loterías,
  motor de estadísticas, motor MIVR, reglas de pago referenciales,
  repositorio de resultados y capa de persistencia local.
- **Dashboard**: resumen del día, número más frecuente/ausente, últimos
  resultados, pull-to-refresh.
- **Resultados**: histórico filtrable por lotería (90 días de datos de
  ejemplo por lotería), refleja correcciones de Administración.
- **Estadísticas / CAE**: frecuencia, ausencia, decenas y terminaciones,
  con gráficos de barra y métrica de cobertura de datos.
- **Combinaciones**: crear/guardar/eliminar combinaciones de Quiniela,
  Palé o Tripleta. Persistidas en el dispositivo (AsyncStorage).
- **Inversiones (MIVR)**: registrar monto jugado sobre una combinación
  y verificar automáticamente contra el histórico real; calcula
  ganancia estimada con un factor de pago referencial y editable.
- **Reportes**: exporta las inversiones a PDF (expo-print) o a CSV
  (se abre directo en Excel), con diálogo nativo de compartir.
- **Administración**: acceso con PIN de demostración (`1234`), corrige
  un resultado dejando siempre auditoría (autor, motivo, valor anterior
  y nuevo). El cambio se ve de inmediato en Dashboard y Resultados.
- **Sistema de diseño** (`src/theme/theme.js`): paleta, tipografía,
  espaciados — tema oscuro activo.
- **Navegación completa** de 4 pestañas (Inicio, Resultados,
  Estadísticas, Más), con Más desplegando Combinaciones, Inversiones,
  Reportes y Administración.

Los datos de resultados son **simulados** (`src/core/mockData.js`) con
semilla fija por lotería para que la demo sea estable. Toda pantalla lee
a través de `src/core/resultadosRepository.js`: el día que haya una
fuente oficial, ahí es el único lugar que hay que cambiar.

## Pendiente para producción (no bloquea el uso de la app)

1. **Backend real**: reemplazar `mockData.js` por sincronización con
   fuentes oficiales + base de datos (PostgreSQL recomendado).
2. **Autenticación real** en Administración (hoy es un PIN de demo).
3. **Notificaciones push** de nuevos resultados (hoy no implementadas;
   la app funciona por consulta activa / pull-to-refresh).
4. Ajustar los factores de pago de MIVR según la banca real, o exponerlos
   en una pantalla de Configuración.

## Estructura de carpetas

```
App.js
src/
  core/          → CORE: modelos, motor analítico, motor MIVR, storage,
                    repositorio de resultados, reglas de pago, datos mock
  theme/          → paleta, tipografía, espaciados
  navigation/     → navegación por pestañas + stacks internos
  screens/        → Dashboard, Resultados, Estadísticas, Combinaciones,
                    Inversiones, Reportes, Administración, Más (hub)
  components/     → ResultCard, StatSummaryCard, LoteriaSelector, BarChart
```
