import React from "react";
import { View } from "react-native";
import Svg, { G, Circle } from "react-native-svg";

/**
 * Gráfico de dona para mostrar la distribución del histórico entre
 * varios rangos (por ejemplo, 00-19, 20-39, ...). Puramente descriptivo
 * del pasado cargado.
 * data: [{ etiqueta, veces, color }]
 */
export default function DonutChart({ data, size = 140, strokeWidth = 22 }) {
  const total = data.reduce((acc, d) => acc + d.veces, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let acumulado = 0;
  const segmentos = data.map((d) => {
    const fraccion = d.veces / total;
    const dash = fraccion * circumference;
    const gap = circumference - dash;
    const offset = -(acumulado * circumference);
    acumulado += fraccion;
    return { ...d, dash, gap, offset };
  });

  return (
    <View>
      <Svg width={size} height={size}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          {segmentos.map((s, idx) => (
            <Circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={s.offset}
              fill="transparent"
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}
