import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Share, Alert, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radius } from "../theme/theme";
import { Loterias } from "../core/models";
import { obtenerHistoricoPorLoteriaAsync } from "../core/resultadosRepository";
import {
  calcularFrecuencias,
  calidadDeDatos,
  tendenciaSemanal,
  tendenciaMensual,
  calcularPalesFrecuentes,
  calcularTriosFrecuentes,
} from "../core/statsEngine";
import LoteriaSelector from "../components/LoteriaSelector";
import LineChart from "../components/LineChart";
import Panel from "../components/Panel";
import GoldNumberBadge from "../components/GoldNumberBadge";
import { obtenerTodosLosResultadosAsync } from "../core/resultadosRepository";
import { compararLoterias } from "../core/ai/AnalysisEngine";
import { obtenerAnaliticaPorLoteriaAsync } from "../core/analiticaRepository";

// Anguila primero, como pediste — el resto del catálogo se mantiene igual.
const LOTERIAS_ORDENADAS = [
  ...Loterias.filter((l) => l.id === "anguila"),
  ...Loterias.filter((l) => l.id !== "anguila"),
];

/**
 * CENTRO DE ESTADÍSTICAS AVANZADAS
 *
 * Reúne en un solo lugar, por lotería, todo el análisis histórico
 * real: ranking de números más frecuentes, tendencia semanal/mensual,
 * y palés/tríos con más respaldo histórico. Se recalcula solo cada
 * vez que hay datos nuevos — no necesita "entrenarse" aparte, porque
 * todo se calcula en vivo sobre el histórico cargado.
 *
 * Lo que esta pantalla NO hace, a propósito: no le pone un "% de
 * confianza" a ningún número como si fuera candidato a ganar. Un
 * sorteo de lotería es un evento independiente — el historial no
 * cambia la probabilidad del próximo. Cualquier "confianza" puesta
 * sobre un número sería inventada, y eso no se hace aquí ni en
 * ninguna otra pantalla de la app.
 */
export default function CentroEstadisticasScreen() {
  const [loteriaId, setLoteriaId] = useState(LOTERIAS_ORDENADAS[0].id);
  const [periodoTendencia, setPeriodoTendencia] = useState("semanal");
  const [resultados, setResultados] = useState([]);
  const [todosLosResultados, setTodosLosResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [analiticaBackend, setAnaliticaBackend] = useState(null);

  useEffect(() => {
    obtenerTodosLosResultadosAsync().then(setTodosLosResultados).catch(() => setTodosLosResultados([]));
  }, []);

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

  useEffect(() => {
    let activo = true;
    obtenerAnaliticaPorLoteriaAsync(loteriaId)
      .then((datos) => { if (activo) setAnaliticaBackend(datos); })
      .catch(() => { if (activo) setAnaliticaBackend(null); });
    return () => { activo = false; };
  }, [loteriaId]);

  const frecuencias = useMemo(() => calcularFrecuencias(resultados), [resultados]);
  const calidad = useMemo(() => calidadDeDatos(resultados, 90), [resultados]);
  const pales = useMemo(() => calcularPalesFrecuentes(resultados, 8), [resultados]);
  const trios = useMemo(() => calcularTriosFrecuentes(resultados, 8), [resultados]);
  const rankingTop10 = frecuencias.slice(0, 10);

  const tendencia = useMemo(() => {
    if (frecuencias.length === 0) return [];
    return periodoTendencia === "semanal"
      ? tendenciaSemanal(resultados, frecuencias[0].numero, 8)
      : tendenciaMensual(resultados, frecuencias[0].numero, 6);
  }, [resultados, frecuencias, periodoTendencia]);

  const loteriaActual = Loterias.find((l) => l.id === loteriaId);
  const colorLoteria = loteriaActual ? colors.loteria[loteriaActual.colorKey] : colors.accent;
  const esAnguila = loteriaId === "anguila";

  const comparacion = useMemo(() => {
    if (todosLosResultados.length === 0) return [];
    return compararLoterias(todosLosResultados, LOTERIAS_ORDENADAS.map((l) => l.id));
  }, [todosLosResultados]);

  function explicacion(item, ranking) {
    if (ranking === 0) {
      return `Es el número que más veces apareció en el histórico cargado de ${loteriaActual?.nombre} (${item.veces} veces). Describe el pasado — no anticipa el próximo sorteo.`;
    }
    return `Aparece en el puesto ${ranking + 1} del ranking por frecuencia histórica, con ${item.veces} apariciones registradas.`;
  }

  async function compartir() {
    if (frecuencias.length === 0) {
      Alert.alert("Nada que compartir", "Todavía no hay datos cargados para esta lotería.");
      return;
    }
    try {
      const top5 = rankingTop10.slice(0, 5).map((f, i) => `${i + 1}. ${f.numero} (${f.veces}x)`).join("\n");
      const topPales = pales.slice(0, 3).map((p) => `${p.par} (${p.veces}x)`).join(", ");
      const mensaje =
        `📊 Centro de Estadísticas — ${loteriaActual?.nombre}\n\n` +
        `Ranking por frecuencia histórica:\n${top5}\n\n` +
        (topPales ? `Palés con más respaldo histórico: ${topPales}\n\n` : "") +
        `Análisis estadístico del histórico. No es una predicción ni garantiza resultados.\n\n` +
        `Vía LOTO IA RD`;
      await Share.share({ message: mensaje });
    } catch (e) {
      Alert.alert("No se pudo compartir", e.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <LoteriaSelector seleccionada={loteriaId} onSeleccionar={setLoteriaId} />
        <TouchableOpacity onPress={compartir} style={styles.botonCompartir}>
          <Ionicons name="share-social-outline" size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <Panel titulo="⚠️ ANTES DE VER LOS DATOS">
          <Text style={typography.bodySecondary}>
            Todo lo que sigue describe el histórico cargado de {loteriaActual?.nombre}. Un sorteo de
            lotería es independiente del anterior — ningún número "debe" salir por haber salido
            mucho o poco antes. Esto es estadística del pasado, no un pronóstico del futuro.
          </Text>
        </Panel>

        {analiticaBackend ? (
          <Panel titulo="CORE IA — ANÁLISIS VERIFICADO" subtitulo="Procesado por el backend con resultados históricos reales">
            <Text style={typography.bodySecondary}>Cobertura: {analiticaBackend.riesgo?.coberturaPorcentaje ?? "--"}% · Muestras evaluadas: {analiticaBackend.evaluacion?.muestras ?? "--"}</Text>
            <Text style={[typography.caption, { marginTop: spacing.xs }]}>Describe el histórico; no es una predicción ni una recomendación de juego.</Text>
          </Panel>
        ) : null}

        {esAnguila && (
          <Panel titulo="⭐ ANGUILA — LOTERÍA PRIORITARIA">
            <Text style={typography.bodySecondary}>
              Anguila se muestra primero en el selector y su análisis se recalcula automáticamente
              apenas entra un resultado nuevo, igual que las demás loterías — sin afectarlas.
            </Text>
          </Panel>
        )}

        {cargando ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
        ) : frecuencias.length === 0 ? (
          <Panel titulo="SIN DATOS">
            <Text style={typography.bodySecondary}>Todavía no hay histórico cargado para esta lotería.</Text>
          </Panel>
        ) : (
          <>
            <Panel
              titulo="🔥 RANKING POR FRECUENCIA HISTÓRICA"
              subtitulo={`Cobertura de datos: ${calidad.coberturaPorcentaje}% (${calidad.diasConDato}/${calidad.diasEsperados} días)`}
            >
              {rankingTop10.map((item, idx) => (
                <View key={item.numero} style={styles.filaRanking}>
                  <GoldNumberBadge numero={item.numero} size={idx === 0 ? 46 : 38} color={idx === 0 ? colors.accent : colorLoteria} />
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.rankingTitulo}>
                      #{idx + 1} · {item.veces} apariciones
                    </Text>
                    <Text style={styles.rankingExplicacion}>{explicacion(item, idx)}</Text>
                  </View>
                </View>
              ))}
            </Panel>

            <Panel titulo="TENDENCIA DEL NÚMERO #1" subtitulo={`Número ${frecuencias[0].numero} a lo largo del tiempo`}>
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
              <LineChart data={tendencia} width={300} height={110} color={colorLoteria} />
            </Panel>

            <Panel titulo="PALÉS CON MÁS RESPALDO HISTÓRICO" subtitulo="Parejas que más veces salieron juntas en el mismo sorteo">
              {pales.length === 0 ? (
                <Text style={typography.bodySecondary}>
                  Esta lotería no tiene sorteos con 2+ números por jugada en el histórico cargado.
                </Text>
              ) : (
                pales.map((p, idx) => (
                  <View key={p.par} style={styles.filaCombo}>
                    <Text style={styles.numRanking}>{idx + 1}.</Text>
                    <Text style={styles.comboTexto}>{p.par}</Text>
                    <Text style={styles.comboVeces}>{p.veces} veces juntos</Text>
                  </View>
                ))
              )}
            </Panel>

            <Panel titulo="TRÍOS CON MÁS RESPALDO HISTÓRICO" subtitulo="Tercias que más veces salieron juntas en el mismo sorteo">
              {trios.length === 0 ? (
                <Text style={typography.bodySecondary}>
                  Esta lotería no tiene sorteos con 3+ números por jugada en el histórico cargado.
                </Text>
              ) : (
                trios.map((t, idx) => (
                  <View key={t.trio} style={styles.filaCombo}>
                    <Text style={styles.numRanking}>{idx + 1}.</Text>
                    <Text style={styles.comboTexto}>{t.trio}</Text>
                    <Text style={styles.comboVeces}>{t.veces} veces juntos</Text>
                  </View>
                ))
              )}
            </Panel>

            <Panel titulo="COMPARACIÓN ENTRE LOTERÍAS" subtitulo="Datos cargados y número más frecuente de cada una — nunca se mezclan entre sí">
              {comparacion.map((c) => {
                const l = Loterias.find((x) => x.id === c.loteriaId);
                return (
                  <View key={c.loteriaId} style={styles.filaComparacion}>
                    <View style={[styles.dotLoteria, { backgroundColor: l ? colors.loteria[l.colorKey] : colors.textMuted }]} />
                    <Text style={styles.nombreComparacion} numberOfLines={1}>{l?.nombre ?? c.loteriaId}</Text>
                    <Text style={styles.datoComparacion}>{c.totalResultados} datos</Text>
                    <Text style={styles.datoComparacion}>
                      {c.numeroMasFrecuente ? `#${c.numeroMasFrecuente.numero} (${c.numeroMasFrecuente.veces}x)` : "--"}
                    </Text>
                  </View>
                );
              })}
            </Panel>

            <Text style={[typography.caption, { marginTop: spacing.sm }]}>
              Este panel se recalcula automáticamente cada vez que hay resultados nuevos — no hace
              falta "entrenar" nada aparte. Sigue siendo, siempre, una descripción del pasado.
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
  filaRanking: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  rankingTitulo: { color: colors.textPrimary, fontWeight: "700", fontSize: 13 },
  rankingExplicacion: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
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
  filaCombo: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  numRanking: { color: colors.textMuted, width: 24, fontSize: 12 },
  comboTexto: { color: colors.textPrimary, fontWeight: "700", fontSize: 15, flex: 1 },
  comboVeces: { color: colors.textSecondary, fontSize: 12 },
  filaComparacion: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  dotLoteria: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  nombreComparacion: { color: colors.textPrimary, fontWeight: "600", fontSize: 12, flex: 1 },
  datoComparacion: { color: colors.textSecondary, fontSize: 11, marginLeft: spacing.sm },
});
