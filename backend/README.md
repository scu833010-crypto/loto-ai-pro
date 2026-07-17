# LOTO IA RD — Backend

Pipeline real: **Internet → MIVR (scraper) → Normalizador → SQLite → API**.
Cada etapa registra su propio estado y eventos (bitácora), consumidos
por los paneles Monitor y Noticias de la app.

## Por qué Puppeteer y no solo HTML

La primera versión de este backend usaba `cheerio` sobre HTML plano y
devolvía 0 resultados. Se confirmó navegando manualmente
loteriasdominicanas.com y enloteria.com: ambos cargan los números con
JavaScript (el segundo incluso por WebSocket/ActionCable) después de
la carga inicial. Un scraper de solo-HTML nunca ve ese contenido. Por
eso el scraper real (`src/scraper/browserScraper.js`) usa
`puppeteer-core` + `@sparticuz/chromium` (Chromium ligero para hosting
con poca memoria) para renderizar la página antes de leerla.

Puppeteer/Chromium son dependencias **opcionales**: si el hosting no
las soporta, el resto del backend (SQLite, rutas, caché, API) sigue
funcionando — solo el scraping en vivo queda inactivo y registrado
como error, nunca tumba el proceso.

## ⚠️ Calibración pendiente (obligatoria antes de producción)

Los selectores en `src/config/loterias.js` son un punto de partida.
**No se pudieron verificar contra el DOM ya renderizado** porque el
entorno de desarrollo no tiene salida a estos sitios (bloqueo de bot).
Pasos para calibrar tras desplegar:

1. Llama a `POST /api/sync/ejecutar`.
2. Revisa `GET /api/eventos` — si dice "0 bloques extraídos", activa
   `DEBUG_SCREENSHOT=true` como variable de entorno y vuelve a llamar
   a `/api/sync/ejecutar`: guarda una captura en `/tmp/debug-{lotería}.png`
   con lo que el navegador vio de verdad.
3. Abre la página real en tu propio navegador, inspecciona un
   resultado, y ajusta `selectorContenedor` / `selectorHora` /
   `selectorNumeros` en `loterias.js` según lo que encuentres.
4. Nada más necesita cambiar — rutas, SQLite y la app no dependen de
   los selectores.

## Endpoints

- `GET /health` → estado del proceso
- `GET /api/resultados/recientes?rango=hoy|ayer|7dias|personalizada&fecha=YYYY-MM-DD&loteriaId=...`
- `GET /api/resultados/loterias` → catálogo soportado
- `GET /api/resultados/:loteriaId` → histórico guardado (7 días) de una lotería
- `GET /api/estado` → estado real de cada etapa del pipeline (para "Monitor")
- `GET /api/eventos?limite=30` → bitácora real de eventos (para "Noticias")
- `POST /api/sync/ejecutar` → dispara el pipeline manualmente (no hay que esperar al cron)
- `GET /api/ia/*` → reservado para IA futura (501 a propósito — nunca "predicciones" inventadas)

## Correr localmente

```bash
cd backend
npm install
npm start
```

Prueba rápida:
```bash
curl -X POST http://localhost:3000/api/sync/ejecutar
curl http://localhost:3000/api/estado
curl http://localhost:3000/api/eventos
curl "http://localhost:3000/api/resultados/recientes?rango=hoy"
```

## Desplegar gratis en Render

1. Sube `backend/` a un repo de GitHub.
2. Render → **New > Blueprint** → conecta el repo (lee `render.yaml` solo).
3. ⚠️ El plan free de Render tiene 512MB de RAM. Chromium headless
   puede ser justo en ese límite — si falla por memoria al lanzar el
   navegador, sube a un plan pago o usa la alternativa de la API de
   downtack.com (más liviana, sin navegador).
4. Copia la URL pública que te da Render en
   `src/core/syncService.js` de la app (`baseUrl`) y pon `habilitado: true`.

Alternativa sin navegador (más simple y liviana): contactar a
hola@downtack.com por su API de resultados y sustituir
`browserScraper.js` por una llamada a esa API — el resto del pipeline
(normalizador, SQLite, rutas) no cambia.

## Variables de entorno

| Variable | Default | Uso |
|---|---|---|
| `PORT` | 3000 | Puerto del servidor |
| `CACHE_TTL_SECONDS` | 120 | TTL de la caché en memoria |
| `RATE_LIMIT_PER_MINUTE` | 60 | Límite de peticiones entrantes |
| `SYNC_CRON` | `*/10 * * * *` | Frecuencia del scraping automático |
| `DB_PATH` | `./data.sqlite` | Ubicación del archivo SQLite |
| `DEBUG_SCREENSHOT` | false | Guarda capturas de pantalla para calibrar selectores |

⚠️ En Render free, el disco no es persistente entre deploys — el
archivo SQLite se reinicia si el servicio se redepliega o duerme por
inactividad prolongada. Para persistencia real entre reinicios, usar
un Render Disk (pago) o una base de datos administrada.

## Ser un buen ciudadano de red

Caché + rate limiting ya están puestos. Revisa los términos de uso del
sitio elegido como fuente antes de operar esto con tráfico real de
producción.
