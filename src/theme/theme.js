// ============================================================
// SISTEMA DE DISEÑO — LotoAnalytics RD
// Paleta oficial, tipografía, espaciados. Tema oscuro por defecto.
// Todo el código de UI debe consumir estos tokens, nunca hex sueltos.
// ============================================================

export const colors = {
  // Fondo (paleta oficial LOTO IA RD)
  bg: "#0A1E3F",
  bgElevated: "#0F172A",
  bgCard: "#122544",
  border: "#22314F",

  // Marca
  primary: "#007BFF",       // azul principal (acciones, links, tabs activos)
  primaryDark: "#0056b3",
  accent: "#FFD700",        // dorado — encabezados, destacados, cifras clave
  accentDim: "#FFC107",

  // Semánticos
  success: "#2ECC71",
  danger: "#E5484D",
  warning: "#F5A623",
  info: "#5AB0FF",

  // Texto
  textPrimary: "#F2F5FA",
  textSecondary: "#8C9BBF",
  textMuted: "#4E5A78",
  textOnPrimary: "#FFFFFF",

  // Loterías (colores identificadores, para badges)
  loteria: {
    nacional: "#E5484D",
    leidsa: "#007BFF",
    real: "#FFD700",
    loteka: "#00B1DD",
    americana: "#2ECC71", // Nueva York
    florida: "#FF8C42",   // Florida — color propio, no comparte con Nueva York
    anguila: "#EE6F3A",
    primera: "#E5484D",
    suerte: "#5B6FE0",
    lotedom: "#4169E1",
  },

  // Paleta fija para gráficos (distribución, tendencias)
  chart: ["#007BFF", "#2ECC71", "#FFD700", "#E5484D", "#8E5CF7"],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700", color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: "600", color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: "400", color: colors.textPrimary },
  bodySecondary: { fontSize: 14, fontWeight: "400", color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: "400", color: colors.textMuted },
  numberDisplay: { fontSize: 32, fontWeight: "800", color: colors.textPrimary, letterSpacing: 2 },
  button: { fontSize: 15, fontWeight: "600", color: colors.textOnPrimary },
};

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default { colors, spacing, radius, typography, shadow };
