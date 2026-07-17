// ============================================================
// METRO CONFIG — excluye explícitamente /backend del bundle.
// Sin esto, Metro puede intentar escanear el backend (Express,
// better-sqlite3, Puppeteer/Chromium) como si fuera parte de la app
// móvil, lo cual puede colgar el empaquetador indefinidamente
// ("cargando" sin fin) especialmente si backend/node_modules existe.
// ============================================================

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const exclusionList = [/backend\/.*/, /backend$/];

config.resolver.blockList = Array.isArray(config.resolver.blockList)
  ? [...config.resolver.blockList, ...exclusionList]
  : exclusionList;

config.watchFolders = (config.watchFolders || []).filter(
  (folder) => !folder.includes("/backend")
);

module.exports = config;
