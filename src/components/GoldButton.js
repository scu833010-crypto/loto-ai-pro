import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/theme";

/**
 * Botón de acción principal, dorado — el mismo lenguaje visual del
 * botón "VER ANÁLISIS COMPLETO" del Dashboard. Se usa para la acción
 * principal de cada pantalla: Guardar, Registrar, Exportar, Entrar.
 */
export default function GoldButton({ titulo, icono, onPress, cargando = false, disabled = false, variante = "solido", style }) {
  const esSolido = variante === "solido";
  return (
    <TouchableOpacity
      style={[styles.boton, esSolido ? styles.solido : styles.contorno, disabled && styles.deshabilitado, style]}
      onPress={onPress}
      disabled={disabled || cargando}
    >
      {cargando ? (
        <ActivityIndicator color={esSolido ? colors.bg : colors.accent} />
      ) : (
        <View style={styles.contenido}>
          {icono ? (
            <Ionicons name={icono} size={16} color={esSolido ? colors.bg : colors.accent} style={{ marginRight: spacing.xs }} />
          ) : null}
          <Text style={[styles.texto, { color: esSolido ? colors.bg : colors.accent }]}>{titulo}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  solido: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  contorno: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.accent },
  deshabilitado: { opacity: 0.5 },
  contenido: { flexDirection: "row", alignItems: "center" },
  texto: { fontWeight: "800", fontSize: 13, letterSpacing: 0.3 },
});
