import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../theme/theme";
import { Loterias, validarNumero } from "../core/models";
import { generarPales, generarTripletas, contarCombinaciones } from "../core/generadorEngine";
import { CombinacionesStore } from "../core/storage";
import LoteriaSelector from "../components/LoteriaSelector";
import Panel from "../components/Panel";
import GoldButton from "../components/GoldButton";

const LIMITE_NUMEROS = 12; // 12 números -> 66 palés / 220 tripletas, ya es bastante

/**
 * GENERADOR DE PALÉS Y TRIPLETAS
 * Objetivo: a partir de un conjunto de números que el usuario elige,
 * generar automáticamente TODAS las combinaciones posibles de 2
 * (Palé) o 3 (Tripleta) entre ellos. Es combinatoria pura — no
 * analiza histórico ni predice nada.
 */
export default function GeneradorScreen() {
  const [numeroInput, setNumeroInput] = useState("");
  const [numeros, setNumeros] = useState([]);
  const [loteriaId, setLoteriaId] = useState(Loterias[0].id);
  const [pales, setPales] = useState(null);
  const [tripletas, setTripletas] = useState(null);
  const [guardandoTodo, setGuardandoTodo] = useState(false);

  function agregarNumero() {
    const limpio = numeroInput.padStart(2, "0");
    if (!validarNumero(limpio)) {
      Alert.alert("Número inválido", "Debe estar entre 00 y 99.");
      return;
    }
    if (numeros.includes(limpio)) {
      Alert.alert("Ya está", `${limpio} ya está en la lista.`);
      return;
    }
    if (numeros.length >= LIMITE_NUMEROS) {
      Alert.alert("Límite alcanzado", `Máximo ${LIMITE_NUMEROS} números por generación.`);
      return;
    }
    setNumeros([...numeros, limpio]);
    setNumeroInput("");
    setPales(null);
    setTripletas(null);
  }

  function quitarNumero(n) {
    setNumeros(numeros.filter((x) => x !== n));
    setPales(null);
    setTripletas(null);
  }

  function generar(tipo) {
    if (numeros.length < (tipo === "pale" ? 2 : 3)) {
      Alert.alert("Faltan números", `Necesitas al menos ${tipo === "pale" ? 2 : 3} números.`);
      return;
    }
    if (tipo === "pale") setPales(generarPales(numeros));
    else setTripletas(generarTripletas(numeros));
  }

  async function guardarTodas(lista, tipoJuego) {
    setGuardandoTodo(true);
    for (const combo of lista) {
      await CombinacionesStore.guardar({
        id: `comb-${Date.now()}-${combo.join("")}-${Math.random().toString(36).slice(2, 6)}`,
        nombre: `Generador: ${combo.join("-")}`,
        loteriaId,
        tipoJuego,
        numeros: combo,
        creadaEn: new Date().toISOString(),
      });
    }
    setGuardandoTodo(false);
    Alert.alert("Guardado", `${lista.length} combinaciones guardadas.`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
      <Panel
        titulo="GENERADOR DE PALÉS Y TRIPLETAS"
        subtitulo="Elige tus números y genera automáticamente todas las combinaciones posibles"
      >
        <Text style={[typography.caption, { marginBottom: spacing.xs }]}>Lotería para guardar combinaciones</Text>
        <LoteriaSelector seleccionada={loteriaId} onSeleccionar={setLoteriaId} />

        <Text style={[typography.caption, { marginTop: spacing.sm, marginBottom: spacing.xs }]}>
          Números seleccionados ({numeros.length}/{LIMITE_NUMEROS})
        </Text>
        <View style={styles.chipsWrap}>
          {numeros.map((n) => (
            <TouchableOpacity key={n} onPress={() => quitarNumero(n)} style={styles.numeroChip}>
              <Text style={styles.numeroChipTexto}>{n}</Text>
              <Ionicons name="close" size={12} color={colors.bg} />
            </TouchableOpacity>
          ))}
          {numeros.length === 0 && (
            <Text style={typography.bodySecondary}>Agrega al menos 2 números para empezar.</Text>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing.sm }}>
          <TextInput
            placeholder="00"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={2}
            style={styles.input}
            value={numeroInput}
            onChangeText={(v) => setNumeroInput(v.replace(/[^0-9]/g, "").slice(0, 2))}
          />
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <GoldButton titulo="AGREGAR NÚMERO" icono="add-outline" onPress={agregarNumero} variante="contorno" />
          </View>
        </View>

        <View style={{ flexDirection: "row", marginTop: spacing.md }}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <GoldButton
              titulo={`PALÉS (${contarCombinaciones(numeros.length, 2)})`}
              icono="git-compare-outline"
              onPress={() => generar("pale")}
            />
          </View>
          <View style={{ flex: 1 }}>
            <GoldButton
              titulo={`TRIPLETAS (${contarCombinaciones(numeros.length, 3)})`}
              icono="apps-outline"
              onPress={() => generar("tripleta")}
            />
          </View>
        </View>
      </Panel>

      {pales && pales.length > 0 && (
        <Panel titulo={`PALÉS GENERADOS (${pales.length})`}>
          {pales.map((combo, idx) => (
            <View key={idx} style={styles.filaCombo}>
              <View style={styles.numerosCombo}>
                {combo.map((n) => (
                  <View key={n} style={[styles.circulo, { borderColor: colors.primary }]}>
                    <Text style={styles.circuloTexto}>{n}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          <GoldButton
            titulo="GUARDAR TODOS LOS PALÉS"
            icono="save-outline"
            onPress={() => guardarTodas(pales, "PALE")}
            cargando={guardandoTodo}
            style={{ marginTop: spacing.sm }}
          />
        </Panel>
      )}

      {tripletas && tripletas.length > 0 && (
        <Panel titulo={`TRIPLETAS GENERADAS (${tripletas.length})`}>
          {tripletas.map((combo, idx) => (
            <View key={idx} style={styles.filaCombo}>
              <View style={styles.numerosCombo}>
                {combo.map((n) => (
                  <View key={n} style={[styles.circulo, { borderColor: colors.accent }]}>
                    <Text style={styles.circuloTexto}>{n}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          <GoldButton
            titulo="GUARDAR TODAS LAS TRIPLETAS"
            icono="save-outline"
            onPress={() => guardarTodas(tripletas, "TRIPLETA")}
            cargando={guardandoTodo}
            style={{ marginTop: spacing.sm }}
          />
        </Panel>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap" },
  numeroChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  numeroChipTexto: { color: colors.bg, fontWeight: "800", fontSize: 13, marginRight: 4 },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    width: 60,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  filaCombo: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  numerosCombo: { flexDirection: "row" },
  circulo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },
  circuloTexto: { color: colors.textPrimary, fontWeight: "800", fontSize: 13 },
});
