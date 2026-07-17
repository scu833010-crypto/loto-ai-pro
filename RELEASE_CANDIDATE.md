# LOTO-IA-RD-v1.0.0-RC1

## Alcance

Esta candidata de lanzamiento solo contiene correcciones de estabilidad, seguridad y trazabilidad. No agrega pantallas, módulos ni capacidades de IA.

## Validaciones realizadas

- Pruebas unitarias del frontend: 5 suites, 30 pruebas aprobadas.
- Pruebas del CORE IA aislado: 4 pruebas aprobadas.
- Revisión sintáctica de los puntos de entrada y rutas del backend: aprobada.
- Bundle estático Android de Expo: aprobado (1,047 módulos).
- Expo Doctor había validado 20/20 antes de esta fase. La repetición durante RC1 no pudo completar dos comprobaciones remotas por bloqueo de red hacia Expo, no por un error de configuración local.

## Correcciones RC1

- El CORE IA ahora descarta resultados sin fuente identificable, utiliza los registros más recientes y los entrega en orden cronológico.
- Se eliminó el PIN fijo de administración. El acceso local solo puede habilitarse en desarrollo mediante una variable de entorno; la versión de producción no acepta ese acceso.
- Se controlaron fallos de carga en calendario, estadísticas, centro estadístico, combinaciones, reportes y dashboard para evitar pantallas bloqueadas o rechazos silenciosos.
- La agenda distingue datos de demostración de resultados reales.
- Los reportes PDF escapan contenido dinámico y usan fecha/hora de República Dominicana; el CSV ya evita inyección de fórmulas.
- Se añadieron metadatos básicos de accesibilidad al selector de loterías.

## Bloqueadores para publicar como v1.0.0

1. Configurar y verificar la API real de resultados con fuentes trazables. Actualmente la sincronización remota está deshabilitada por configuración, por lo que la app no debe anunciar datos oficiales en producción.
2. Ejecutar e instalar el backend con Node 22.x y las herramientas de compilación requeridas por `better-sqlite3`. El entorno de auditoría usa Node 24 y no puede instalar esa dependencia nativa.
3. Implementar autenticación y roles administrativos en backend antes de habilitar correcciones de resultados desde móvil.
4. Crear y validar la configuración de EAS/credenciales de firma para producir un APK/AAB firmado. No existe `eas.json` en el proyecto actual.
5. Ejecutar pruebas manuales en Android físicos representativos, incluyendo modo avión, red lenta, reinstalación, permisos, rotación y recuperación tras cierre.
6. Incorporar únicamente los logos y activos gráficos autorizados.

## Criterio de promoción

Promover a `LOTO-IA-RD v1.0.0` solamente cuando los seis bloqueadores anteriores estén cerrados y la matriz de dispositivos reales esté aprobada.
