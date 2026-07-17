import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, spacing, radius, typography, shadow } from "../theme/theme";

export function PremiumCard({ children, style }) { return <View style={[styles.card, shadow.card, style]}>{children}</View>; }
export function StatusBadge({ estado, label }) {
  const color = estado === "realizado" ? colors.success : estado === "pendiente" ? colors.warning : estado === "error" ? colors.danger : colors.textMuted;
  return <View style={[styles.badge, { borderColor: color }]}><Text style={[styles.badgeText, { color }]}>{label}</Text></View>;
}
export function LoadingState({ mensaje = "Cargando…" }) { return <View style={styles.center}><ActivityIndicator color={colors.accent} /><Text style={styles.text}>{mensaje}</Text></View>; }
export function EmptyState({ mensaje }) { return <View style={styles.center}><Text style={styles.text}>{mensaje}</Text></View>; }
export function ErrorState({ mensaje }) { return <View style={styles.center}><Text style={[styles.text, { color: colors.danger }]}>{mensaje}</Text></View>; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md }, badge: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 }, badgeText: { fontSize: 11, fontWeight: "700" }, center: { padding: spacing.lg, alignItems: "center" }, text: { ...typography.bodySecondary, textAlign: "center", marginTop: spacing.sm } });
