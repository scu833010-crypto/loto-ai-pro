// ============================================================
// CACHÉ — evita golpear la fuente externa en cada petición.
// TTL configurable por variable de entorno CACHE_TTL_SECONDS.
// ============================================================

const NodeCache = require("node-cache");

const TTL = Number(process.env.CACHE_TTL_SECONDS || 120); // 2 minutos por defecto

const cache = new NodeCache({ stdTTL: TTL, checkperiod: Math.max(TTL / 2, 30) });

module.exports = cache;
