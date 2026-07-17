import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radius } from "../theme/theme";
import { obtenerEstadoBackend, fuenteRealHabilitada } from "../core/syncService";
import Panel from "./Panel";

const ETIQUETAS = {
  internet: "Internet",
  scraper: "MIVR",
  normalizador: "Normalizador",
  baseDatos: "SQLite",
  dashboard: "Dashboard",
};

const ORDEN = ["internet", "scraper", "normalizador", "baseDatos", "dashboard"];

/**
 * MONITOR — muestra el estado REAL de cada etapa del pipeline
 * (Internet -> MIVR -> Normalizador -> SQLite -> Dashboard), tal como
 * lo reporta el backend. Si el backend no está configurado, lo dice
 * explícitamente en vez de mostrar verdes falsos.
 */
export default function MonitorPanel() {
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    const data = await obtenerEstadoBackend();
    setEstado(data);
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (!fuenteRealHabilitada()) {
    return (
      <Panel titulo="MODO DEMOSTRACIÓN" subtitulo="No hay backend HTTPS configurado">
        <Text style={typography.bodySecondary}>
          Backend no configurado todavía — no hay nada que monitorear en vivo. Ver
          src/core/syncService.js.
        </Text>
      </Panel>
    );
  }

  return (
    <Panel titulo="MONITOR" subtitulo="Estado real del pipeline de datos">
      {cargando ? (
        <ActivityIndicator color={colors.accent} />
      ) : !estado ? (
        <Text style={typography.bodySecondary}>No se pudo contactar el backend.</Text>
      ) : (
        <View>
          {ORDEN.map((etapaId, idx) => {
            const etapa = estado.pipeline.find((p) => p.etapa === etapaId);
            const ok = etapa?.ok;
            const color = ok === null || ok === undefined ? colors.textMuted : ok ? colors.success : colors.danger;
            return (
              <View key={etapaId}>
                <View style={styles.fila}>
                  <View style={[styles.punto, { backgroundColor: color }]} />
                  <Text style={styles.etiqueta}>{ETIQUETAS[etapaId]}</Text>
                  <Text style={styles.detalle} numberOfLines={1}>
                    {etapa?.detalle || "Sin datos todavía"}
                  </Text>
                </View>
                {idx < ORDEN.length - 1 && <Ionicons name="arrow-down" size={12} color={colors.textMuted} style={{ marginLeft: 3, marginVertical: 2 }} />}
              </View>
            );
          })}
        </View>
      )}
      <TouchableOpacity onPress={cargar} style={styles.refrescar}>
        <Ionicons name="refresh" size={14} color={colors.accent} />
        <Text style={styles.refrescarTexto}>Actualizar</Text>
      </TouchableOpacity>
    </Panel>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  punto: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  etiqueta: { color: colors.textPrimary, fontWeight: "700", fontSize: 12, width: 90 },
  detalle: { color: colors.textMuted, fontSize: 11, flex: 1 },
  refrescar: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm, alignSelf: "flex-start" },
  refrescarTexto: { color: colors.accent, fontSize: 12, fontWeight: "700", marginLeft: 4 },
});
