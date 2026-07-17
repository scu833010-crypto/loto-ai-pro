# Modulos implementados

| Motor | Estado | Responsabilidad |
|---|---|---|
| Statistics, Frequency, Delay, Pattern | Completo | Fachadas sobre el motor estadistico comun, sin duplicacion. |
| Mathematical | Completo | Resumen matematico historico. |
| Trend y Correlation | Completo | Tendencias y correlacion Phi descriptiva. |
| Probability | Completo | Proporcion empirica historica. |
| Evaluation | Completo | Backtesting frente a linea base aleatoria. |
| Learning | Completo | Registra evidencia despues de un resultado real. |
| Knowledge | Completo | Memoria JSONL append-only e interfaz reemplazable por PostgreSQL. |
| Simulation | Completo | Reproduccion de ventanas historicas existentes. |
| Optimization / Auto Improvement | Completo | Propone parametros; nunca aplica cambios automaticamente. |
| Ranking, Risk, Explainable | Completo | Presentacion descriptiva, calidad y limitaciones. |
| Validation y Analytics | Completo | Contrato de datos y orquestacion. |

## Pendiente en el anfitrion

- Adaptador PostgreSQL transaccional y control de acceso a la memoria.
- Orquestador de ingesta que llame a `procesarResultadoHistorico` despues de persistir un resultado real.
- Observabilidad, autenticacion y rate limiting de la API HTTP externa.

No son dependencias del paquete para conservar su desacoplamiento.
