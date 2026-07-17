import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/theme";

/**
 * Número en círculo con halo dorado y brillo, inspirado en las bolas
 * de lotería del logo de LOTO IA RD. Se usa en Resultados, Números
 * Destacados, Combinaciones, Mezclador y Generador — un solo lugar
 * para que el efecto sea consistente en toda la app.
 */
export default function GoldNumberBadge({ numero, size = 52, color = colors.accent, relleno = false }) {
  const halo = Math.round(size * 1.3);
  return (
    <View style={[styles.contenedor, { width: halo, height: halo }]}>
      <View
        style={[
          styles.halo,
          { width: halo, height: halo, borderRadius: halo / 2, backgroundColor: color, opacity: 0.18 },
        ]}
      />
      <View
        style={[
          styles.circulo,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            backgroundColor: relleno ? color : colors.bgElevated,
            shadowColor: color,
          },
        ]}
      >
        <Text
          style={[
            styles.texto,
            { fontSize: size * 0.36, color: relleno ? colors.bg : colors.textPrimary },
          ]}
        >
          {numero}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute" },
  circulo: {
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  texto: { fontWeight: "800" },
});
