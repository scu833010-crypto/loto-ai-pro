# LOTO IA RD — Entrega integrada v1.0.0

## Instalar y probar la app

```powershell
cd loto-ia-rd-integrado
npm install
npm test -- --runInBand
npx expo-doctor
npx expo start
```

El bundle Android se puede validar sin credenciales con:

```powershell
npx expo export --platform android --output-dir ../expo-android-export
```

Para un APK instalable se necesitan credenciales/una cuenta EAS del propietario y un perfil `eas.json`; no se generó un APK desde este entorno.

## Backend

```powershell
cd backend
# Requiere Node 22.x y herramientas de compilacion compatibles con better-sqlite3
npm ci
npm test
npm run test:core-ia
npm run lint
setx ADMIN_API_KEY "una-clave-secreta-larga"
setx CORS_ORIGINS "https://tu-dominio.example"
npm start
```

Rutas nuevas: `/api/v1/loterias`, `/api/v1/resultados`, `/api/v1/historico`, `/api/v1/analitica`, `/api/v1/evaluaciones`, `/api/v1/tendencias`, `/api/v1/rankings`, `/api/v1/simulaciones` y `/api/v1/core-ia/estado`.

## Estado verificable

### Fuente real verificada (2026-07-17)

- Se inspeccionaron 99 `game_id` del endpoint público de sesiones y el catálogo público del proveedor.
- Se habilitaron únicamente 59 IDs con estado `verified`; los demás quedan fuera del flujo y nunca se muestran bajo una lotería conocida.
- El backend conserva ID del proveedor, referencia, estado de verificación y fecha de recepción. Ver `backend/docs/GAME_ID_MAPPING.md`.
- La app móvil seguirá en modo demo hasta que el propietario despliegue el backend y configure su URL HTTPS, sin incrustar secretos en Expo.

- App: 30 pruebas Jest aprobadas, Expo Doctor 20/20 y bundle Android exportado.
- CORE IA: 4 pruebas Node aprobadas dentro del backend.
- Backend completo: pendiente de ejecutar en Node 22; el entorno actual usa Node 24 y no puede compilar `better-sqlite3` sin toolchain nativo.
- Datos reales: el flujo y backfill existen, pero la app queda en modo demo hasta configurar `src/core/syncService.js` con una URL real y desplegar el backend.
- Logos oficiales: no incluidos por falta de activos con licencia/autorizacion; se entrega fallback no marcario y la guia de incorporacion.
