import { construirAgendaDiaria } from "../src/core/calendario";

jest.mock("../src/core/fechaHoraRD", () => ({ fechaHoyRD: () => "2026-07-17" }));

describe("calendario", () => {
  const loterias = [{ id: "demo", nombre: "Demo", colorKey: "leidsa", sorteos: [{ nombre: "Juego Demo", hora: "23:59" }] }];
  test("marca como realizado cuando existe un resultado real del juego", () => {
    const agenda = construirAgendaDiaria(loterias, [{ id: "r1", loteriaId: "demo", fecha: "2026-07-17", hora: "23:59", nombreJuego: "Juego Demo", numeros: ["01"] }]);
    expect(agenda[0].estado).toBe("realizado");
  });

  test("no presenta datos de demostracion como resultado real", () => {
    const agenda = construirAgendaDiaria(loterias, [{ id: "r2", loteriaId: "demo", fecha: "2026-07-17", hora: "23:59", nombreJuego: "Juego Demo", numeros: ["01"], fuente: "SIMULADO" }]);
    expect(agenda[0].estado).toBe("demostracion");
  });
});
