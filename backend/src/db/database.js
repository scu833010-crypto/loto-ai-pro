// ============================================================
// BASE DE DATOS — SQLite embebido (better-sqlite3, síncrono, sin
// servidor de base de datos aparte). Persiste resultados históricos
// y la bitácora de eventos del sistema (para Monitor y Noticias).
// ============================================================

const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = process.env.DATABASE_PATH || process.env.DB_PATH || path.join(__dirname, "..", "..", "data.sqlite");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS resultados (
    id TEXT PRIMARY KEY,
    loteriaId TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    tipoJuego TEXT NOT NULL,
    numeros TEXT NOT NULL,
    fuente TEXT,
    creadoEn TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_resultados_loteria_fecha
    ON resultados (loteriaId, fecha);
`);

// Migración incremental: agrega columnas nuevas si la base de datos ya
// existía de un despliegue anterior (SQLite no soporta "ADD COLUMN IF
// NOT EXISTS", así que se revisa el esquema actual antes de alterar).
const columnasActuales = db.prepare(`PRAGMA table_info(resultados)`).all().map((c) => c.name);
const columnasNuevas = {
  nombreJuego: "TEXT",
  money: "TEXT",
  actualizadoEn: "TEXT",
  seRealizaEseDia: "INTEGER", // 1 | 0 | NULL
  providerGameId: "TEXT",
  referenciaFuente: "TEXT",
  verificationStatus: "TEXT",
  recibidoEn: "TEXT",
};
for (const [columna, tipo] of Object.entries(columnasNuevas)) {
  if (!columnasActuales.includes(columna)) {
    db.exec(`ALTER TABLE resultados ADD COLUMN ${columna} ${tipo}`);
  }
}

db.exec(`

  CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,          -- 'info' | 'error' | 'advertencia'
    etapa TEXT NOT NULL,         -- 'internet' | 'scraper' | 'normalizador' | 'baseDatos'
    mensaje TEXT NOT NULL,
    creadoEn TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS estado_pipeline (
    etapa TEXT PRIMARY KEY,
    ok INTEGER NOT NULL,
    detalle TEXT,
    actualizadoEn TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
