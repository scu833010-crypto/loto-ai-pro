// ============================================================
// RATE LIMIT — protege el servidor y, sobre todo, es respetuoso con
// la fuente externa: evita que muchas peticiones de la app disparen
// muchos scrapes simultáneos (la caché ya absorbe la mayoría, esto
// es la segunda barrera).
// ============================================================

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_PER_MINUTE || 60),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones, intenta de nuevo en un momento." },
});

module.exports = limiter;
