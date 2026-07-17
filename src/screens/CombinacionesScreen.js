import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../theme/theme";
import { Loterias, TipoJuego, validarNumero } from "../core/models";
import { CombinacionesStore } from "../core/storage";
import LoteriaSelector from "../components/LoteriaSelector";
import Panel from "../components/Panel";
import GoldButton from "../components/GoldButton";

const TIPOS = [
  { id: TipoJuego.QUINIELA, label: "Quiniela", cantidad: 1 },
  { id: TipoJuego.PALE, label: "Palé", cantidad: 2 },
  { id: TipoJuego.TRIPLETA, label: "Tripleta", cantidad: 3 },
];

/**
 * COMBINACIONES (RF-08)
 * Objetivo: crear y guardar conjuntos de números propios (quiniela,
 * palé o tripleta) para compararlos luego contra resultados oficiales
 * desde el módulo MIVR. No implica ninguna apuesta real.
 */
export default function CombinacionesScreen() {
  const [loteriaId, setLoteriaId] = useState(Loterias[0].id);
  const [tipoJuego, setTipoJuego] = useState(TipoJuego.QUINIELA);
  const [nombre, setNombre] = useState("");
  const [numeros, setNumeros] = useState(["", "", ""]);
  const [combinaciones, setCombinaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(() => {
    setCargando(true);
    CombinacionesStore.listar()
      .then(setCombinaciones)
      .catch(() => Alert.alert("No se pudieron cargar las combinaciones", "Intenta nuevamente."))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const tipoActual = TIPOS.find((t) => t.id === tipoJuego);
  const loteriaActual = Loterias.find((l) => l.id === loteriaId);
  const colorLoteria = loteriaActual ? colors.loteria[loteriaActual.colorKey] : colors.accent;

  function actualizarNumero(idx, valor) {
    const limpio = valor.replace(/[^0-9]/g, "").slice(0, 2);
    const copia = [...numeros];
    copia[idx] = limpio;
    setNumeros(copia);
  }

  async function guardar() {
    const numerosFinales = numeros.slice(0, tipoActual.cantidad).map((n) => n.padStart(2, "0"));

    if (numerosFinales.some((n) => n.length !== 2 || !validarNumero(n))) {
      Alert.alert("Números inválidos", "Cada número debe estar entre 00 y 99.");
      return;
    }
    if (!nombre.trim()) {
      Alert.alert("Falta el nombre", "Ponle un nombre a tu combinación para identificarla luego.");
      return;
    }

    const nueva = {
      id: `comb-${Date.now()}`,
      nombre: nombre.trim(),
      loteriaId,
      tipoJuego,
      numeros: numerosFinales,
      creadaEn: new Date().toISOString(),
    };
    const actualizadas = await CombinacionesStore.guardar(nueva);
    setCombinaciones(actualizadas);
    setNombre("");
    setNumeros(["", "", ""]);
  }

  function eliminar(id) {
    Alert.alert("Eliminar combinación", "¿Seguro que quieres eliminarla?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const actualizadas = await CombinacionesStore.eliminar(id);
          setCombinaciones(actualizadas);
        },
      },
    ]);
  }

  async function compartirCombinaciones() {
    if (combinaciones.length === 0) {
      Alert.alert("Nada que compartir", "Todavía no tienes combinaciones guardadas.");
      return;
    }
    try {
      const lineas = combinaciones
        .map((c) => {
          const l = Loterias.find((x) => x.id === c.loteriaId);
          return `• ${c.nombre}: ${c.numeros.join("-")} (${l?.nombre ?? c.loteriaId})`;
        })
        .join("\n");
      await Share.share({ message: `🎯 Mis combinaciones — LOTO IA RD\n\n${lineas}` });
    } catch (e) {
      Alert.alert("No se pudo compartir", e.message);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        data={combinaciones}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
        ListHeaderComponent={
          <View>
            <Panel titulo="NUEVA COMBINACIÓN" subtitulo="Guarda tus números para compararlos contra los resultados oficiales">
              <LoteriaSelector seleccionada={loteriaId} onSeleccionar={setLoteriaId} />

              <View style={styles.tipoRow}>
                {TIPOS.map((t) => {
                  const activo = t.id === tipoJuego;
                  return (
                    <TouchableOpacity key={t.id} onPress={() => setTipoJuego(t.id)} style={[styles.tipoChip, activo && styles.tipoChipActivo]}>
                      <Text style={[styles.tipoChipText, activo && styles.tipoChipTextActivo]}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                placeholder="Nombre de la combinación (ej. Mi fija de los lunes)"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
              />

              <View style={styles.numerosInputRow}>
                {Array.from({ length: tipoActual.cantidad }).map((_, idx) => (
                  <TextInput
                    key={idx}
                    placeholder="00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={[styles.numeroInput, { borderColor: colorLoteria }]}
                    value={numeros[idx]}
                    onChangeText={(v) => actualizarNumero(idx, v)}
                  />
                ))}
              </View>

              <GoldButton titulo="GUARDAR COMBINACIÓN" icono="save-outline" onPress={guardar} />
            </Panel>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={typography.h3}>Mis combinaciones ({combinaciones.length})</Text>
              <TouchableOpacity onPress={compartirCombinaciones}>
                <Ionicons name="share-social-outline" size={20} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const loteria = Loterias.find((l) => l.id === item.loteriaId);
          const tipo = TIPOS.find((t) => t.id === item.tipoJuego);
          const color = loteria ? colors.loteria[loteria.colorKey] : colors.accent;
          return (
            <View style={[styles.card, shadow.card]}>
              <View style={styles.numerosMini}>
                {item.numeros.map((n, idx) => (
                  <View key={idx} style={[styles.miniCirculo, { borderColor: color }]}>
                    <Text style={styles.miniCirculoTexto}>{n}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={typography.body}>{item.nombre}</Text>
                <Text style={typography.bodySecondary}>
                  {loteria?.nombre} · {tipo?.label}
                </Text>
              </View>
              <TouchableOpacity onPress={() => eliminar(item.id)}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          !cargando ? (
            <Text style={[typography.bodySecondary, { textAlign: "center", marginTop: spacing.lg }]}>
              Todavía no tienes combinaciones guardadas.
            </Text>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  tipoRow: { flexDirection: "row", marginBottom: spacing.md },
  tipoChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bgElevated,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipoChipActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tipoChipText: { color: colors.textSecondary, fontWeight: "600", fontSize: 13 },
  tipoChipTextActivo: { color: colors.textOnPrimary },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  numerosInputRow: { flexDirection: "row", marginBottom: spacing.md },
  numeroInput: {
    backgroundColor: colors.bgElevated,
    borderRadius: 28,
    width: 56,
    height: 56,
    color: colors.textPrimary,
    borderWidth: 2,
    textAlign: "center",
    marginRight: spacing.sm,
    fontSize: 18,
    fontWeight: "800",
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
  numerosMini: { flexDirection: "row" },
  miniCirculo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  miniCirculoTexto: { color: colors.textPrimary, fontWeight: "800", fontSize: 12 },
});
