import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radius, shadow } from "../theme/theme";
import { obtenerEventosBackend, fuenteRealHabilitada } from "../core/syncService";
import { formatoFechaHoraRD } from "../core/fechaHoraRD";

const ICONO_POR_TIPO = {
  info: { name: "checkmark-circle", color: colors.success },
  advertencia: { name: "warning", color: colors.warning },
  error: { name: "close-circle", color: colors.danger },
};

/**
 * NOTICIAS — bitácora real del sistema: cambios detectados, errores
 * de scraping, actualizaciones. Nunca contenido inventado: si el
 * backend no está configurado o no hay eventos todavía, la pantalla
 * lo dice explícitamente y no hay nada más que mostrar.
 *
 * Reservado para el futuro: cuando se detecten cambios de estructura
 * en las fuentes, nuevas loterías agregadas, o actualizaciones del
 * backend, aparecerán aquí automáticamente — son los mismos eventos
 * que ya registra el pipeline (Monitor y Noticias comparten la fuente).
 */
export default function NoticiasScreen() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    const data = await obtenerEventosBackend(50);
    setEventos(data);
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const onRefresh = useCallback(async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  }, [cargar]);

  if (!fuenteRealHabilitada()) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <Ionicons name="newspaper-outline" size={36} color={colors.textMuted} />
        <Text style={[typography.h3, { marginTop: spacing.sm }]}>Sin backend configurado</Text>
        <Text style={[typography.bodySecondary, { textAlign: "center", marginTop: spacing.xs }]}>
          Las noticias son la bitácora real del backend (cambios detectados, errores,
          actualizaciones). Configúralo en src/core/syncService.js para verlas.
        </Text>
      </View>
    );
  }

  if (cargando) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={eventos}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colors.accent} />}
      renderItem={({ item }) => {
        const icono = ICONO_POR_TIPO[item.tipo] || ICONO_POR_TIPO.info;
        return (
          <View style={[styles.card, shadow.card]}>
            <Ionicons name={icono.name} size={18} color={icono.color} style={{ marginTop: 2 }} />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={typography.body}>{item.mensaje}</Text>
              <Text style={typography.caption}>
                {item.etapa} · {formatoFechaHoraRD(item.creadoEn)}
              </Text>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.centrado}>
          <Text style={typography.bodySecondary}>Sin eventos todavía. Aparecerán aquí en cuanto corra el pipeline.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centrado: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  card: {
    flexDirection: "row",
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
