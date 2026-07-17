// ============================================================
// FAVORITOS — lógica pura (sin AsyncStorage, sin React Native).
// La persistencia vive en storage.js (FavoritosStore); acá solo se
// decide CÓMO se reordenan/filtran las loterías dado un conjunto de
// ids favoritos, para poder probar esta regla de negocio con Jest
// sin tener que mockear AsyncStorage.
// ============================================================

/**
 * Devuelve una copia de `loterias` con las favoritas primero (en el
 * mismo orden relativo entre ellas que tenían originalmente), seguidas
 * del resto (también en su orden original). No muta el array de entrada.
 */
export function ordenarLoteriasPorFavoritas(loterias, favoritosIds = []) {
  const favoritas = loterias.filter((l) => favoritosIds.includes(l.id));
  const resto = loterias.filter((l) => !favoritosIds.includes(l.id));
  return [...favoritas, ...resto];
}

/** true/false según si ese id de lotería está en la lista de favoritos. */
export function esLoteriaFavorita(loteriaId, favoritosIds = []) {
  return favoritosIds.includes(loteriaId);
}
