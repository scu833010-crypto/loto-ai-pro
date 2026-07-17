const { fechaLocalRD } = require("../src/utils/fechaRD");

describe("fechaRD.js — fechaLocalRD", () => {
  test("BUG REAL CORREGIDO: 02:00 UTC sigue siendo el día anterior en RD (UTC-4)", () => {
    // 2026-07-17T02:00:00Z = 2026-07-16T22:00 en Santo Domingo (RD).
    // El bug viejo usaba date.toISOString().slice(0,10), que hubiera
    // dado "2026-07-17" — un día adelantado durante esta ventana de
    // 4 horas cada madrugada.
    const instante = new Date("2026-07-17T02:00:00.000Z");
    expect(fechaLocalRD(instante)).toBe("2026-07-16");
  });

  test("a media tarde UTC y RD coinciden en el mismo día calendario", () => {
    const instante = new Date("2026-07-16T18:00:00.000Z"); // 14:00 en RD, mismo día
    expect(fechaLocalRD(instante)).toBe("2026-07-16");
  });

  test("justo en el límite: 03:59 UTC todavía es el día anterior en RD", () => {
    const instante = new Date("2026-07-17T03:59:00.000Z"); // 23:59 del 16 en RD
    expect(fechaLocalRD(instante)).toBe("2026-07-16");
  });

  test("justo después del límite: 04:00 UTC ya es el nuevo día en RD", () => {
    const instante = new Date("2026-07-17T04:00:00.000Z"); // 00:00 del 17 en RD
    expect(fechaLocalRD(instante)).toBe("2026-07-17");
  });

  test("sin argumento, usa el instante actual (no lanza error)", () => {
    expect(() => fechaLocalRD()).not.toThrow();
  });
});
