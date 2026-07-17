import { fechaHoyRD } from "./fechaHoraRD";

export function construirAgendaDiaria(loterias, resultados = [], loteriaId = null) {
  const hoy = fechaHoyRD();
  const horaActual = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Santo_Domingo", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
  return loterias.filter((l) => !loteriaId || l.id === loteriaId).flatMap((loteria) => loteria.sorteos.map((sorteo) => {
    const resultado = resultados.find((r) => r.loteriaId === loteria.id && r.fecha === hoy && (r.nombreJuego === sorteo.nombre || r.hora === sorteo.hora));
    const esDemostracion = /simulad|demo|mock/i.test(resultado?.fuente || "");
    const estado = resultado ? (esDemostracion ? "demostracion" : "realizado") : sorteo.hora > horaActual ? "pendiente" : "sin_dato";
    return { id: `${loteria.id}-${sorteo.nombre}-${hoy}`, fecha: hoy, loteria, sorteo, estado, resultado };
  })).sort((a, b) => a.sorteo.hora.localeCompare(b.sorteo.hora));
}
