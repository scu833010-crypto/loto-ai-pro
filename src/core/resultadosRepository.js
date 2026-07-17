// ============================================================
// REPOSITORIO DE RESULTADOS — punto único de lectura de resultados.
// Intenta el backend real primero (syncService); si no está
// configurado o falla, cae en datos de ejemplo (mockData) para que
// la app nunca se quede en blanco mientras se despliega el backend.
// ============================================================

import {
  historicoMock,
  obtenerUltimosResultados as obtenerUltimosMock,
  obtenerHistoricoPorLoteria as obtenerHistoricoMock,
} from "./mockData";
import { CorreccionesStore } from "./storage";
import { fechaLocalRD } from "./fechaHoraRD";
import {
  obtenerTodosDesdeFuenteReal,
  obtenerResultadosDesdeFuenteReal,
  obtenerRecientesDesdeFuenteReal,
  fuenteRealHabilitada,
} from "./syncService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ULTIMOS_VERIFICADOS_KEY = "@loto_ia_ultimos_verificados_v1";

async function guardarUltimosVerificados(resultados) {
  const verificados = resultados.filter((resultado) => resultado.verificationStatus === "verified");
  if (verificados.length > 0) await AsyncStorage.setItem(ULTIMOS_VERIFICADOS_KEY, JSON.stringify(verificados.slice(0, 500)));
}

async function obtenerUltimosVerificados() {
  try {
    const guardados = await AsyncStorage.getItem(ULTIMOS_VERIFICADOS_KEY);
    return guardados ? JSON.parse(guardados).map((resultado) => ({ ...resultado, verificationStatus: "cached" })) : [];
  } catch {
    return [];
  }
}

function fechaISO(date) {
  return fechaLocalRD(date);
}

function calcularRangoFechas(rango, fecha) {
  const hoy = new Date();
  if (rango === "hoy") return { desde: fechaISO(hoy), hasta: fechaISO(hoy) };
  if (rango === "ayer") {
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    return { desde: fechaISO(ayer), hasta: fechaISO(ayer) };
  }
  if (rango === "7dias") {
    const hace7 = new Date(hoy);
    hace7.setDate(hoy.getDate() - 7);
    return { desde: fechaISO(hace7), hasta: fechaISO(hoy) };
  }
  if (rango === "personalizada") {
    if (!fecha) throw new Error("Falta 'fecha' para rango personalizada");
    return { desde: fecha, hasta: fecha };
  }
  throw new Error(`Rango desconocido: ${rango}`);
}

function filtrarLocalPorRango(resultados, rango, fecha) {
  const { desde, hasta } = calcularRangoFechas(rango, fecha);
  return resultados.filter((r) => r.fecha >= desde && r.fecha <= hasta);
}

function aplicarCorrecciones(resultados, correcciones) {
  return resultados.map((r) => {
    const c = correcciones[r.id];
    if (!c) return r;
    return { ...r, numeros: c.numerosNuevos, corregido: true };
  });
}

export async function obtenerUltimosResultadosAsync(limite = 6) {
  const correcciones = await CorreccionesStore.obtenerTodas();

  if (fuenteRealHabilitada()) {
    try {
      const todos = await obtenerTodosDesdeFuenteReal();
      await guardarUltimosVerificados(todos);
      const ordenados = todos.sort((a, b) => (a.fecha + a.hora < b.fecha + b.hora ? 1 : -1));
      return aplicarCorrecciones(ordenados.slice(0, limite), correcciones);
    } catch (e) {
      const cache = await obtenerUltimosVerificados();
      if (cache.length > 0) return aplicarCorrecciones(cache.slice(0, limite), correcciones);
      console.warn("Backend real falló; no hay resultado verificado almacenado:", e.message);
    }
  }

  return aplicarCorrecciones(obtenerUltimosMock(limite), correcciones);
}

export async function obtenerHistoricoPorLoteriaAsync(loteriaId) {
  const correcciones = await CorreccionesStore.obtenerTodas();

  if (fuenteRealHabilitada()) {
    try {
      const reales = await obtenerResultadosDesdeFuenteReal(loteriaId);
      await guardarUltimosVerificados(reales);
      return aplicarCorrecciones(reales, correcciones);
    } catch (e) {
      const cache = (await obtenerUltimosVerificados()).filter((resultado) => resultado.loteriaId === loteriaId);
      if (cache.length > 0) return aplicarCorrecciones(cache, correcciones);
      console.warn("Backend real falló; no hay resultado verificado almacenado:", e.message);
    }
  }

  return aplicarCorrecciones(obtenerHistoricoMock(loteriaId), correcciones);
}

export async function obtenerTodosLosResultadosAsync() {
  const correcciones = await CorreccionesStore.obtenerTodas();

  if (fuenteRealHabilitada()) {
    try {
      const todos = await obtenerTodosDesdeFuenteReal();
      await guardarUltimosVerificados(todos);
      return aplicarCorrecciones(todos, correcciones);
    } catch (e) {
      const cache = await obtenerUltimosVerificados();
      if (cache.length > 0) return aplicarCorrecciones(cache, correcciones);
      console.warn("Backend real falló; no hay resultado verificado almacenado:", e.message);
    }
  }

  return aplicarCorrecciones(Object.values(historicoMock).flat(), correcciones);
}

/**
 * RESULTADOS RECIENTES (reemplaza "Resultados de Hoy"): soporta
 * Hoy / Ayer / Últimos 7 días / Fecha personalizada. Usa el backend
 * real (SQLite) si está configurado; si no, filtra localmente el
 * histórico de ejemplo por el mismo rango, para que la pantalla se
 * comporte igual con o sin backend.
 */
export async function obtenerRecientesAsync({ rango = "hoy", fecha = null, loteriaId = null } = {}) {
  const correcciones = await CorreccionesStore.obtenerTodas();

  if (fuenteRealHabilitada()) {
    try {
      const reales = await obtenerRecientesDesdeFuenteReal({ rango, fecha, loteriaId });
      await guardarUltimosVerificados(reales);
      return aplicarCorrecciones(reales, correcciones);
    } catch (e) {
      const cache = await obtenerUltimosVerificados();
      const filtradosCache = loteriaId ? cache.filter((resultado) => resultado.loteriaId === loteriaId) : cache;
      if (filtradosCache.length > 0) return aplicarCorrecciones(filtrarLocalPorRango(filtradosCache, rango, fecha), correcciones);
      console.warn("Backend real falló; no hay resultado verificado almacenado:", e.message);
    }
  }

  const base = loteriaId ? obtenerHistoricoMock(loteriaId) : Object.values(historicoMock).flat();
  const filtrados = filtrarLocalPorRango(base, rango, fecha);
  return aplicarCorrecciones(filtrados, correcciones);
}
