import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../theme/theme";

const OPCIONES = [
  { id: "Mezclador", icon: "shuffle-outline", titulo: "Mezclador", subtitulo: "Invertido, complemento a 9, vecinos y más" },
  { id: "Generador", icon: "grid-outline", titulo: "Generador de Palés/Tripletas", subtitulo: "Todas las combinaciones posibles de tus números" },
  { id: "Combinaciones", icon: "layers-outline", titulo: "Combinaciones", subtitulo: "Crea y guarda tus números" },
  { id: "Inversiones", icon: "wallet-outline", titulo: "Inversiones (MIVR)", subtitulo: "Registra jugadas y verifica resultados" },
  { id: "Reportes", icon: "document-text-outline", titulo: "Reportes", subtitulo: "Exporta a PDF o Excel/CSV" },
  { id: "Noticias", icon: "newspaper-outline", titulo: "Noticias", subtitulo: "Bitácora real del sistema" },
  { id: "CentroEstadisticas", icon: "analytics-outline", titulo: "Centro de Estadísticas", subtitulo: "Ranking, tendencia, palés y tríos por lotería" },
  { id: "Calendario", icon: "calendar-outline", titulo: "Calendario", subtitulo: "Sorteos del día, pendientes y realizados" },
  { id: "Administracion", icon: "shield-checkmark-outline", titulo: "Administración", subtitulo: "Corrección de resultados con auditoría" },
];

/**
 * Hub de navegación de la pestaña "Más". Mantiene la pestaña liviana
 * y delega cada módulo a su propia pantalla en el stack.
 */
export default function MasScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Más</Text>
      {OPCIONES.map((op) => (
        <TouchableOpacity key={op.id} onPress={() => navigation.navigate(op.id)}>
          <View style={[styles.card, shadow.card]}>
            <View style={styles.iconWrap}>
              <Ionicons name={op.icon} size={22} color={colors.accent} />
            </View>
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={typography.h3}>{op.titulo}</Text>
              <Text style={typography.bodySecondary}>{op.subtitulo}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
