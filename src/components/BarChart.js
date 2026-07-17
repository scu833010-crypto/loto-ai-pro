import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography, radius } from "../theme/theme";

/**
 * Gráfico de barras horizontal minimalista, construido sin librerías
 * externas (para no añadir dependencias nativas al proyecto).
 * data: array de objetos; labelKey/valueKey indican qué campos usar.
 */
export default function BarChart({ data, labelKey, valueKey, colorAcento = colors.primary, maxItems = 12 }) {
  const items = data.slice(0, maxItems);
  const max = Math.max(...items.map((i) => i[valueKey]), 1);

  return (
    <View>
      {items.map((item, idx) => (
        <View key={idx} style={styles.row}>
          <Text style={styles.label}>{item[labelKey]}</Text>
          <View style={styles.trackWrap}>
            <View
              style={[
                styles.track,
                { width: `${Math.max((item[valueKey] / max) * 100, 3)}%`, backgroundColor: colorAcento },
              ]}
            />
          </View>
          <Text style={styles.value}>{item[valueKey]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: spacing.xs },
  label: { width: 50, ...typography.caption, color: colors.textSecondary },
  trackWrap: {
    flex: 1,
    height: 14,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    marginHorizontal: spacing.sm,
    overflow: "hidden",
  },
  track: { height: "100%", borderRadius: radius.sm },
  value: { width: 30, textAlign: "right", ...typography.caption },
});
