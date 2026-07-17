import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { colors, spacing, typography } from "../theme/theme";
import { InversionesStore, CombinacionesStore } from "../core/storage";
import Panel from "../components/Panel";
import GoldButton from "../components/GoldButton";
import { formatoFechaHoraRD } from "../core/fechaHoraRD";

/**
 * Escapa un valor para CSV de forma segura:
 *  - Si el valor empieza con =, +, -, @, tab o retorno de carro, se le
 *    antepone un apóstrofo — Excel/Sheets lo tratan como texto plano
 *    en vez de ejecutarlo como fórmula (mitiga "CSV injection").
 *  - Las comillas dobles internas se escapan duplicándolas (regla CSV
 *    estándar), y el valor se envuelve siempre en comillas para que
 *    comas, saltos de línea, etc. no rompan las columnas.
 */
function escaparCeldaCSV(valor) {
  let texto = String(valor ?? "");
  if (/^[=+\-@\t\r]/.test(texto)) {
    texto = `'${texto}`;
  }
  return `"${texto.replace(/"/g, '""')}"`;
}

function escaparHTML(valor) {
  const entidades = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
  return String(valor ?? "").replace(/[&<>'\"]/g, (caracter) => entidades[caracter]);
}

/**
 * REPORTES (RF-11, RF-12)
 * Objetivo: exportar las inversiones registradas en PDF (para
 * compartir/imprimir) o CSV (para abrir directamente en Excel).
 */
export default function ReportesScreen() {
  const [inversiones, setInversiones] = useState([]);
  const [combinaciones, setCombinaciones] = useState([]);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [generandoCSV, setGenerandoCSV] = useState(false);

  useEffect(() => {
    Promise.all([InversionesStore.listar(), CombinacionesStore.listar()])
      .then(([inv, comb]) => {
        setInversiones(inv);
        setCombinaciones(comb);
      })
      .catch(() => Alert.alert("No se pudieron cargar los reportes", "Intenta nuevamente."));
  }, []);

  function nombreCombinacion(id) {
    return combinaciones.find((c) => c.id === id)?.nombre ?? "—";
  }

  async function exportarPDF() {
    if (inversiones.length === 0) {
      Alert.alert("Nada que exportar", "Todavía no tienes inversiones registradas.");
      return;
    }
    setGenerandoPDF(true);
    try {
      const filas = inversiones
        .map(
          (i) => `<tr>
            <td>${escaparHTML(i.fecha)}</td>
            <td>${escaparHTML(nombreCombinacion(i.combinacionId))}</td>
            <td>RD$ ${escaparHTML(i.monto)}</td>
            <td>${escaparHTML(i.estado)}</td>
            <td>RD$ ${escaparHTML(i.gananciaEstimada || 0)}</td>
          </tr>`
        )
        .join("");

      const html = `
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: -apple-system, Arial; color:#141F38;">
            <h1 style="color:#F0B429;">LotoAnalytics RD — Reporte de Inversiones</h1>
            <p>Generado el ${formatoFechaHoraRD(new Date())}</p>
            <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse: collapse;">
              <thead>
                <tr style="background:#1B3E99;color:#fff;">
                  <th align="left">Fecha</th><th align="left">Combinación</th>
                  <th align="left">Monto</th><th align="left">Estado</th><th align="left">Ganancia est.</th>
                </tr>
              </thead>
              <tbody>${filas}</tbody>
            </table>
            <p style="font-size:11px;color:#888;margin-top:24px;">
              Las ganancias son estimadas con un factor de pago referencial y no representan
              un pago oficial de ninguna banca o lotería.
            </p>
          </body>
        </html>`;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Reporte de inversiones" });
      } else {
        Alert.alert("PDF generado", `Guardado en: ${uri}`);
      }
    } catch (e) {
      Alert.alert("Error generando el PDF", e.message);
    } finally {
      setGenerandoPDF(false);
    }
  }

  async function exportarCSV() {
    if (inversiones.length === 0) {
      Alert.alert("Nada que exportar", "Todavía no tienes inversiones registradas.");
      return;
    }
    setGenerandoCSV(true);
    try {
      const encabezado = "fecha,combinacion,monto,estado,ganancia_estimada\n";
      const filas = inversiones
        .map((i) =>
          [i.fecha, nombreCombinacion(i.combinacionId), i.monto, i.estado, i.gananciaEstimada || 0]
            .map(escaparCeldaCSV)
            .join(",")
        )
        .join("\n");
      const csv = encabezado + filas;
      const path = FileSystem.cacheDirectory + `reporte-inversiones-${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: "text/csv", dialogTitle: "Reporte de inversiones (CSV)" });
      } else {
        Alert.alert("CSV generado", `Guardado en: ${path}`);
      }
    } catch (e) {
      Alert.alert("Error generando el CSV", e.message);
    } finally {
      setGenerandoCSV(false);
    }
  }

  return (
    <View style={styles.container}>
      <Panel
        titulo="REPORTES"
        subtitulo="Exporta tus inversiones registradas en PDF o CSV (Excel)"
      >
        <GoldButton
          titulo="EXPORTAR A PDF"
          icono="document-text-outline"
          onPress={exportarPDF}
          cargando={generandoPDF}
          style={{ marginBottom: spacing.md }}
        />
        <GoldButton
          titulo="EXPORTAR A CSV (EXCEL)"
          icono="grid-outline"
          onPress={exportarCSV}
          cargando={generandoCSV}
          variante="contorno"
        />

        <Text style={[typography.caption, { marginTop: spacing.lg }]}>
          {inversiones.length} inversión(es) disponibles para exportar.
        </Text>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
});
