import { fechaLocalRD, fechaHoyRD, formatoHoraRD, tiempoRelativoRD } from "../src/core/fechaHoraRD";

describe("fechaHoraRD.js — fechaLocalRD", () => {
  test("BUG REAL CORREGIDO: 02:00 UTC sigue siendo el día anterior en RD", () => {
    const instante = new Date("2026-07-17T02:00:00.000Z");
    expect(fechaLocalRD(instante)).toBe("2026-07-16");
  });

  test("justo en el límite: 04:00 UTC ya es el nuevo día en RD", () => {
    const instante = new Date("2026-07-17T04:00:00.000Z");
    expect(fechaLocalRD(instante)).toBe("2026-07-17");
  });

  test("fechaHoyRD no lanza error y devuelve formato YYYY-MM-DD", () => {
    const hoy = fechaHoyRD();
    expect(hoy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("fechaHoraRD.js — formatoHoraRD / tiempoRelativoRD", () => {
  test("formatoHoraRD devuelve '--' para fecha inválida (nunca revienta la UI)", () => {
    expect(formatoHoraRD("no-es-una-fecha")).toBe("--");
  });

  test("tiempoRelativoRD nunca da tiempo negativo por desfase de reloj", () => {
    const futuro = new Date(Date.now() + 60_000); // 1 minuto en el futuro
    expect(tiempoRelativoRD(futuro)).toBe("Hace un momento");
  });

  test("tiempoRelativoRD reconoce minutos, horas y días correctamente", () => {
    const hace5min = new Date(Date.now() - 5 * 60_000);
    expect(tiempoRelativoRD(hace5min)).toBe("Hace 5 min");

    const hace3h = new Date(Date.now() - 3 * 60 * 60_000);
    expect(tiempoRelativoRD(hace3h)).toBe("Hace 3 h");

    const hace2dias = new Date(Date.now() - 2 * 24 * 60 * 60_000);
    expect(tiempoRelativoRD(hace2dias)).toBe("Hace 2 días");
  });
});
