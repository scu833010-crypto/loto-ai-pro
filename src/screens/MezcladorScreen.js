import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../theme/theme";
import { Loterias, validarNumero } from "../core/models";
import { generarMezcla } from "../core/mezcladorEngine";
import { CombinacionesStore } from "../core/storage";
import LoteriaSelector from "../components/LoteriaSelector";
import Panel from "../components/Panel";
import GoldButton from "../components/GoldButton";

/**
 * MEZCLADOR
 * Objetivo: a partir de un número base que el usuario juega o le gusta,
 * generar las combinaciones derivadas que tradicionalmente usan los
 * jugadores (invertido, complemento a 9, vecinos, suma reducida, doble).
 *
 * Importante: son transformaciones matemáticas fijas sobre el número
 * ingresado — el mismo resultado siempre para el mismo número base.
 * No analizan el histórico ni predicen ningún sorteo.
 *
 * Botones:
 * - "Generar combinaciones" -> valida el número base y calcula el set.
 * - Por cada resultado, "Guardar" -> lo guarda como Combinación en la
 *   lotería seleccionada, para verificarlo luego desde MIVR.
 */
export default function MezcladorScreen() {
  const [numeroBase, setNumeroBase] = useState("");
  const [loteriaId, setLoteriaId] = useState(Loterias[0].id);
  const [resultados, setResultados] = useState([]);
  const [guardando, setGuardando] = useState(null);

  function generar() {
    const limpio = numeroBase.padStart(2, "0");
    if (!validarNumero(limpio)) {
      Alert.alert("Número inválido", "Ingresa un número entre 00 y 99.");
      return;
    }
    setResultados(generarMezcla(limpio));
  }

  async function guardarComoCombinacion(item) {
    setGuardando(item.id);
    const nueva = {
      id: `comb-${Date.now()}`,
      nombre: `Mezclador: ${item.tecnica} de ${numeroBase.padStart(2, "0")}`,
      loteriaId,
      tipoJuego: "QUINIELA",
      numeros: [item.numero],
      creadaEn: new Date().toISOString(),
    };
    await CombinacionesStore.guardar(nueva);
    setGuardando(null);
    Alert.alert("Guardado", `${item.numero} se guardó en Combinaciones.`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
      <Panel
        titulo="MEZCLADOR"
        subtitulo="Combinaciones derivadas de un número — técnicas tradicionales, no una predicción"
      >
        <Text style={[typography.caption, { marginBottom: spacing.xs }]}>Lotería para guardar combinaciones</Text>
        <LoteriaSelector seleccionada={loteriaId} onSeleccionar={setLoteriaId} />

        <Text style={[typography.caption, { marginTop: spacing.sm, marginBottom: spacing.xs }]}>Número base</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            placeholder="56"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={2}
            style={styles.inputNumero}
            value={numeroBase}
            onChangeText={(v) => setNumeroBase(v.replace(/[^0-9]/g, "").slice(0, 2))}
          />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <GoldButton titulo="GENERAR COMBINACIONES" icono="shuffle-outline" onPress={generar} />
          </View>
        </View>
      </Panel>

      {resultados.length > 0 && (
        <View>
          {resultados.map((item) => (
            <View key={item.id} style={[styles.card, shadow.card]}>
              <View style={[styles.circulo, { borderColor: colors.accent }]}>
                <Text style={styles.circuloTexto}>{item.numero}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={typography.body}>{item.tecnica}</Text>
                <Text style={typography.bodySecondary}>{item.descripcion}</Text>
              </View>
              <TouchableOpacity onPress={() => guardarComoCombinacion(item)} disabled={guardando === item.id}>
                <Ionicons
                  name={guardando === item.id ? "hourglass-outline" : "bookmark-outline"}
                  size={22}
                  color={colors.accent}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inputNumero: {
    backgroundColor: colors.bgElevated,
    borderRadius: 28,
    width: 56,
    height: 56,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.accent,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  circulo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  circuloTexto: { color: colors.textPrimary, fontWeight: "800", fontSize: 16 },
});
