import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
import { colors, spacing, typography, radius } from "../theme/theme";
import { Loterias } from "../core/models";
import { obtenerRecientesAsync } from "../core/resultadosRepository";
import ResultCard from "../components/ResultCard";
import LoteriaSelector from "../components/LoteriaSelector";

const RANGOS = [
  { id: "hoy", label: "Hoy" },
  { id: "ayer", label: "Ayer" },
  { id: "7dias", label: "Últimos 7 días" },
  { id: "personalizada", label: "Fecha personalizada" },
];

/**
 * RESULTADOS RECIENTES (antes "Resultados de Hoy")
 * Objetivo: el sistema maneja histórico, consultas, estadísticas,
 * comparación y validación — no solo el día de hoy. Esta pantalla
 * deja elegir el rango: Hoy, Ayer, Últimos 7 días, o una fecha puntual.
 */
export default function ResultadosScreen() {
  const [loteriaSeleccionada, setLoteriaSeleccionada] = useState(Loterias[0].id);
  const [rango, setRango] = useState("hoy");
  const [fechaPersonalizada, setFechaPersonalizada] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (rango === "personalizada" && !/^\d{4}-\d{2}-\d{2}$/.test(fechaPersonalizada)) {
      setResultados([]);
      return;
    }
    let activo = true;
    setCargando(true);
    setError(null);
    obtenerRecientesAsync({ rango, fecha: fechaPersonalizada, loteriaId: loteriaSeleccionada })
      .then((data) => {
        if (activo) {
          setResultados(data);
          setCargando(false);
        }
      })
      .catch((e) => {
        if (activo) {
          setError(e.message);
          setCargando(false);
        }
      });
    return () => {
      activo = false;
    };
  }, [loteriaSeleccionada, rango, fechaPersonalizada]);

  return (
    <View style={styles.container}>
      <LoteriaSelector seleccionada={loteriaSeleccionada} onSeleccionar={setLoteriaSeleccionada} />

      <View style={styles.rangosRow}>
        {RANGOS.map((r) => {
          const activo = r.id === rango;
          return (
            <TouchableOpacity key={r.id} onPress={() => setRango(r.id)} style={[styles.rangoChip, activo && styles.rangoChipActivo]}>
              <Text style={[styles.rangoTexto, activo && styles.rangoTextoActivo]}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {rango === "personalizada" && (
        <TextInput
          placeholder="YYYY-MM-DD (ej. 2026-07-10)"
          placeholderTextColor={colors.textMuted}
          style={styles.inputFecha}
          value={fechaPersonalizada}
          onChangeText={setFechaPersonalizada}
        />
      )}

      {cargando ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
          renderItem={({ item }) => <ResultCard resultado={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={typography.bodySecondary}>
                {error
                  ? `No se pudo consultar: ${error}`
                  : rango === "personalizada" && !/^\d{4}-\d{2}-\d{2}$/.test(fechaPersonalizada)
                  ? "Escribe una fecha válida (YYYY-MM-DD) para consultarla."
                  : "No hay resultados para este rango todavía."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  rangosRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  rangoChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  rangoChipActivo: { backgroundColor: colors.accent, borderColor: colors.accent },
  rangoTexto: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  rangoTextoActivo: { color: colors.bg, fontWeight: "800" },
  inputFecha: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  empty: { padding: spacing.lg, alignItems: "center" },
});
