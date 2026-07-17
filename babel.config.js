// ============================================================
// BABEL CONFIG — faltaba este archivo. babel-preset-expo ya estaba
// en package.json como devDependency, pero sin este archivo no se
// aplicaba: Metro bundlea con una transformación por defecto en vez
// de la de Expo, lo cual puede causar comportamientos sutiles
// distintos a los esperados (JSX, alias de módulos, etc.).
// ============================================================
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
