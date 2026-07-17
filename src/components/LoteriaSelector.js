import React, { useEffect, useState, useCallback } from "react";
import { FlatList, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/theme";
import { Loterias } from "../core/models";
import { FavoritosStore } from "../core/storage";
import { ordenarLoteriasPorFavoritas, esLoteriaFavorita } from "../core/favoritos";
import LotteryLogo from "./LotteryLogo";

/**
 * Selector de lotería usado en Resultados, Estadísticas, Combinaciones
 * y Administración. Un solo lugar para no repetir estilos de chips.
 *
 * Fase 5 (Producto): ahora permite marcar loterías como favoritas —
 * tocando la estrella (no el chip completo, para no confundir "marcar
 * favorita" con "seleccionar para ver sus datos"). Las favoritas
 * siempre aparecen primero en la lista.
 */
export default function LoteriaSelector({ seleccionada, onSeleccionar }) {
  const [favoritos, setFavoritos] = useState([]);

  const cargarFavoritos = useCallback(() => {
    FavoritosStore.listar().then(setFavoritos);
  }, []);

  useEffect(() => {
    cargarFavoritos();
  }, [cargarFavoritos]);

  async function alternarFavorita(loteriaId) {
    const nuevos = await FavoritosStore.alternar(loteriaId);
    setFavoritos(nuevos);
  }

  const loteriasOrdenadas = ordenarLoteriasPorFavoritas(Loterias, favoritos);

  return (
    <View style={styles.wrap}>
      <FlatList
        data={loteriasOrdenadas}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item }) => {
          const activo = item.id === seleccionada;
          const favorita = esLoteriaFavorita(item.id, favoritos);
          return (
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: activo ? colors.loteria[item.colorKey] : colors.bgElevated,
                  borderColor: activo ? colors.loteria[item.colorKey] : colors.border,
                },
              ]}
            >
              <TouchableOpacity onPress={() => onSeleccionar(item.id)} style={styles.chipTextArea} accessibilityRole="button" accessibilityLabel={`Seleccionar ${item.nombre}`} accessibilityState={{ selected: activo }}>
                <LotteryLogo loteria={item} size={20} />
                <Text style={[styles.chipText, { color: activo ? colors.textOnPrimary : colors.textSecondary }]}>
                  {item.nombre}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => alternarFavorita(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={favorita ? `Quitar ${item.nombre} de favoritas` : `Marcar ${item.nombre} como favorita`}
              >
                <Ionicons
                  name={favorita ? "star" : "star-outline"}
                  size={14}
                  color={favorita ? colors.accent : activo ? colors.textOnPrimary : colors.textMuted}
                  style={{ marginLeft: spacing.xs }}
                />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: spacing.md },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
    borderWidth: 1,
  },
  chipTextArea: { flexDirection: "row", alignItems: "center" },
  chipText: { fontWeight: "600", fontSize: 13, marginLeft: spacing.xs },
});
