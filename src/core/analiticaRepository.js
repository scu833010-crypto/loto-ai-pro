import { obtenerAnaliticaCoreIa } from "./syncService";

// Punto unico de acceso al CORE IA desde la app. Nunca llamar la API desde pantallas.
export async function obtenerAnaliticaPorLoteriaAsync(loteriaId) {
  return obtenerAnaliticaCoreIa(loteriaId);
}
