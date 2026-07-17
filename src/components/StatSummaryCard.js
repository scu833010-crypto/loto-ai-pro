import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../theme/theme";

/**
 * Tarjeta compacta de métrica (usada en la fila superior del Dashboard):
 * ícono + etiqueta + valor grande + subtítulo opcional.
 */
export default function StatSummaryCard({ icono, titulo, valor, subtitulo, colorAcento = colors.primary }) {
  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.header}>
        {icono ? <Ionicons name={icono} size={16} color={colorAcento} style={{ marginRight: spacing.xs }} /> : null}
        <Text style={styles.titulo} numberOfLines={1}>
          {titulo}
        </Text>
      </View>
      <Text style={[typography.h1, { color: colorAcento, marginVertical: 2 }]}>{valor}</Text>
      {subtitulo ? <Text style={typography.caption}>{subtitulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginRight: spacing.sm,
    minWidth: 150,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  titulo: { ...typography.caption, textTransform: "uppercase", letterSpacing: 0.5 },
});
