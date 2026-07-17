import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../theme/theme";

// Fallback deliberado: no se inventan ni alteran marcas registradas.
// Al recibir activos oficiales autorizados se agrega su ruta al mapa central.
const LOGOS_OFICIALES = {
  leidsa: require("../../assets/logos/leidsa.webp"),
  florida: require("../../assets/logos/florida.jpg"),
  lotedom: require("../../assets/logos/lotedom.png"),
  "loteria-nacional": require("../../assets/logos/loteria-nacional.png"),
  real: require("../../assets/logos/real.jpg"),
};

export function tieneLogoOficial(loteriaId) {
  return Boolean(LOGOS_OFICIALES[loteriaId]);
}

export default function LotteryLogo({ loteria, size = 28 }) {
  const iniciales = (loteria?.nombre || "LO").split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
  const color = colors.loteria[loteria?.colorKey] || colors.primary;
  const logo = LOGOS_OFICIALES[loteria?.id];
  if (logo) {
    return <Image source={logo} accessibilityRole="image" accessibilityLabel={`Logo de ${loteria.nombre}`} style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }]} />;
  }
  return (
    <View accessibilityLabel={`Identificador de ${loteria?.nombre || "lotería"}`} style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <Text style={[styles.texto, { fontSize: Math.max(9, size * 0.34), color }]}>{iniciales}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center", backgroundColor: colors.bgElevated, borderWidth: 1 },
  texto: { fontWeight: "800" },
  logo: { resizeMode: "contain", backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border },
});
