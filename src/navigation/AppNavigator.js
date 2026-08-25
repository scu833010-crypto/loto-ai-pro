import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/theme";
import DashboardScreen from "../screens/DashboardScreen";
import ResultadosScreen from "../screens/ResultadosScreen";
import EstadisticasScreen from "../screens/EstadisticasScreen";
import MasScreen from "../screens/MasScreen";
import MezcladorScreen from "../screens/MezcladorScreen";
import GeneradorScreen from "../screens/GeneradorScreen";
import NoticiasScreen from "../screens/NoticiasScreen";
import CentroEstadisticasScreen from "../screens/CentroEstadisticasScreen";
import CombinacionesScreen from "../screens/CombinacionesScreen";
import InversionesScreen from "../screens/InversionesScreen";
import ReportesScreen from "../screens/ReportesScreen";
import AdministracionScreen from "../screens/AdministracionScreen";
import CalendarioScreen from "../screens/CalendarioScreen";
import PrestamosScreen from "../screens/PrestamosScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tema de navegación alineado a la paleta oficial (tema oscuro).
const NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    border: colors.border,
    primary: colors.primary,
    text: colors.textPrimary,
  },
};

const headerOptions = {
  headerStyle: { backgroundColor: colors.bgElevated },
  headerTintColor: colors.textPrimary,
};

function ResultadosStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="ResultadosLista" component={ResultadosScreen} options={{ title: "Resultados" }} />
    </Stack.Navigator>
  );
}

function EstadisticasStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="EstadisticasPantalla" component={EstadisticasScreen} options={{ title: "Estadísticas / CAE" }} />
    </Stack.Navigator>
  );
}

function MasStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="MasHub" component={MasScreen} options={{ title: "Más" }} />
      <Stack.Screen name="Mezclador" component={MezcladorScreen} options={{ title: "Mezclador" }} />
      <Stack.Screen name="Generador" component={GeneradorScreen} options={{ title: "Generador Palés/Tripletas" }} />
      <Stack.Screen name="Noticias" component={NoticiasScreen} options={{ title: "Noticias" }} />
      <Stack.Screen name="CentroEstadisticas" component={CentroEstadisticasScreen} options={{ title: "Centro de Estadísticas" }} />
      <Stack.Screen name="Combinaciones" component={CombinacionesScreen} options={{ title: "Combinaciones" }} />
      <Stack.Screen name="Inversiones" component={InversionesScreen} options={{ title: "Inversiones (MIVR)" }} />
      <Stack.Screen name="Reportes" component={ReportesScreen} options={{ title: "Reportes" }} />
      <Stack.Screen name="Administracion" component={AdministracionScreen} options={{ title: "Administración" }} />
      <Stack.Screen name="Calendario" component={CalendarioScreen} options={{ title: "Calendario de sorteos" }} />
      <Stack.Screen name="Prestamos" component={PrestamosScreen} options={{ title: "Préstamos" }} />
    </Stack.Navigator>
  );
}

/**
 * Navegación de nivel superior: 4 pestañas fijas.
 * Todos los módulos del roadmap inmediato (Resultados, Estadísticas/CAE,
 * Combinaciones, Inversiones/MIVR, Reportes, Administración) están
 * conectados con pantallas reales, no placeholders.
 */
export default function AppNavigator() {
  return (
    <NavigationContainer theme={NavTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: colors.bgElevated, borderTopColor: colors.border },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ color, size }) => {
            const icons = {
              DashboardTab: "home",
              ResultadosTab: "list",
              EstadisticasTab: "stats-chart",
              MasTab: "menu",
            };
            return <Ionicons name={icons[route.name] || "ellipse"} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: "Inicio" }} />
        <Tab.Screen name="ResultadosTab" component={ResultadosStack} options={{ title: "Resultados" }} />
        <Tab.Screen name="EstadisticasTab" component={EstadisticasStack} options={{ title: "Estadísticas" }} />
        <Tab.Screen name="MasTab" component={MasStack} options={{ title: "Más" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
