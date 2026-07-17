# Informe de integración

## Conservado del ZIP de Claude

Expo SDK 57, navegación por pestañas/stack, pantallas existentes, favoritos, fecha RD, catálogo, horarios, backfill, pruebas y autenticación administrativa por API key.

## Integrado

La fuente pública de LoteriasDominicanas se consulta solamente desde el backend, con timeout, reintentos limitados, caché y exclusión de IDs no verificados. Cada resultado preserva el ID del proveedor, referencia, estado de verificación y fecha de recepción. La evidencia está en `backend/docs/GAME_ID_MAPPING.md`.

`backend/core-ia` se mantiene independiente de Expo. El backend usa un adaptador de resultados, un orquestador y rutas `/api/v1` para exponer análisis descriptivo, tendencias, evaluaciones, rankings y simulaciones.

## Límites externos

- La fuente de resultados y el backend móvil siguen deshabilitados hasta configurar `baseUrl` en `src/core/syncService.js` y variables de despliegue.
- Los logos oficiales requieren activos autorizados/licenciados; se implementó un fallback no marcario y documentación.
- La compilación APK requiere credenciales/configuración de EAS del propietario; no se puede completar sin ellas.

## Archivos creados o integrados

- `backend/core-ia/`: paquete CORE IA v0.2.0 completo.
- `backend/src/adapters/coreIaResultadosAdapter.js`, `backend/src/services/coreIaOrchestrator.js`, `backend/src/routes/v1.js`.
- `src/components/LotteryLogo.js`, `src/components/PremiumStates.js`, `src/core/calendario.js`, `src/screens/CalendarioScreen.js`.
- `assets/logos/README.md`, `test/calendario.test.js`, `DELIVERY.md`.

## Archivos modificados

- `backend/server.js`, `backend/package.json`, `backend/.env.example`.
- `src/core/syncService.js`, `src/components/LoteriaSelector.js`, `src/navigation/AppNavigator.js`, `src/screens/MasScreen.js`, `src/screens/CentroEstadisticasScreen.js`.
- `app.json`: se corrigió el esquema Expo sin modificar SDK 57.

## Dependencias

No se agregaron dependencias de producción. Se conservó el lockfile de la app tras la instalación local. El CORE IA no requiere dependencias externas.
