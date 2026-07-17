# Inventario y mapeo de `game_id`

Fecha de verificación: 2026-07-17. Proveedor: `loteriasdominicanas.com`.

## Método reproducible

1. Se consultó `GET /dominicana/sessions?date=2026-07-16T04:00:00.000Z`: 99 `game_id` y sus sesiones/formatos `score`.
2. Se leyó el payload público Nuxt de `https://loteriasdominicanas.com`: los mismos 99 IDs, cada uno asociado a compañía y nombre visible de juego.
3. Se contrastaron los horarios publicados en `https://loteriasdominicanas.com/pagina/horarios/`. Los feriados se consideran excepciones y nunca se infieren como horarios normales.

El catálogo ejecutable completo de los 59 IDs admitidos por LOTO IA RD está en `src/config/catalogoGameIds.js`. Cada entrada incluye proveedor, `gameId`, lotería interna, nombre de juego, zona horaria, formato, estado, fecha y fuentes. Solo las entradas con `status: "verified"` pasan al normalizador.

## Resultado

| Clasificación | Cantidad | Tratamiento |
|---|---:|---|
| Verificado e integrado | 59 | Leidsa, Nacional, Real, Loteka, Nueva York, Florida, La Primera, La Suerte, Lotedom y Anguila. |
| Descartado por alcance | 40 | Juegos americanos secundarios, King Lottery y Haiti Bolet; no tienen lotería interna autorizada. |
| Probable / sin identificar | 0 | No se usó ningún mapeo especulativo. |

## Correcciones detectadas

La evidencia pública corrigió cuatro etiquetas: `Lotería Nacional`, `Tu Fecha Real`, `Primera Noche` y `Loto 5`. Las variantes anteriores no se usan para horarios ni etiquetas.

## Evidencia de resultados

La API devuelve `_id`, `game_id`, `date`, `score`, `createdAt`, `updatedAt` y `site_ids`. El cliente persiste además `providerGameId`, `referenciaFuente`, `verificationStatus` y `recibidoEn`.
