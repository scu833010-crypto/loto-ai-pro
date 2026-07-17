import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator, Share, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radius, shadow } from "../theme/theme";
import { obtenerUltimosResultadosAsync, obtenerTodosLosResultadosAsync } from "../core/resultadosRepository";
import {
  calcularFrecuencias,
  calcularAusencias,
  calidadDeDatos,
  agruparPorRango,
  tendenciaDeNumero,
} from "../core/statsEngine";
import { Loterias, obtenerLoteriaPorId } from "../core/models";
import { formatoHoraRD, tiempoRelativoRD } from "../core/fechaHoraRD";
import ResultCard from "../components/ResultCard";
import StatSummaryCard from "../components/StatSummaryCard";
import LineChart from "../components/LineChart";
import DonutChart from "../components/DonutChart";
import VerticalBarChart from "../components/VerticalBarChart";
import MonitorPanel from "../components/MonitorPanel";
import GoldNumberBadge from "../components/GoldNumberBadge";
import LoteriaSelector from "../components/LoteriaSelector";

const TOTAL_SORTEOS_HOY = Loterias.reduce((acc, l) => acc + l.sorteos.length, 0);

// Bloques del día para agrupar resultados por horario (punto pedido:
// ver de un vistazo todo lo que salió en la mañana, mediodía, tarde y noche).
const BLOQUES_DIA = [
  { id: "manana", etiqueta: "Mañana (antes de 12:00 PM)", desde: 0, hasta: 11 },
  { id: "mediodia", etiqueta: "Mediodía (12:00 - 1:59 PM)", desde: 12, hasta: 13 },
  { id: "tarde", etiqueta: "Tarde (2:00 - 6:59 PM)", desde: 14, hasta: 18 },
  { id: "noche", etiqueta: "Noche (7:00 PM en adelante)", desde: 19, hasta: 23 },
];

function horaANumero(horaTexto) {
  const [h] = String(horaTexto).split(":");
  return Number(h) || 0;
}

/**
 * Devuelve la hora REAL del resultado (nunca la hora actual del
 * dispositivo, que es lo que había antes por error). Prioriza
 * "actualizadoEn" si el backend lo trae (timestamp real del origen);
 * si no está disponible, construye la hora a partir de fecha+hora del
 * propio resultado, fijando el offset de RD (-04:00) explícitamente
 * para que no dependa de la zona horaria del teléfono.
 */
function horaDelUltimoResultado(resultado) {
  if (!resultado) return null;
  if (resultado.actualizadoEn) return new Date(resultado.actualizadoEn);
  if (resultado.fecha && resultado.hora && resultado.hora !== "--:--") {
    return new Date(`${resultado.fecha}T${resultado.hora}:00-04:00`);
  }
  return resultado.fecha ? new Date(`${resultado.fecha}T00:00:00-04:00`) : null;
}

/**
 * DASHBOARD
 * Panel general: tarjetas de métricas, resultados de hoy agrupados
 * por horario del día, números destacados del histórico, tendencia,
 * calientes/fríos, frecuencia y distribución.
 *
 * Importante: "Números Destacados" muestra los más frecuentes del
 * histórico cargado, no una predicción. Ningún sorteo de lotería es
 * predecible; esta pantalla describe el pasado, nunca promete el futuro.
 */
export default function DashboardScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [ultimosResultados, setUltimosResultados] = useState([]);
  const [todos, setTodos] = useState([]);

  const [loteriaStatsId, setLoteriaStatsId] = useState(Loterias[0].id);

  const cargarDatos = useCallback(async () => {
    try {
      const [ultimos, todosLosResultados] = await Promise.all([
        obtenerUltimosResultadosAsync(40),
        obtenerTodosLosResultadosAsync(),
      ]);
      setUltimosResultados(ultimos);
      setTodos(todosLosResultados);
    } catch {
      setUltimosResultados([]);
      setTodos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await cargarDatos();
    } finally {
      setRefreshing(false);
    }
  }, [cargarDatos]);

  // Estadísticas de frecuencia/ausencia SOLO tienen sentido dentro de
  // una misma lotería (cada una es su propia "urna" de números). Antes
  // se calculaban sobre "todos" mezclando loterías distintas, lo cual
  // contradice la regla que el propio statsEngine documenta.
  const todosDeLaLoteria = useMemo(
    () => todos.filter((r) => r.loteriaId === loteriaStatsId),
    [todos, loteriaStatsId]
  );

  const frecuencias = useMemo(() => calcularFrecuencias(todosDeLaLoteria), [todosDeLaLoteria]);
  const ausencias = useMemo(() => {
    const ordenados = [...todosDeLaLoteria].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    return calcularAusencias(ordenados);
  }, [todosDeLaLoteria]);
  const calidad = useMemo(() => calidadDeDatos(todosDeLaLoteria, 90), [todosDeLaLoteria]);
  const distribucion = useMemo(() => {
    const rangos = agruparPorRango(todosDeLaLoteria, 20);
    return rangos.map((r, idx) => ({ ...r, color: colors.chart[idx % colors.chart.length] }));
  }, [todosDeLaLoteria]);
  const tendenciaTop = useMemo(() => {
    if (frecuencias.length === 0) return [];
    const ordenados = [...todosDeLaLoteria].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    return tendenciaDeNumero(ordenados, frecuencias[0].numero, 6);
  }, [todosDeLaLoteria, frecuencias]);

  const numerosCalientes = frecuencias.slice(0, 5);
  const numerosFrios = ausencias.slice(0, 5);
  const destacados = frecuencias.slice(0, 3);

  // Resultados de hoy, agrupados por bloque horario del día.
  const bloquesConResultados = useMemo(() => {
    const hoyResultados = ultimosResultados.filter((r) => r.fecha === ultimosResultados[0]?.fecha);
    return BLOQUES_DIA.map((bloque) => {
      const items = hoyResultados
        .filter((r) => {
          const h = horaANumero(r.hora);
          return h >= bloque.desde && h <= bloque.hasta;
        })
        .sort((a, b) => a.hora.localeCompare(b.hora));
      return { ...bloque, items };
    }).filter((b) => b.items.length > 0);
  }, [ultimosResultados]);

  const detalle = useMemo(() => {
    const pares = frecuencias.reduce((acc, f) => acc + (Number(f.numero) % 2 === 0 ? f.veces : 0), 0);
    const impares = frecuencias.reduce((acc, f) => acc + (Number(f.numero) % 2 !== 0 ? f.veces : 0), 0);
    const totalApariciones = pares + impares || 1;
    const sumaTotal = todosDeLaLoteria.reduce((acc, r) => acc + r.numeros.reduce((a, n) => a + Number(n), 0), 0);
    const promedio = todosDeLaLoteria.length > 0 ? (sumaTotal / todosDeLaLoteria.length).toFixed(1) : "0.0";
    return {
      paresPct: Math.round((pares / totalApariciones) * 100),
      imparesPct: Math.round((impares / totalApariciones) * 100),
      promedio,
    };
  }, [frecuencias, todosDeLaLoteria]);

  async function compartirResumen() {
    try {
      const lineasCalientes = numerosCalientes.map((n) => `${n.numero} (${n.veces}x)`).join(", ");
      const mensaje =
        `📊 LOTO IA RD — Resumen de hoy\n\n` +
        `🔥 Números más frecuentes: ${lineasCalientes}\n\n` +
        `Cobertura de datos: ${calidad.coberturaPorcentaje}%\n\n` +
        `Esto es estadística del histórico, no una predicción.`;
      await Share.share({ message: mensaje });
    } catch (e) {
      Alert.alert("No se pudo compartir", e.message);
    }
  }

  if (cargando) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.marca}>
            LOTO IA<Text style={{ color: colors.textPrimary }}> RD</Text>
          </Text>
          <Text style={typography.bodySecondary}>Análisis y estadísticas de loterías dominicanas</Text>
        </View>
        <TouchableOpacity onPress={compartirResumen}>
          <View style={styles.estadoPill}>
            <Ionicons name="share-social-outline" size={14} color={colors.accent} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Fila de métricas */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: spacing.md }}>
        <StatSummaryCard icono="calendar-outline" titulo="Sorteos hoy" valor={TOTAL_SORTEOS_HOY} subtitulo="Programados" colorAcento={colors.info} />
        <StatSummaryCard icono="wifi-outline" titulo="Loterías activas" valor={`${Loterias.length}/${Loterias.length}`} subtitulo="En línea" colorAcento={colors.success} />
        <StatSummaryCard icono="server-outline" titulo="Registros cargados" valor={todos.length} subtitulo="Histórico" colorAcento={colors.primary} />
        <StatSummaryCard icono="flame-outline" titulo="Número destacado" valor={destacados[0]?.numero ?? "--"} subtitulo={`${destacados[0]?.veces ?? 0} veces`} colorAcento={colors.accent} />
        <StatSummaryCard icono="shield-checkmark-outline" titulo="Cobertura de datos" valor={`${calidad.coberturaPorcentaje}%`} subtitulo={`${calidad.diasConDato}/${calidad.diasEsperados} días`} colorAcento={colors.info} />
        <StatSummaryCard
          icono="time-outline"
          titulo="Última actualización"
          valor={ultimosResultados[0] ? formatoHoraRD(horaDelUltimoResultado(ultimosResultados[0])) : "--"}
          subtitulo={ultimosResultados[0] ? tiempoRelativoRD(horaDelUltimoResultado(ultimosResultados[0])) : ""}
          colorAcento={colors.textSecondary}
        />
      </ScrollView>

      {/* Selector de lotería para las estadísticas de frecuencia — cada
          lotería es su propia "urna" de números, así que estas métricas
          nunca deben mezclar loterías distintas entre sí. */}
      <Text style={[typography.bodySecondary, { marginTop: spacing.md, marginBottom: spacing.xs }]}>
        Estadísticas de frecuencia de:
      </Text>
      <LoteriaSelector seleccionada={loteriaStatsId} onSeleccionar={setLoteriaStatsId} />

      {/* Resultados de hoy, agrupados por horario del día */}
      <View style={styles.sectionHeader}>
        <Text style={typography.h2}>Resultados recientes</Text>
        <TouchableOpacity onPress={() => navigation.navigate("ResultadosTab")}>
          <View style={styles.verTodosBtn}>
            <Text style={styles.verTodosText}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {bloquesConResultados.length === 0 ? (
        <Text style={[typography.bodySecondary, { marginBottom: spacing.md }]}>
          Todavía no hay resultados cargados para hoy.
        </Text>
      ) : (
        bloquesConResultados.map((bloque) => (
          <View key={bloque.id} style={{ marginBottom: spacing.md }}>
            <Text style={styles.bloqueEtiqueta}>{bloque.etiqueta}</Text>
            <View style={styles.grid}>
              {bloque.items.map((r) => (
                <View key={r.id} style={styles.gridItem}>
                  <ResultCard resultado={r} compact />
                </View>
              ))}
            </View>
          </View>
        ))
      )}

      {/* Números destacados (antes "predicción IA") */}
      <View style={[styles.panel, shadow.card, { marginTop: spacing.sm }]}>
        <Text style={styles.panelTitulo}>NÚMEROS DESTACADOS</Text>
        <Text style={[typography.caption, { marginBottom: spacing.md }]}>
          Los más frecuentes del histórico cargado — una descripción del pasado, no una predicción.
        </Text>
        <View style={styles.destacadosRow}>
          {destacados.map((d, idx) => (
            <GoldNumberBadge key={d.numero} numero={d.numero} size={idx === 0 ? 62 : 50} color={colors.accent} />
          ))}
        </View>
        <View style={styles.detalleGrid}>
          <View style={styles.detalleFila}>
            <Text style={typography.bodySecondary}>Pares / Impares</Text>
            <Text style={typography.body}>{detalle.paresPct}% / {detalle.imparesPct}%</Text>
          </View>
          <View style={styles.detalleFila}>
            <Text style={typography.bodySecondary}>Promedio por sorteo</Text>
            <Text style={typography.body}>{detalle.promedio}</Text>
          </View>
          <View style={styles.detalleFila}>
            <Text style={typography.bodySecondary}>Cobertura de datos</Text>
            <Text style={typography.body}>{calidad.coberturaPorcentaje}%</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.botonVerAnalisis} onPress={() => navigation.navigate("EstadisticasTab")}>
          <Text style={styles.botonVerAnalisisTexto}>VER ANÁLISIS COMPLETO</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.bg} />
        </TouchableOpacity>
      </View>

      {/* Tendencia + calientes/fríos (calientes primero: son la prioridad) */}
      <View style={styles.rowTresColumnas}>
        <View style={[styles.panel, shadow.card, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.panelTituloChico}>🔥 CALIENTES</Text>
          {numerosCalientes.map((n) => (
            <View key={n.numero} style={styles.listaFila}>
              <Text style={styles.listaNumero}>{n.numero}</Text>
              <Text style={styles.listaValor}>{n.veces}v</Text>
            </View>
          ))}
        </View>

        <View style={[styles.panel, shadow.card, { flex: 1.3, marginRight: spacing.sm }]}>
          <Text style={styles.panelTituloChico}>TENDENCIA</Text>
          <Text style={typography.caption}>Número {destacados[0]?.numero ?? "--"} · últimos periodos</Text>
          <LineChart data={tendenciaTop} width={150} height={80} color={colors.primary} />
        </View>

        <View style={[styles.panel, shadow.card, { flex: 1 }]}>
          <Text style={styles.panelTituloChico}>FRÍOS</Text>
          {numerosFrios.map((n) => (
            <View key={n.numero} style={styles.listaFila}>
              <Text style={styles.listaNumero}>{n.numero}</Text>
              <Text style={styles.listaValor}>{n.sorteosAusente}s</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Gráfico de frecuencia completo */}
      <View style={[styles.panel, shadow.card, { marginTop: spacing.md }]}>
        <Text style={styles.panelTitulo}>GRÁFICO DE FRECUENCIA</Text>
        <Text style={[typography.caption, { marginBottom: spacing.sm }]}>Frecuencia de cada número (00-99) en el histórico cargado</Text>
        <VerticalBarChart data={frecuencias.slice().sort((a, b) => (a.numero > b.numero ? 1 : -1))} labelKey="numero" valueKey="veces" color={colors.primary} />
      </View>

      {/* Distribución */}
      <View style={styles.rowDosColumnas}>
        <View style={[styles.panel, shadow.card, { flex: 1, marginRight: spacing.sm, alignItems: "center" }]}>
          <Text style={styles.panelTitulo}>DISTRIBUCIÓN</Text>
          <Text style={[typography.caption, { marginBottom: spacing.md }]}>Por rango de números</Text>
          <DonutChart data={distribucion.map((d) => ({ ...d, color: d.color }))} size={130} strokeWidth={20} />
        </View>
        <View style={{ flex: 1 }}>
          {distribucion.map((d) => {
            const total = distribucion.reduce((acc, x) => acc + x.veces, 0) || 1;
            const pct = Math.round((d.veces / total) * 100);
            return (
              <View key={d.etiqueta} style={styles.leyendaFila}>
                <View style={[styles.leyendaDot, { backgroundColor: d.color }]} />
                <Text style={styles.leyendaTexto}>{d.etiqueta}</Text>
                <Text style={styles.leyendaPct}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Monitor del pipeline de datos (real, no simulado) */}
      <MonitorPanel />

      {/* Espacio reservado para IA futura — sin contenido inventado */}
      <View style={[styles.panel, shadow.card, styles.panelIA]}>
        <Ionicons name="hardware-chip-outline" size={22} color={colors.textMuted} />
        <Text style={[styles.panelTitulo, { marginTop: spacing.xs }]}>MOTOR IA — PRÓXIMAMENTE</Text>
        <Text style={[typography.caption, { textAlign: "center" }]}>
          Este espacio queda reservado para análisis avanzado futuro. Hoy no hay ningún
          modelo de IA activo — nada se muestra aquí hasta que exista de verdad.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centrado: { justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  marca: { fontSize: 20, fontWeight: "800", color: colors.accent, letterSpacing: 0.5 },
  estadoPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.pill,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  verTodosBtn: { flexDirection: "row", alignItems: "center" },
  verTodosText: { color: colors.primary, fontWeight: "600", marginRight: 2 },
  bloqueEtiqueta: { color: colors.accent, fontWeight: "700", fontSize: 12, marginBottom: spacing.xs, textTransform: "uppercase" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: { width: "48.5%", marginBottom: spacing.sm },
  panel: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitulo: { color: colors.accent, fontWeight: "800", fontSize: 13, letterSpacing: 0.5, marginBottom: 4 },
  panelIA: { marginTop: spacing.md, alignItems: "center", borderStyle: "dashed" },
  panelTituloChico: { color: colors.accent, fontWeight: "800", fontSize: 11, letterSpacing: 0.5, marginBottom: 4 },
  destacadosRow: { flexDirection: "row", justifyContent: "center", marginVertical: spacing.md },
  detalleGrid: { marginBottom: spacing.md },
  detalleFila: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  botonVerAnalisis: {
    flexDirection: "row",
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  botonVerAnalisisTexto: { color: colors.bg, fontWeight: "800", fontSize: 12, marginRight: 6 },
  rowTresColumnas: { flexDirection: "row", marginTop: spacing.md },
  listaFila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xs },
  listaNumero: { color: colors.textPrimary, fontWeight: "700", width: 24, fontSize: 13 },
  listaValor: { color: colors.textSecondary, fontSize: 11, marginLeft: 4 },
  rowDosColumnas: { flexDirection: "row", marginTop: spacing.md, alignItems: "center" },
  leyendaFila: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  leyendaDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.xs },
  leyendaTexto: { ...typography.bodySecondary, flex: 1 },
  leyendaPct: { ...typography.body, fontWeight: "700" },
});
