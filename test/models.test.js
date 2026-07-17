import { Loterias, validarNumero, obtenerLoteriaPorId, TipoJuego } from "../src/core/models";

describe("models.js — integridad del catálogo de loterías", () => {
  test("no hay ids de lotería duplicados", () => {
    const ids = Loterias.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("cada lotería tiene al menos un sorteo", () => {
    Loterias.forEach((l) => {
      expect(l.sorteos.length).toBeGreaterThan(0);
    });
  });

  test("alcance confirmado: exactamente estas 10 loterías, ninguna más", () => {
    const idsEsperados = [
      "loteria-nacional",
      "leidsa",
      "real",
      "loteka",
      "la-primera",
      "la-suerte",
      "lotedom",
      "anguila",
      "nueva-york",
      "florida",
    ];
    expect(Loterias.map((l) => l.id).sort()).toEqual(idsEsperados.sort());
  });

  test("King Lottery y Haiti Bolet NO están en el catálogo (se sacaron a propósito)", () => {
    const ids = Loterias.map((l) => l.id);
    expect(ids).not.toContain("king-lottery");
    expect(ids).not.toContain("haiti-bolet");
  });

  test("obtenerLoteriaPorId encuentra una lotería existente", () => {
    expect(obtenerLoteriaPorId("leidsa")?.nombre).toBe("Leidsa");
  });

  test("obtenerLoteriaPorId devuelve null para un id inexistente (no explota)", () => {
    expect(obtenerLoteriaPorId("no-existe")).toBeNull();
  });
});

describe("models.js — validarNumero", () => {
  test("acepta números de 00 a 99", () => {
    expect(validarNumero("00")).toBe(true);
    expect(validarNumero("99")).toBe(true);
    expect(validarNumero("45")).toBe(true);
  });

  test("rechaza fuera de rango o no numérico", () => {
    expect(validarNumero("100")).toBe(false);
    expect(validarNumero("-1")).toBe(false);
    expect(validarNumero("abc")).toBe(false);
  });
});

describe("models.js — TipoJuego", () => {
  test("incluye MULTIPLE (necesario para loto de varias bolas, cuartetas, etc.)", () => {
    expect(TipoJuego.MULTIPLE).toBe("MULTIPLE");
  });
});
