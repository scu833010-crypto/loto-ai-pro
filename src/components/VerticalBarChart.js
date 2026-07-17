import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors } from "../theme/theme";

/**
 * Gráfico de barras verticales, desplazable horizontalmente, pensado
 * para mostrar los 100 números (00-99) en un espacio angosto de celular.
 */
export default function VerticalBarChart({ data, labelKey, valueKey, color = colors.primary, barWidth = 7, height = 90 }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {data.map((d, idx) => {
          const alto = Math.max((d[valueKey] / max) * height, 2);
          return (
            <View key={idx} style={styles.col}>
              <View style={{ width: barWidth, height: alto, backgroundColor: color, borderRadius: 3 }} />
              {idx % 5 === 0 ? <Text style={styles.label}>{d[labelKey]}</Text> : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", paddingBottom: 4 },
  col: { alignItems: "center", marginHorizontal: 2, width: 12 },
  label: { fontSize: 8, color: colors.textMuted, marginTop: 3 },
});
