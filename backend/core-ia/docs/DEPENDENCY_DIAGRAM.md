# Diagrama de dependencias

```mermaid
flowchart TD
  API[api/internalApi] --> AS[analyticsService]
  AS --> V[shared/validation]
  AS --> S[engines/statisticsEngine]
  AS --> T[Trend + Correlation]
  AS --> P[Probability + Ranking]
  AS --> E[Evaluation + Simulation]
  AS --> R[Risk + Explain]
  LS[learning/evidenceLearningService] --> AS
  LS --> KS[knowledge/fileKnowledgeStore]
  AI[optimization/autoImprovementEngine] --> KS
```

Las flechas siempre apuntan hacia reglas de dominio o interfaces. Ningun modulo depende de Expo, React Native, componentes visuales, Express, ORM o una base de datos concreta.
