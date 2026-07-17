# Integracion

1. Instalar o copiar este paquete en el backend estabilizado, nunca en el frontend Expo.
2. Adaptar el repositorio de resultados para entregar objetos `{ id, loteriaId, fecha, hora, numeros, fuente }` con datos reales y deduplicados.
3. Crear el servicio y la API:

```js
const { crearServicioAnalitico, crearApiInterna } = require("@loto-ia-rd/core-ia");
const api = crearApiInterna(crearServicioAnalitico());
const respuesta = await api.analizarLoteria({ loteriaId, resultados, diasEsperados: 90 });
```

4. Exponer `respuesta` detrás de una ruta autenticada y paginada. No enviar historicos completos desde el movil.
5. Mostrar siempre `aviso`, `explicacion.limitaciones` y `riesgo` en cualquier interfaz consumidora.

Para memoria persistente, el anfitrion crea `crearArchivoKnowledgeStore(ruta)` en desarrollo o implementa la misma interfaz `{ append, list }` con PostgreSQL en produccion. Tras persistir un resultado real, llama a `procesarResultadoHistorico`; esa operacion recalcula metricas y registra evidencia append-only.

No integrar `mockData`, datos sin fuente ni resultados generados. Para millones de filas, el adaptador PostgreSQL debe paginar/agregar por loteria y periodo antes de llamar al paquete.
