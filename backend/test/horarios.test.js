const { calcularHorario, horaDesdeNombre } = require("../src/config/horarios");

describe("horarios.js — calcularHorario", () => {
  test("Quiniela Leidsa: lunes a sábado a las 20:55", () => {
    // 2026-07-16 es jueves
    const r = calcularHorario("Quiniela Leidsa", "leidsa", "2026-07-16");
    expect(r).toEqual({ hora: "20:55", seRealizaEseDia: true });
  });

  test("Quiniela Leidsa: domingo SÍ se realiza, pero a las 15:55 (no se excluye el domingo)", () => {
    // 2026-07-19 es domingo — bug real que se encontró y corrigió: antes
    // el domingo quedaba marcado como "no se realiza" por error.
    const r = calcularHorario("Quiniela Leidsa", "leidsa", "2026-07-19");
    expect(r).toEqual({ hora: "15:55", seRealizaEseDia: true });
  });

  test("Loto - Super Loto Más: NO se realiza un jueves (solo miércoles y sábado)", () => {
    const r = calcularHorario("Loto - Super Loto Más", "leidsa", "2026-07-16");
    expect(r.seRealizaEseDia).toBe(false);
  });

  test("Loto - Super Loto Más: SÍ se realiza un sábado", () => {
    const r = calcularHorario("Loto - Super Loto Más", "leidsa", "2026-07-18");
    expect(r.seRealizaEseDia).toBe(true);
    expect(r.hora).toBe("20:55");
  });

  test("Billetes Domingo: NO se realiza entre semana", () => {
    const r = calcularHorario("Billetes Domingo", "loteria-nacional", "2026-07-16");
    expect(r.seRealizaEseDia).toBe(false);
  });

  test("Billetes Domingo: SÍ se realiza domingo", () => {
    const r = calcularHorario("Billetes Domingo", "loteria-nacional", "2026-07-19");
    expect(r.seRealizaEseDia).toBe(true);
    expect(r.hora).toBe("18:00");
  });

  test("Florida Día tiene su propia hora, separada de Nueva York", () => {
    // Antes Nueva York y Florida compartían loteriaId "americana" y
    // podían pisarse horarios; ahora Florida es su propio loteriaId.
    const florida = calcularHorario("Florida Día", "florida", "2026-07-16");
    expect(florida).toEqual({ hora: "13:30", seRealizaEseDia: true });
  });

  test("Anguila: la hora se extrae directo del nombre del sorteo", () => {
    const r = calcularHorario("Anguila 8:00 AM", "anguila", "2026-07-16");
    expect(r).toEqual({ hora: "08:00", seRealizaEseDia: true });
  });

  test("La Cuarteta: también extrae la hora del nombre (formato PM)", () => {
    const r = calcularHorario("La Cuarteta 6:00 PM", "anguila", "2026-07-16");
    expect(r.hora).toBe("18:00");
  });

  test("Sorteo desconocido: no inventa hora, devuelve null explícito", () => {
    const r = calcularHorario("Sorteo Que No Existe", "leidsa", "2026-07-16");
    expect(r).toEqual({ hora: null, seRealizaEseDia: null });
  });

  test("MegaLotto (Loteka): solo lunes y jueves", () => {
    // 2026-07-16 es jueves -> sí; 2026-07-17 viernes -> no
    expect(calcularHorario("MegaLotto", "loteka", "2026-07-16").seRealizaEseDia).toBe(true);
    expect(calcularHorario("MegaLotto", "loteka", "2026-07-17").seRealizaEseDia).toBe(false);
  });
});

describe("horarios.js — horaDesdeNombre", () => {
  test("reconoce formato AM", () => {
    expect(horaDesdeNombre("Anguila 9:00 AM")).toBe("09:00");
  });
  test("reconoce formato PM y convierte a 24h", () => {
    expect(horaDesdeNombre("Anguila 8:00 PM")).toBe("20:00");
  });
  test("12:00 AM es medianoche (00:00)", () => {
    expect(horaDesdeNombre("Sorteo 12:00 AM")).toBe("00:00");
  });
  test("12:00 PM es mediodía (12:00)", () => {
    expect(horaDesdeNombre("Sorteo 12:00 PM")).toBe("12:00");
  });
  test("nombre sin hora devuelve null", () => {
    expect(horaDesdeNombre("Quiniela Leidsa")).toBeNull();
  });
});
