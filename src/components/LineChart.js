import React from "react";
import Svg, { Polyline, Circle } from "react-native-svg";

/**
 * Gráfico de línea minimalista para mostrar una tendencia histórica
 * (por ejemplo, apariciones de un número por periodo). Describe el
 * pasado cargado; no proyecta ni predice valores futuros.
 */
export default function LineChart({ data, width = 300, height = 120, color = "#2E6BFF" }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 8;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const stepX = data.length > 1 ? usableWidth / (data.length - 1) : 0;

  const puntos = data.map((v, idx) => {
    const x = padding + idx * stepX;
    const y = padding + usableHeight - ((v - min) / range) * usableHeight;
    return { x, y };
  });

  const pointsStr = puntos.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <Svg width={width} height={height}>
      <Polyline points={pointsStr} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {puntos.map((p, idx) => (
        <Circle key={idx} cx={p.x} cy={p.y} r={4} fill={color} />
      ))}
    </Svg>
  );
}
