import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, shadow } from "../theme/theme";

/**
 * Contenedor visual estándar de la app: fondo de tarjeta, borde sutil,
 * título en dorado mayúscula. Se usa en Dashboard, Estadísticas,
 * Combinaciones, Inversiones, Reportes y Administración para que todas
 * las pantallas compartan el mismo lenguaje visual.
 */
export default function Panel({ titulo, subtitulo, children, style }) {
  return (
    <View style={[styles.panel, shadow.card, style]}>
      {titulo ? <Text style={styles.titulo}>{titulo}</Text> : null}
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  titulo: { color: colors.accent, fontWeight: "800", fontSize: 13, letterSpacing: 0.5, marginBottom: 4 },
  subtitulo: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
});
