// ============================================================
// ALMACENAMIENTO LOCAL — persistencia con AsyncStorage.
// Contrato estable: cuando exista backend, estas funciones se
// reemplazan por llamadas HTTP sin tocar ninguna pantalla,
// porque todas consumen estas mismas firmas (listar/guardar/eliminar).
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  COMBINACIONES: "@lotoanalytics/combinaciones",
  INVERSIONES: "@lotoanalytics/inversiones",
  CORRECCIONES: "@lotoanalytics/correcciones",
  AUDIT_LOG: "@lotoanalytics/auditLog",
  FAVORITOS: "@lotoanalytics/loteriasFavoritas",
  PRESTAMOS: "@lotoanalytics/prestamos",
};

async function getJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn("Error leyendo almacenamiento", key, e);
    return fallback;
  }
}

async function setJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Error guardando almacenamiento", key, e);
  }
}

// ---- Combinaciones (módulo Combinaciones) ----
export const CombinacionesStore = {
  listar: () => getJSON(KEYS.COMBINACIONES, []),
  guardar: async (combinacion) => {
    const actuales = await getJSON(KEYS.COMBINACIONES, []);
    const nuevas = [combinacion, ...actuales];
    await setJSON(KEYS.COMBINACIONES, nuevas);
    return nuevas;
  },
  eliminar: async (id) => {
    const actuales = await getJSON(KEYS.COMBINACIONES, []);
    const nuevas = actuales.filter((c) => c.id !== id);
    await setJSON(KEYS.COMBINACIONES, nuevas);
    return nuevas;
  },
};

// ---- Inversiones (módulo MIVR) ----
export const InversionesStore = {
  listar: () => getJSON(KEYS.INVERSIONES, []),
  guardar: async (inversion) => {
    const actuales = await getJSON(KEYS.INVERSIONES, []);
    const nuevas = [inversion, ...actuales];
    await setJSON(KEYS.INVERSIONES, nuevas);
    return nuevas;
  },
  actualizar: async (id, cambios) => {
    const actuales = await getJSON(KEYS.INVERSIONES, []);
    const nuevas = actuales.map((inv) => (inv.id === id ? { ...inv, ...cambios } : inv));
    await setJSON(KEYS.INVERSIONES, nuevas);
    return nuevas;
  },
  eliminar: async (id) => {
    const actuales = await getJSON(KEYS.INVERSIONES, []);
    const nuevas = actuales.filter((i) => i.id !== id);
    await setJSON(KEYS.INVERSIONES, nuevas);
    return nuevas;
  },
};

// ---- Correcciones de administración (módulo Administración) ----
export const CorreccionesStore = {
  obtenerTodas: () => getJSON(KEYS.CORRECCIONES, {}),
  corregir: async (resultadoId, numerosNuevos, motivo, autor = "admin") => {
    const todas = await getJSON(KEYS.CORRECCIONES, {});
    const anterior = todas[resultadoId]?.numerosNuevos ?? null;
    todas[resultadoId] = {
      numerosNuevos,
      motivo,
      autor,
      fecha: new Date().toISOString(),
    };
    await setJSON(KEYS.CORRECCIONES, todas);
    await AuditLogStore.registrar({
      accion: "CORRECCION_RESULTADO",
      resultadoId,
      valorAnterior: anterior,
      valorNuevo: numerosNuevos,
      motivo,
      autor,
    });
    return todas;
  },
};

// ---- Auditoría (RF-14 / RF-15 / RNF-08: nunca se sobrescribe sin rastro) ----
export const AuditLogStore = {
  listar: () => getJSON(KEYS.AUDIT_LOG, []),
  registrar: async (entrada) => {
    const actuales = await getJSON(KEYS.AUDIT_LOG, []);
    const nueva = { id: `log-${Date.now()}`, fecha: new Date().toISOString(), ...entrada };
    const nuevas = [nueva, ...actuales];
    await setJSON(KEYS.AUDIT_LOG, nuevas);
    return nuevas;
  },
};

// ---- Loterías favoritas (Fase 5: Producto) ----
// Guarda solo un array de loteriaId marcados como favoritos. La lógica
// de qué hacer con eso (ordenar, filtrar) vive en src/core/favoritos.js
// como funciones puras, para poder probarlas sin AsyncStorage.
export const FavoritosStore = {
  listar: () => getJSON(KEYS.FAVORITOS, []),
  alternar: async (loteriaId) => {
    const actuales = await getJSON(KEYS.FAVORITOS, []);
    const yaEsFavorita = actuales.includes(loteriaId);
    const nuevas = yaEsFavorita ? actuales.filter((id) => id !== loteriaId) : [...actuales, loteriaId];
    await setJSON(KEYS.FAVORITOS, nuevas);
    return nuevas;
  },
};

// ---- Préstamos (módulo privado de contabilidad personal) ----
// Acceso restringido por PIN en PrestamosScreen — estos datos son solo
// para quien lleva la contabilidad, no para el resto de los usuarios de
// la app. Todo préstamo nuevo arranca con montoPagado 0 y estado
// "pendiente" (registrado, pero aún sin abonar nada).
export const PrestamosStore = {
  listar: () => getJSON(KEYS.PRESTAMOS, []),
  guardar: async (prestamo) => {
    const actuales = await getJSON(KEYS.PRESTAMOS, []);
    const nuevas = [prestamo, ...actuales];
    await setJSON(KEYS.PRESTAMOS, nuevas);
    return nuevas;
  },
  actualizar: async (id, cambios) => {
    const actuales = await getJSON(KEYS.PRESTAMOS, []);
    const nuevas = actuales.map((p) => (p.id === id ? { ...p, ...cambios } : p));
    await setJSON(KEYS.PRESTAMOS, nuevas);
    return nuevas;
  },
  eliminar: async (id) => {
    const actuales = await getJSON(KEYS.PRESTAMOS, []);
    const nuevas = actuales.filter((p) => p.id !== id);
    await setJSON(KEYS.PRESTAMOS, nuevas);
    return nuevas;
  },
};

export default { CombinacionesStore, InversionesStore, CorreccionesStore, AuditLogStore, FavoritosStore, PrestamosStore };
