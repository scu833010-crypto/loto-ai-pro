import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Share, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radius } from "../theme/theme";
import { Loterias } from "../core/models";
import { obtenerHistoricoPorLoteriaAsync } from "../core/resultadosRepository";
import {
  calcularFrecuencias,
  calcularAusencias,
  agruparPorDecena,
  agruparPorTerminacion,
  calidadDeDatos,
  tendenciaSemanal,
  tendenciaMensual,
  calcularPalesFrecuentes,
} from "../core/statsEngine";
import LoteriaSelector from "../components/LoteriaSelector";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import Panel from "../components/Panel";

// "Calientes" va primero: es la prioridad absoluta según el producto.
// Los fríos siguen disponibles, pero nunca como pestaña por defecto.
const VISTAS = [
  { id: "calientes", label: "🔥 Calientes" },
  { id: "tendencia", label: "Tendencia" },
  { id: "pales", label: "Palés" },
  { id: "decenas", label: "Decenas" },
  { id: "terminaciones", label: "Terminaciones" },
  { id: "frios", label: "Fríos" },
];

/**
 * ESTADÍSTICAS / CAE (Consulta Avanzada de Estadísticas)
 * Objetivo: mostrar el comportamiento histórico de los números de
 * una lotería. Nunca predice: solo describe frecuencia, tendencia,
 * palés y agrupaciones del histórico cargado. Los números CALIENTES
 * son la prioridad — es la primera pestaña y la que abre por defecto.
 */
export default function EstadisticasScreen() {
  const [loteriaId, setLoteriaId] = useState(Loterias[0].id);
  const [vista, setVista] = useState("calientes");
  const [periodoTendencia, setPeriodoTendencia] = useState("semanal");
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    obtenerHistoricoPorLoteriaAsync(loteriaId)
      .then((data) => { if (activo) setResultados(data); })
      .catch(() => { if (activo) setResultados([]); })
      .finally(() => { if (activo) setCargando(false); });
    return () => {
      activo = false;
    };
  }, [loteriaId]);

  const frecuencias = useMemo(() => calcularFrecuencias(resultados), [resultados]);
  const ausencias = useMemo(() => {
    const ordenados = [...resultados].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    return calcularAusencias(ordenados);
  }, [resultados]);
  const decenas = useMemo(() => agruparPorDecena(resultados), [resultados]);
  const terminaciones = useMemo(() => agruparPorTerminacion(resultados), [resultados]);
  const calidad = useMemo(() => calidadDeDatos(resultados, 90), [resultados]);
  const pales = useMemo(() => calcularPalesFrecuentes(resultados), [resultados]);

  const tendencia = useMemo(() => {
    if (frecuencias.length === 0) return [];
    return periodoTendencia === "semanal"
      ? tendenciaSemanal(resultados, frecuencias[0].numero, 8)
      : tendenciaMensual(resultados, frecuencias[0].numero, 6);
  }, [resultados, frecuencias, periodoTendencia]);

  const loteriaActual = Loterias.find((l) => l.id === loteriaId);
  const colorLoteria = loteriaActual ? colors.loteria[loteriaActual.colorKey] : colors.accent;

  async function compartirEstadisticas() {
    try {
      const top5 = frecuencias.slice(0, 5).map((f) => `${f.numero} (${f.veces}x)`).join(", ");
      const topPales = pales.slice(0, 3).map((p) => `${p.par} (${p.veces}x)`).join(", ");
      const mensaje =
        `📊 Estadísticas de ${loteriaActual?.nombre ?? loteriaId} — LOTO IA RD\n\n` +
        `🔥 Números calientes: ${top5}\n\n` +
        (topPales ? `👫 Palés más frecuentes: ${topPales}\n\n` : "") +
        `Cobertura de datos: ${calidad.coberturaPorcentaje}%\n\n` +
        `Estadística del histórico, no una predicción.`;
      await Share.share({ message: mensaje });
    } catch (e) {
      Alert.alert("No se pudo compartir", e.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <LoteriaSelector seleccionada={loteriaId} onSeleccionar={setLoteriaId} />
        <TouchableOpacity onPress={compartirEstadisticas} style={styles.botonCompartir}>
          <Ionicons name="share-social-outline" size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.segmentedScroll}>
        <View style={styles.segmentedRow}>
          {VISTAS.map((v) => {
            const activo = v.id === vista;
            return (
              <TouchableOpacity key={v.id} onPress={() => setVista(v.id)} style={[styles.segment, activo && styles.segmentActivo]}>
                <Text style={[styles.segmentText, activo && styles.segmentTextActivo]}>{v.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        {cargando ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            <Panel
              titulo="COBERTURA DE DATOS"
              subtitulo={`${calidad.diasConDato}/${calidad.diasEsperados} días cargados (${calidad.coberturaPorcentaje}%)`}
            />

            {vista === "calientes" && (
              <Panel titulo="🔥 NÚMEROS MÁS CALIENTES" subtitulo="Ranking del más frecuente al menos frecuente — prioridad del sistema">
                <BarChart data={frecuencias} labelKey="numero" valueKey="veces" colorAcento={colors.accent} />
              </Panel>
            )}

            {vista === "tendencia" && (
              <Panel titulo="TENDENCIA DEL NÚMERO MÁS CALIENTE" subtitulo={`Número ${frecuencias[0]?.numero ?? "--"} a lo largo del tiempo`}>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    onPress={() => setPeriodoTendencia("semanal")}
                    style={[styles.toggleBtn, periodoTendencia === "semanal" && styles.toggleBtnActivo]}
                  >
                    <Text style={[styles.toggleTexto, periodoTendencia === "semanal" && styles.toggleTextoActivo]}>Semanal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPeriodoTendencia("mensual")}
                    style={[styles.toggleBtn, periodoTendencia === "mensual" && styles.toggleBtnActivo]}
                  >
                    <Text style={[styles.toggleTexto, periodoTendencia === "mensual" && styles.toggleTextoActivo]}>Mensual</Text>
                  </TouchableOpacity>
                </View>
                <LineChart data={tendencia} width={300} height={120} color={colorLoteria} />
                <Text style={[typography.caption, { marginTop: spacing.sm }]}>
                  {periodoTendencia === "semanal" ? "Últimas 8 semanas" : "Últimos 6 meses"} — de izquierda (más antiguo) a derecha (más reciente).
                </Text>
              </Panel>
            )}

            {vista === "pales" && (
              <Panel titulo="PALÉS MÁS FRECUENTES" subtitulo="Parejas de números que más veces salieron juntas en el mismo sorteo">
                {pales.length === 0 ? (
                  <Text style={typography.bodySecondary}>
                    Esta lotería no tiene sorteos con 2 o más números por jugada en el histórico cargado.
                  </Text>
                ) : (
                  pales.map((p, idx) => (
                    <View key={p.par} style={styles.filaPale}>
                      <Text style={styles.rankingPale}>{idx + 1}.</Text>
                      <Text style={styles.parPale}>{p.par}</Text>
                      <Text style={styles.vecesPale}>{p.veces} veces</Text>
                    </View>
                  ))
                )}
              </Panel>
            )}

            {vista === "decenas" && (
              <Panel titulo="DISTRIBUCIÓN POR DECENA" subtitulo="Agrupación de apariciones cada 10 números">
                <BarChart data={decenas} labelKey="decena" valueKey="veces" colorAcento={colors.info} maxItems={10} />
              </Panel>
            )}
            {vista === "terminaciones" && (
              <Panel titulo="DISTRIBUCIÓN POR TERMINACIÓN" subtitulo="Agrupación por el último dígito (0-9)">
                <BarChart data={terminaciones} labelKey="terminacion" valueKey="veces" colorAcento={colors.success} maxItems={10} />
              </Panel>
            )}
            {vista === "frios" && (
              <Panel titulo="MAYOR AUSENCIA" subtitulo="Sorteos transcurridos desde la última vez que salió cada número">
                <BarChart data={ausencias} labelKey="numero" valueKey="sorteosAusente" colorAcento={colors.danger} />
              </Panel>
            )}

            <Text style={[typography.caption, { marginTop: spacing.sm }]}>
              Estas métricas describen el comportamiento histórico cargado. No constituyen
              una predicción ni garantizan resultados futuros.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  botonCompartir: {
    marginRight: spacing.md,
    padding: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentedScroll: { marginBottom: spacing.sm },
  segmentedRow: { flexDirection: "row", paddingHorizontal: spacing.md },
  segment: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    marginRight: spacing.xs,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentActivo: { backgroundColor: colors.accent, borderColor: colors.accent },
  segmentText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  segmentTextActivo: { color: colors.bg, fontWeight: "800" },
  toggleRow: { flexDirection: "row", marginBottom: spacing.sm },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.bgElevated,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtnActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleTexto: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
  toggleTextoActivo: { color: colors.textOnPrimary },
  filaPale: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  rankingPale: { color: colors.textMuted, width: 24, fontSize: 12 },
  parPale: { color: colors.textPrimary, fontWeight: "700", fontSize: 15, flex: 1 },
  vecesPale: { color: colors.textSecondary, fontSize: 12 },
});
