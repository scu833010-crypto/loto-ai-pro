import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../theme/theme";
import { Loterias, validarNumero } from "../core/models";
import { obtenerHistoricoPorLoteriaAsync } from "../core/resultadosRepository";
import { CorreccionesStore, AuditLogStore } from "../core/storage";
import { formatoFechaHoraRD } from "../core/fechaHoraRD";
import LoteriaSelector from "../components/LoteriaSelector";
import Panel from "../components/Panel";
import GoldButton from "../components/GoldButton";

// Acceso de DEMOSTRACIÓN. En producción se reemplaza por autenticación
// real con roles (ver Tomo IX de la SRS: Seguridad).

/**
 * ADMINISTRACIÓN (RF-14, RF-15, RNF-08)
 * Objetivo: permitir corregir un resultado publicado erróneamente,
 * dejando SIEMPRE un registro de auditoría (motivo, autor, valor
 * anterior y nuevo). Ninguna corrección sobrescribe sin rastro.
 */
export default function AdministracionScreen() {
  const [autenticado, setAutenticado] = useState(false);
  const [pin, setPin] = useState("");

  const [loteriaId, setLoteriaId] = useState(Loterias[0].id);
  const [resultados, setResultados] = useState([]);
  const [resultadoSeleccionado, setResultadoSeleccionado] = useState(null);
  const [numerosNuevos, setNumerosNuevos] = useState([]); // uno por posición, preserva la cantidad original
  const [motivo, setMotivo] = useState("");
  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    if (!autenticado) return;
    obtenerHistoricoPorLoteriaAsync(loteriaId).then((data) => setResultados(data.slice(0, 20)));
  }, [loteriaId, autenticado]);

  useEffect(() => {
    if (autenticado) AuditLogStore.listar().then(setAuditLog);
  }, [autenticado]);

  // Al seleccionar un resultado, se precargan sus números actuales —
  // así el administrador solo cambia el/los que están mal, en vez de
  // tener que reescribir todos, y nunca se pierde la cantidad original
  // (un pale sigue siendo 2 números, una tripleta sigue siendo 3).
  function seleccionarResultado(item) {
    setResultadoSeleccionado(item);
    setNumerosNuevos([...item.numeros]);
  }

  function cambiarNumeroEnPosicion(index, valor) {
    const limpio = valor.replace(/[^0-9]/g, "");
    setNumerosNuevos((prev) => prev.map((n, i) => (i === index ? limpio : n)));
  }

  function entrar() {
    if (
      __DEV__ &&
      typeof process.env.EXPO_PUBLIC_ADMIN_DEMO_PIN === "string" &&
      pin === process.env.EXPO_PUBLIC_ADMIN_DEMO_PIN
    ) {
      setAutenticado(true);
    } else {
      Alert.alert("PIN incorrecto", "Este es un acceso de demostración de un solo operador. Contacta al administrador del proyecto si no tienes el PIN.");
    }
  }

  async function corregir() {
    if (!resultadoSeleccionado) {
      Alert.alert("Selecciona un resultado", "Toca un resultado de la lista para corregirlo.");
      return;
    }
    if (numerosNuevos.length !== resultadoSeleccionado.numeros.length) {
      // Salvaguarda: nunca se guarda una corrección con una cantidad de
      // números distinta a la del resultado original.
      Alert.alert("Cantidad inválida", `Este resultado debe tener ${resultadoSeleccionado.numeros.length} número(s).`);
      return;
    }
    if (!numerosNuevos.every((n) => validarNumero(n))) {
      Alert.alert("Número inválido", "Todos los números deben estar entre 00 y 99.");
      return;
    }
    if (!motivo.trim()) {
      Alert.alert("Falta el motivo", "Toda corrección debe registrar un motivo para la auditoría.");
      return;
    }
    const numerosFormateados = numerosNuevos.map((n) => n.padStart(2, "0"));
    await CorreccionesStore.corregir(resultadoSeleccionado.id, numerosFormateados, motivo.trim());
    Alert.alert("Corrección registrada", "El cambio quedó guardado con auditoría.");
    setNumerosNuevos([]);
    setMotivo("");
    setResultadoSeleccionado(null);
    const [nuevoHistorico, nuevoLog] = await Promise.all([
      obtenerHistoricoPorLoteriaAsync(loteriaId),
      AuditLogStore.listar(),
    ]);
    setResultados(nuevoHistorico.slice(0, 20));
    setAuditLog(nuevoLog);
  }

  if (!autenticado) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginIconWrap}>
          <Ionicons name="lock-closed-outline" size={32} color={colors.accent} />
        </View>
        <Text style={[typography.h2, { marginTop: spacing.md }]}>Acceso de administrador</Text>
        <Text style={[typography.bodySecondary, { textAlign: "center", marginBottom: spacing.lg }]}>
          Acceso de demostración. En producción se reemplaza por autenticación real con roles.
        </Text>
        <TextInput
          placeholder="PIN"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          secureTextEntry
          style={styles.input}
          value={pin}
          onChangeText={setPin}
        />
        <GoldButton titulo="ENTRAR" onPress={entrar} style={{ width: "100%" }} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={resultados}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
      ListHeaderComponent={
        <View>
          <Panel titulo="CORRECCIÓN DE RESULTADOS" subtitulo="Toca un resultado para corregirlo. Cada cambio queda en auditoría.">
            <LoteriaSelector seleccionada={loteriaId} onSeleccionar={setLoteriaId} />
          </Panel>

          {resultadoSeleccionado && (
            <Panel titulo="CORRIGIENDO" style={{ borderColor: colors.warning }}>
              <Text style={[typography.body, { marginBottom: spacing.sm }]}>
                {resultadoSeleccionado.fecha} {resultadoSeleccionado.hora} — actual:{" "}
                {resultadoSeleccionado.numeros.join(", ")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
                {numerosNuevos.map((valor, index) => (
                  <TextInput
                    key={index}
                    placeholder={`Núm. ${index + 1}`}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={[styles.input, { width: 90 }]}
                    value={valor}
                    onChangeText={(v) => cambiarNumeroEnPosicion(index, v)}
                  />
                ))}
              </View>
              <TextInput
                placeholder="Motivo de la corrección (obligatorio)"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={motivo}
                onChangeText={setMotivo}
              />
              <GoldButton titulo="GUARDAR CORRECCIÓN" onPress={corregir} />
            </Panel>
          )}

          <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Resultados recientes</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => seleccionarResultado(item)}>
          <View style={[styles.card, shadow.card]}>
            <Text style={typography.body}>
              {item.fecha} {item.hora} — {item.numeros.join(", ")} {item.corregido ? "✏️" : ""}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      ListFooterComponent={
        <View style={{ marginTop: spacing.md }}>
          <Panel titulo={`REGISTRO DE AUDITORÍA (${auditLog.length})`}>
            {auditLog.slice(0, 10).map((log) => (
              <View key={log.id} style={styles.logFila}>
                <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
                <Text style={[typography.bodySecondary, { marginLeft: spacing.xs, flex: 1 }]}>
                  {formatoFechaHoraRD(log.fecha)} · {log.accion} · motivo: {log.motivo}
                </Text>
              </View>
            ))}
            {auditLog.length === 0 && (
              <Text style={typography.bodySecondary}>Todavía no hay correcciones registradas.</Text>
            )}
          </Panel>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  loginIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logFila: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.xs },
});
