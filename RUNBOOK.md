# Ejecución y pruebas

## Requisito de Node

Todo el proyecto está configurado para **Node.js 22 LTS** (`.nvmrc` y `engines`). No sustituir `better-sqlite3` para ejecutar con Node 24.

## Expo Go: misma red Wi-Fi

1. Instalar Node 22 y ejecutar `npm install`.
2. Mantener `EXPO_PUBLIC_API_URL` sin definir para probar el modo demostración, o definir una URL HTTPS desplegada.
3. Ejecutar `npx expo start`.
4. Con el celular y la PC en la misma red Wi-Fi, escanear el QR con Expo Go.

## Backend HTTPS desplegado

1. En `backend/`, usar Node 22 LTS, copiar `.env.example` a `.env` y configurar `DATABASE_PATH`, `CORS_ORIGINS`, `ADMIN_API_KEY` y `RESULTS_API_URL`.
2. Desplegar el backend detrás de HTTPS con almacenamiento persistente.
3. En la raíz móvil, crear `.env` con `EXPO_PUBLIC_API_URL=https://tu-backend.example`.
4. Reiniciar Expo. Con la variable válida, la app consulta el backend; si este falla, conserva el último resultado verificado en el dispositivo.

## APK con EAS

1. Instalar y autenticar EAS CLI con la cuenta propietaria.
2. Crear `eas.json` y las credenciales Android del propietario.
3. Ejecutar `eas build --platform android --profile preview` para pruebas o el perfil de producción autorizado.

No hay APK firmado en este paquete: requiere las credenciales del propietario. El backend no fue ejecutado completamente en este entorno porque contiene Node 24; debe verificarse bajo Node 22 LTS antes de producción.
