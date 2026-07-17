# LOTO IA RD — Guía del Repositorio para Agentes de IA

Este archivo existe para que **cualquier asistente de IA** (Claude, GitHub
Copilot, Cursor, etc.) que edite este repositorio entienda de entrada la
arquitectura, las convenciones y las reglas de producto — y no repita
errores ya resueltos ni reintroduzca patrones ya descartados a propósito.

Si más de un agente de IA edita este proyecto al mismo tiempo, **usa uno
solo para escribir código a la vez**; los demás pueden consultar, pero no
editar en paralelo, para evitar pisarse cambios sin darse cuenta.

---

## 1. Estructura del proyecto

```
loto-ai-pro/
├── App.js                    # punto de entrada, monta AppNavigator
├── app.json                  # config de Expo (nombre, splash, bundle id)
├── metro.config.js           # excluye /backend del bundler de la app
├── src/
│   ├── core/                 # lógica pura, SIN dependencias de React Native
│   │   ├── models.js         # Loterias (catálogo), Resultado, Combinacion, Inversion
│   │   ├── mockData.js       # datos de ejemplo, generados desde el catálogo
│   │   ├── statsEngine.js    # motor analítico: frecuencia, tendencia, palés/tríos
│   │   ├── ai/               # AnalysisEngine + RankingEngine (ver sección 4)
│   │   ├── mezcladorEngine.js / generadorEngine.js / mivrEngine.js
│   │   ├── payoutRules.js    # factores de pago REFERENCIALES, no oficiales
│   │   ├── storage.js        # AsyncStorage: Combinaciones, Inversiones, Auditoría
│   │   ├── syncService.js    # habla con el backend real (si está configurado)
│   │   ├── resultadosRepository.js  # punto único de acceso a datos (ver sección 2)
│   │   └── fechaHoraRD.js    # SIEMPRE usar esto para fecha/hora, nunca Date() a pelo
│   ├── theme/theme.js        # única fuente de colores/tipografía/espaciados
│   ├── components/           # UI reutilizable (ResultCard, GoldButton, etc.)
│   ├── screens/              # una pantalla por archivo, sin lógica de negocio pesada
│   └── navigation/AppNavigator.js  # 4 tabs + stack "Más" con pantallas secundarias
└── backend/
    ├── src/config/loterias.js      # catálogo de fuentes (URLs, selectores CSS)
    ├── src/scraper/browserScraper.js  # Puppeteer, navegador único compartido
    ├── src/jobs/scrapeJob.js       # pipeline: internet → scraper → normalizador → SQLite
    ├── src/db/database.js         # esquema SQLite (resultados, eventos, estado_pipeline)
    └── src/server.js              # Express, expone /api/resultados, /api/estado, etc.
```

## 2. Flujo de datos preferido — `resultadosRepository.js`

**Nunca leas `mockData.js` ni llames al backend directamente desde una
pantalla.** Todas las pantallas pasan por `resultadosRepository.js`, que:

1. Intenta traer datos reales del backend (`syncService.js` → API en Render).
2. Si el backend no está disponible o `syncService` tiene `habilitado: false`,
   cae automáticamente a `mockData.js` (mismo contrato de forma de datos).

Funciones expuestas (son el contrato — no cambiar sus firmas sin actualizar
todas las pantallas que las usan):

```js
obtenerUltimosResultadosAsync(limite = 6)
obtenerHistoricoPorLoteriaAsync(loteriaId)
obtenerTodosLosResultadosAsync()
obtenerRecientesAsync({ rango = "hoy", fecha = null, loteriaId = null })
```

Cualquier función nueva que necesite datos de resultados debe agregarse
**aquí**, no directamente en una pantalla.

## 3. Convenciones visuales — tema oscuro + dorado

Todo color/tipografía/espaciado sale de `src/theme/theme.js`. No hardcodear
valores hex en pantallas o componentes.

- Fondo: `colors.bg` = `#0A1E3F` (azul marino oscuro)
- Color principal: `colors.primary` = `#007BFF` (acciones, tabs activos)
- Color de acento: `colors.accent` = `#FFD700` (dorado — títulos, cifras clave,
  el halo/brillo de los números tipo "bola de lotería")
- Cada lotería tiene su propio color en `colors.loteria.<colorKey>` (ver
  `Loterias` en `models.js` — el campo `colorKey` de cada una apunta ahí)
- Los números en círculo (resultados, destacados, rankings) SIEMPRE usan
  `components/GoldNumberBadge.js` — no crear círculos de número desde cero
  en una pantalla nueva, para mantener el mismo halo/brillo en toda la app.

## 4. Regla de producto no negociable: análisis descriptivo, nunca predicción garantizada

Esta es la regla más importante del proyecto y ya se discutió a fondo:

- La app describe el **historial** (frecuencia, tendencia, palés/tríos más
  repetidos). Nunca afirma ni sugiere que un número "va a salir" ni le pone
  un puntaje/porcentaje de "confianza" o "probabilidad de ganar" a un
  número específico — un sorteo de lotería es un evento independiente del
  anterior, así que ese puntaje no puede calcularse de forma real; sería
  inventado y engañoso para alguien que juega dinero real.
- Por eso `src/core/ai/` tiene `AnalysisEngine.js` (junta todas las métricas
  por lotería, con caché) y `RankingEngine.js` (ranking por frecuencia real,
  con explicación en texto) — pero **NO** existen ni deben crearse
  `PredictionEngine`, `ConfidenceIndexEngine`, `LearningEngine`,
  `PredictionRepository` ni `PredictionCache`. Si una tarea futura pide
  "índice de confianza", "score IA" o similar para predecir números
  ganadores, la respuesta correcta es la misma que ya se dio dos veces en
  este proyecto: no se construye, sin importar el nombre que se use.
- Toda pantalla de estadísticas debe dejar explícito (en texto visible, no
  solo en un comentario) que describe el pasado y no garantiza resultados.

## 5. Comandos para correr el proyecto

**App móvil** (desde la carpeta `loto-ai-pro/`, NO dentro de OneDrive —
causa errores `EPERM` en Windows):
```
npm install
npx expo start          # si el celular está en la misma red WiFi
npx expo start --tunnel # si están en redes distintas (requiere @expo/ngrok)
```
Escanear el QR con Expo Go. SDK actual del proyecto: **Expo SDK 57**
(revisar `package.json` → clave `"expo"` si esto cambia).

**Backend** (desde `loto-ai-pro/backend/`):
```
npm install
npm start
```
Desplegado en Render vía GitHub — cualquier cambio en `/backend` requiere
subir a GitHub para que Render lo redespliegue (no ocurre solo).

## 6. Qué NO hacer

- No eliminar funciones existentes ni reemplazarlas por versiones básicas.
- No crear módulos duplicados de algo que ya existe — extender el módulo
  actual (`statsEngine.js`, `resultadosRepository.js`, etc.), no crear uno
  paralelo.
- No modificar la navegación existente al agregar pantallas nuevas — solo
  añadir rutas nuevas al stack correspondiente.
- No usar `new Date().toLocaleString()` para mostrar fechas — usar
  `fechaHoraRD.js` (fija la zona horaria a República Dominicana, evita
  bugs de horas incorrectas por el huso horario del dispositivo).
