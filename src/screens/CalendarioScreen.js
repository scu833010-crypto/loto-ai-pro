import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../theme/theme";
import { Loterias } from "../core/models";
import { obtenerTodosLosResultadosAsync } from "../core/resultadosRepository";
import { construirAgendaDiaria } from "../core/calendario";
import LoteriaSelector from "../components/LoteriaSelector";
import LotteryLogo from "../components/LotteryLogo";
import { PremiumCard, StatusBadge, LoadingState, EmptyState } from "../components/PremiumStates";

export default function CalendarioScreen() {
  const [loteriaId, setLoteriaId] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    let activo = true;
    obtenerTodosLosResultadosAsync()
      .then((data) => { if (activo) setResultados(data); })
      .catch(() => { if (activo) setResultados([]); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);
  const agenda = useMemo(() => construirAgendaDiaria(Loterias, resultados, loteriaId), [resultados, loteriaId]);
  if (cargando) return <LoadingState mensaje="Preparando calendario de sorteos…" />;
  return <View style={styles.container}>
    <LoteriaSelector seleccionada={loteriaId} onSeleccionar={(id) => setLoteriaId((actual) => actual === id ? null : id)} />
    <FlatList data={agenda} keyExtractor={(item) => item.id} contentContainerStyle={styles.lista} ListEmptyComponent={<EmptyState mensaje="No hay sorteos programados para este filtro." />} renderItem={({ item }) => (
      <PremiumCard style={styles.card}><View style={styles.row}><LotteryLogo loteria={item.loteria} size={36} /><View style={styles.info}><Text style={typography.h3}>{item.sorteo.nombre}</Text><Text style={typography.bodySecondary}>{item.loteria.nombre} · {item.sorteo.hora}</Text></View><StatusBadge estado={item.estado} label={item.estado === "realizado" ? "Realizado" : item.estado === "pendiente" ? "Pendiente" : "Sin dato"} /></View>{item.resultado ? <Text style={styles.numeros}>Resultado: {item.resultado.numeros.join(" - ")}</Text> : null}</PremiumCard>)} />
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg }, lista: { padding: spacing.md, paddingBottom: spacing.xxl }, card: { marginBottom: spacing.sm }, row: { flexDirection: "row", alignItems: "center" }, info: { flex: 1, marginLeft: spacing.sm }, numeros: { color: colors.accent, fontWeight: "700", marginTop: spacing.sm } });
