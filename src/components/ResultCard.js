import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../theme/theme";
import { obtenerLoteriaPorId } from "../core/models";
import GoldNumberBadge from "./GoldNumberBadge";

/**
 * Muestra un resultado individual: nombre de lotería, hora, y los
 * números del sorteo como bolas con halo y brillo (estilo del logo).
 *
 * compact=true: versión pequeña para grillas de 2 columnas (Dashboard),
 * sin botón de compartir (para no saturar la grilla).
 * compact=false (por defecto): versión completa, con botón de compartir.
 */
const ETIQUETAS_PREMIO = ["1er premio", "2do premio", "3er premio"];

export default function ResultCard({ resultado, compact = false }) {
  const loteria = obtenerLoteriaPorId(resultado.loteriaId);
  const colorLoteria = loteria ? colors.loteria[loteria.colorKey] : colors.primary;
  const esSimulado = typeof resultado.fuente === "string" && resultado.fuente.toUpperCase().includes("SIMULADO");
  const esVerificado = resultado.verificationStatus === "verified";
  const esPendiente = resultado.verificationStatus === "pending";

  async function compartir() {
    try {
      const nombreSorteo = resultado.nombreJuego || (loteria ? loteria.nombre : resultado.loteriaId);
      const mensaje =
        `🎱 ${nombreSorteo}${loteria && resultado.nombreJuego ? ` (${loteria.nombre})` : ""}\n` +
        `${resultado.fecha} · ${resultado.hora}\n\n` +
        `Números: ${resultado.numeros.join(" - ")}\n\n` +
        (esSimulado ? `⚠️ Dato simulado, no oficial.\n\n` : "") +
        `Vía LOTO IA RD`;
      await Share.share({ message: mensaje });
    } catch (e) {
      Alert.alert("No se pudo compartir", e.message);
    }
  }

  return (
    <View style={[styles.card, shadow.card, compact && styles.cardCompact]}>
      {esSimulado && (
        <View style={styles.avisoSimulado}>
          <Text style={styles.avisoSimuladoTexto}>⚠️ SIMULADO — no oficial</Text>
        </View>
      )}
      {!esSimulado && esVerificado ? <Text style={styles.verificadoTag}>Fuente verificada</Text> : null}
      {!esSimulado && esPendiente ? <Text style={styles.pendienteTag}>Pendiente de verificación</Text> : null}
      <View style={styles.header}>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.nombreJuego, { color: colorLoteria }]} numberOfLines={1}>
            {resultado.nombreJuego || (loteria ? loteria.nombre : resultado.loteriaId)}
          </Text>
          {resultado.nombreJuego && loteria ? (
            <Text style={styles.nombreCompania} numberOfLines={1}>
              {loteria.nombre}
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.hora}>{resultado.hora}</Text>
          {!compact && (
            <TouchableOpacity onPress={compartir} style={styles.botonCompartir}>
              <Ionicons name="share-social-outline" size={15} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {resultado.corregido ? <Text style={styles.corregidoTag}>Corregido</Text> : null}

      <View style={styles.numerosRow}>
        {resultado.numeros.map((num, idx) => (
          <View key={idx} style={styles.bolaConEtiqueta}>
            <GoldNumberBadge numero={num} size={compact ? 34 : 52} color={colorLoteria} />
            {!compact && resultado.numeros.length === 3 && (
              <Text style={styles.etiquetaPremio}>{ETIQUETAS_PREMIO[idx]}</Text>
            )}
          </View>
        ))}
      </View>

      {!compact && <Text style={styles.fecha}>{resultado.fecha}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCompact: {
    flex: 1,
    padding: spacing.sm,
    marginBottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  nombreJuego: { fontSize: 12, fontWeight: "700" },
  nombreCompania: { fontSize: 10, color: colors.textMuted },
  hora: { ...typography.caption },
  botonCompartir: { marginLeft: spacing.sm },
  numerosRow: { flexDirection: "row", justifyContent: "center", marginVertical: spacing.xs },
  fecha: { ...typography.caption, textAlign: "center" },
  corregidoTag: { ...typography.caption, color: colors.warning, textAlign: "center", marginBottom: 2 },
  verificadoTag: { ...typography.caption, color: colors.success, textAlign: "center", marginBottom: 2 },
  pendienteTag: { ...typography.caption, color: colors.warning, textAlign: "center", marginBottom: 2 },
  avisoSimulado: {
    backgroundColor: colors.danger + "22",
    borderRadius: radius.sm,
    paddingVertical: 3,
    marginBottom: spacing.xs,
    alignItems: "center",
  },
  avisoSimuladoTexto: { color: colors.danger, fontSize: 10, fontWeight: "800" },
  bolaConEtiqueta: { alignItems: "center", marginHorizontal: 2 },
  etiquetaPremio: { color: colors.textMuted, fontSize: 9, marginTop: 2, textAlign: "center" },
});
