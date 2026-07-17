import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../theme/theme";
import { CombinacionesStore, InversionesStore } from "../core/storage";
import { obtenerHistoricoPorLoteriaAsync } from "../core/resultadosRepository";
import { verificarInversion, calcularGanancia } from "../core/mivrEngine";
import { FactorPagoReferencial } from "../core/payoutRules";
import Panel from "../components/Panel";
import GoldButton from "../components/GoldButton";

/**
 * MIVR — Módulo de Inversión y Verificación de Resultados (RF-09, RF-10)
 * Objetivo: registrar cuánto y en qué combinación se jugó, y cotejar
 * automáticamente esa jugada contra los resultados oficiales.
 */
export default function InversionesScreen() {
  const [combinaciones, setCombinaciones] = useState([]);
  const [inversiones, setInversiones] = useState([]);
  const [combinacionSeleccionada, setCombinacionSeleccionada] = useState(null);
  const [monto, setMonto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [verificandoId, setVerificandoId] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    const [combs, invs] = await Promise.all([CombinacionesStore.listar(), InversionesStore.listar()]);
    setCombinaciones(combs);
    setInversiones(invs);
    setCombinacionSeleccionada((actual) => actual ?? (combs.length > 0 ? combs[0].id : null));
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function registrar() {
    const montoNum = parseFloat(monto);
    if (!combinacionSeleccionada) {
      Alert.alert("Falta combinación", "Primero crea una combinación en la pestaña Combinaciones.");
      return;
    }
    if (!montoNum || montoNum <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto mayor a 0.");
      return;
    }
    const nueva = {
      id: `inv-${Date.now()}`,
      combinacionId: combinacionSeleccionada,
      monto: montoNum,
      fecha: new Date().toISOString().slice(0, 10),
      estado: "pendiente",
      gananciaEstimada: 0,
    };
    const actualizadas = await InversionesStore.guardar(nueva);
    setInversiones(actualizadas);
    setMonto("");
  }

  async function verificar(inversion) {
    const combinacion = combinaciones.find((c) => c.id === inversion.combinacionId);
    if (!combinacion) return;
    setVerificandoId(inversion.id);
    const historico = await obtenerHistoricoPorLoteriaAsync(combinacion.loteriaId);
    const { coincide } = verificarInversion(inversion, combinacion, historico);
    const ganancia = coincide ? calcularGanancia(inversion.monto, combinacion.tipoJuego, FactorPagoReferencial) : 0;
    const actualizadas = await InversionesStore.actualizar(inversion.id, {
      estado: coincide ? "gano" : "no_coincidio",
      gananciaEstimada: ganancia,
    });
    setInversiones(actualizadas);
    setVerificandoId(null);
  }

  function eliminar(id) {
    Alert.alert("Eliminar registro", "¿Seguro que quieres eliminar esta inversión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => setInversiones(await InversionesStore.eliminar(id)),
      },
    ]);
  }

  const totalInvertido = useMemo(() => inversiones.reduce((acc, i) => acc + i.monto, 0), [inversiones]);
  const totalGanado = useMemo(() => inversiones.reduce((acc, i) => acc + (i.gananciaEstimada || 0), 0), [inversiones]);

  return (
    <View style={styles.container}>
      <FlatList
        data={inversiones}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
        ListHeaderComponent={
          <View>
            <Panel
              titulo="MIVR — INVERSIÓN Y VERIFICACIÓN"
              subtitulo="Las ganancias son estimadas con un factor de pago referencial, no oficial"
            >
              {cargando ? (
                <ActivityIndicator color={colors.accent} />
              ) : combinaciones.length === 0 ? (
                <Text style={typography.bodySecondary}>
                  Primero crea una combinación en la pestaña "Combinaciones".
                </Text>
              ) : (
                <>
                  <Text style={[typography.caption, { marginBottom: spacing.xs }]}>Combinación</Text>
                  <FlatList
                    horizontal
                    data={combinaciones}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: spacing.md }}
                    renderItem={({ item }) => {
                      const activo = item.id === combinacionSeleccionada;
                      return (
                        <TouchableOpacity onPress={() => setCombinacionSeleccionada(item.id)}>
                          <View style={[styles.combChip, activo && styles.combChipActivo]}>
                            <Text style={[styles.combChipText, activo && styles.combChipTextActivo]}>
                              {item.nombre} ({item.numeros.join("-")})
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                  <TextInput
                    placeholder="Monto invertido (RD$)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    style={styles.input}
                    value={monto}
                    onChangeText={setMonto}
                  />
                  <GoldButton titulo="REGISTRAR INVERSIÓN" icono="add-circle-outline" onPress={registrar} />
                </>
              )}
            </Panel>

            <View style={styles.resumenRow}>
              <View style={[styles.resumenCard, shadow.card]}>
                <Text style={typography.caption}>INVERTIDO</Text>
                <Text style={[typography.h2, { color: colors.textPrimary }]}>RD$ {totalInvertido.toFixed(0)}</Text>
              </View>
              <View style={[styles.resumenCard, shadow.card]}>
                <Text style={typography.caption}>GANADO (ESTIMADO)</Text>
                <Text style={[typography.h2, { color: colors.success }]}>RD$ {totalGanado.toFixed(0)}</Text>
              </View>
            </View>

            <Text style={[typography.h3, { marginTop: spacing.sm, marginBottom: spacing.sm }]}>
              Mis inversiones ({inversiones.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const combinacion = combinaciones.find((c) => c.id === item.combinacionId);
          const estadoColor =
            item.estado === "gano" ? colors.success : item.estado === "no_coincidio" ? colors.textMuted : colors.warning;
          const estadoLabel =
            item.estado === "gano" ? "Coincidió" : item.estado === "no_coincidio" ? "No coincidió" : "Pendiente";
          return (
            <View style={[styles.card, shadow.card]}>
              <View style={{ flex: 1 }}>
                <Text style={typography.body}>{combinacion?.nombre ?? "Combinación eliminada"}</Text>
                <Text style={typography.bodySecondary}>
                  RD$ {item.monto} · {item.fecha}
                </Text>
                <Text style={{ color: estadoColor, fontWeight: "700", marginTop: 2 }}>{estadoLabel}</Text>
              </View>
              {item.estado === "pendiente" && combinacion && (
                <TouchableOpacity onPress={() => verificar(item)} disabled={verificandoId === item.id}>
                  {verificandoId === item.id ? (
                    <ActivityIndicator color={colors.accent} />
                  ) : (
                    <Ionicons name="checkmark-done-outline" size={22} color={colors.accent} />
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => eliminar(item.id)} style={{ marginLeft: spacing.sm }}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          !cargando ? (
            <Text style={[typography.bodySecondary, { textAlign: "center" }]}>Todavía no registras inversiones.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  combChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bgElevated,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  combChipActivo: { backgroundColor: colors.accent, borderColor: colors.accent },
  combChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  combChipTextActivo: { color: colors.bg, fontWeight: "800" },
  resumenRow: { flexDirection: "row", marginBottom: spacing.sm },
  resumenCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
});
