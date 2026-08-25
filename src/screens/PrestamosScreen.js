import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../theme/theme";
import { PrestamosStore } from "../core/storage";
import { formatoFechaHoraRD } from "../core/fechaHoraRD";
import Panel from "../components/Panel";
import GoldButton from "../components/GoldButton";

// Acceso de DEMOSTRACIÓN, igual que Administración. En producción se
// reemplaza por autenticación real con roles (ver Tomo IX de la SRS:
// Seguridad). Este módulo es contabilidad privada de quien tiene el PIN —
// ningún otro usuario de la app puede ver ni entrar aquí.

function calcularEstado(monto, montoPagado) {
  if (montoPagado <= 0) return "pendiente";
  if (montoPagado >= monto) return "pagado";
  return "abonado";
}

const ESTADO_LABEL = { pendiente: "Sin pagar nada", abonado: "Abonado", pagado: "Pagado" };
const ESTADO_COLOR = { pendiente: colors.danger, abonado: colors.warning, pagado: colors.success };

/**
 * PRÉSTAMOS — registro privado de préstamos otorgados, para llevar la
 * contabilidad de quién debe y cuánto. Todo préstamo se registra
 * inicialmente sin ningún pago (montoPagado = 0); los abonos se
 * registran después, uno por uno, hasta saldar la deuda.
 */
export default function PrestamosScreen() {
  const [autenticado, setAutenticado] = useState(false);
  const [pin, setPin] = useState("");

  const [prestamos, setPrestamos] = useState([]);
  const [deudor, setDeudor] = useState("");
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");
  const [abonandoId, setAbonandoId] = useState(null);
  const [montoAbono, setMontoAbono] = useState("");

  const cargar = useCallback(async () => {
    setPrestamos(await PrestamosStore.listar());
  }, []);

  useEffect(() => {
    if (autenticado) cargar();
  }, [autenticado, cargar]);

  function entrar() {
    if (
      __DEV__ &&
      typeof process.env.EXPO_PUBLIC_PRESTAMOS_PIN === "string" &&
      pin === process.env.EXPO_PUBLIC_PRESTAMOS_PIN
    ) {
      setAutenticado(true);
    } else {
      Alert.alert("PIN incorrecto", "Este es un acceso privado de un solo operador. Solo quien lleva la contabilidad tiene el PIN.");
    }
  }

  async function registrar() {
    const montoNum = parseFloat(monto);
    if (!deudor.trim()) {
      Alert.alert("Falta el nombre", "Ingresa a quién le prestaste.");
      return;
    }
    if (!montoNum || montoNum <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto mayor a 0.");
      return;
    }
    const nuevo = {
      id: `prestamo-${Date.now()}`,
      deudor: deudor.trim(),
      monto: montoNum,
      montoPagado: 0,
      estado: "pendiente",
      nota: nota.trim(),
      fecha: new Date().toISOString(),
    };
    const actualizados = await PrestamosStore.guardar(nuevo);
    setPrestamos(actualizados);
    setDeudor("");
    setMonto("");
    setNota("");
  }

  function abrirAbono(item) {
    setAbonandoId(item.id === abonandoId ? null : item.id);
    setMontoAbono("");
  }

  async function registrarAbono(item) {
    const abonoNum = parseFloat(montoAbono);
    const saldoPendiente = item.monto - item.montoPagado;
    if (!abonoNum || abonoNum <= 0) {
      Alert.alert("Monto inválido", "Ingresa un abono mayor a 0.");
      return;
    }
    if (abonoNum > saldoPendiente) {
      Alert.alert("Abono muy alto", `El saldo pendiente es RD$ ${saldoPendiente.toFixed(2)}.`);
      return;
    }
    const nuevoMontoPagado = item.montoPagado + abonoNum;
    const actualizados = await PrestamosStore.actualizar(item.id, {
      montoPagado: nuevoMontoPagado,
      estado: calcularEstado(item.monto, nuevoMontoPagado),
    });
    setPrestamos(actualizados);
    setAbonandoId(null);
    setMontoAbono("");
  }

  function eliminar(id) {
    Alert.alert("Eliminar préstamo", "¿Seguro que quieres eliminar este registro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => setPrestamos(await PrestamosStore.eliminar(id)),
      },
    ]);
  }

  const totalPrestado = useMemo(() => prestamos.reduce((acc, p) => acc + p.monto, 0), [prestamos]);
  const totalPendiente = useMemo(
    () => prestamos.reduce((acc, p) => acc + (p.monto - p.montoPagado), 0),
    [prestamos]
  );

  if (!autenticado) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginIconWrap}>
          <Ionicons name="lock-closed-outline" size={32} color={colors.accent} />
        </View>
        <Text style={[typography.h2, { marginTop: spacing.md }]}>Acceso privado</Text>
        <Text style={[typography.bodySecondary, { textAlign: "center", marginBottom: spacing.lg }]}>
          Contabilidad personal de préstamos. Acceso de demostración de un solo operador —
          nadie más puede entrar sin el PIN.
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
      data={prestamos}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
      ListHeaderComponent={
        <View>
          <Panel titulo="NUEVO PRÉSTAMO" subtitulo="Se registra sin ningún pago; los abonos se agregan después.">
            <TextInput
              placeholder="Nombre de la persona"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={deudor}
              onChangeText={setDeudor}
            />
            <TextInput
              placeholder="Monto prestado (RD$)"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              style={styles.input}
              value={monto}
              onChangeText={setMonto}
            />
            <TextInput
              placeholder="Nota (opcional)"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={nota}
              onChangeText={setNota}
            />
            <GoldButton titulo="REGISTRAR PRÉSTAMO (SIN PAGAR)" icono="add-circle-outline" onPress={registrar} />
          </Panel>

          <View style={styles.resumenRow}>
            <View style={[styles.resumenCard, shadow.card]}>
              <Text style={typography.caption}>TOTAL PRESTADO</Text>
              <Text style={[typography.h2, { color: colors.textPrimary }]}>RD$ {totalPrestado.toFixed(0)}</Text>
            </View>
            <View style={[styles.resumenCard, shadow.card]}>
              <Text style={typography.caption}>POR COBRAR</Text>
              <Text style={[typography.h2, { color: colors.danger }]}>RD$ {totalPendiente.toFixed(0)}</Text>
            </View>
          </View>

          <Text style={[typography.h3, { marginTop: spacing.sm, marginBottom: spacing.sm }]}>
            Mis préstamos ({prestamos.length})
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const saldoPendiente = item.monto - item.montoPagado;
        return (
          <View style={[styles.card, shadow.card]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={typography.body}>{item.deudor}</Text>
                <Text style={typography.bodySecondary}>
                  RD$ {item.monto.toFixed(2)} · pagado RD$ {item.montoPagado.toFixed(2)} · saldo RD${" "}
                  {saldoPendiente.toFixed(2)}
                </Text>
                <Text style={typography.caption}>{formatoFechaHoraRD(item.fecha)}</Text>
                {item.nota ? <Text style={typography.caption}>{item.nota}</Text> : null}
                <Text style={{ color: ESTADO_COLOR[item.estado], fontWeight: "700", marginTop: 2 }}>
                  {ESTADO_LABEL[item.estado]}
                </Text>
              </View>
              {item.estado !== "pagado" && (
                <TouchableOpacity onPress={() => abrirAbono(item)}>
                  <Ionicons name="cash-outline" size={22} color={colors.accent} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => eliminar(item.id)} style={{ marginLeft: spacing.sm }}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
            {abonandoId === item.id && (
              <View style={{ flexDirection: "row", marginTop: spacing.sm, alignItems: "center" }}>
                <TextInput
                  placeholder={`Abono (máx. RD$ ${saldoPendiente.toFixed(2)})`}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={montoAbono}
                  onChangeText={setMontoAbono}
                />
                <TouchableOpacity onPress={() => registrarAbono(item)} style={{ marginLeft: spacing.sm }}>
                  <Ionicons name="checkmark-circle-outline" size={28} color={colors.success} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <Text style={[typography.bodySecondary, { textAlign: "center" }]}>Todavía no registras préstamos.</Text>
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
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
