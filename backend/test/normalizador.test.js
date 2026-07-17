const { validarResultado, normalizar } = require("../src/normalizer/normalizador");

function base(overrides = {}) {
  return {
    id: "test-1",
    loteriaId: "leidsa",
    fecha: "2026-07-16",
    tipoJuego: "TRIPLETA",
    numeros: ["12", "34", "56"],
    ...overrides,
  };
}

describe("normalizador.js — validarResultado", () => {
  test("resultado válido no da error", () => {
    expect(validarResultado(base())).toBeNull();
  });

  test("acepta números de un solo dígito (Pick 3, Win 4, Numbers)", () => {
    const r = base({ tipoJuego: "MULTIPLE", numeros: ["5", "4", "1", "6"] });
    expect(validarResultado(r)).toBeNull();
  });

  test("acepta bloques de 4 dígitos (Philipsburg)", () => {
    const r = base({ tipoJuego: "MULTIPLE", numeros: ["2605", "1342", "6130"] });
    expect(validarResultado(r)).toBeNull();
  });

  test("acepta bolas especiales alfanuméricas (multiplicador Powerball, etc.)", () => {
    const r = base({ tipoJuego: "MULTIPLE", numeros: ["18", "02", "29", "38", "07", "16", "pGHB0H5mLT0X57sJUpTb2"] });
    expect(validarResultado(r)).toBeNull();
  });

  test("rechaza si falta loteriaId", () => {
    const r = base({ loteriaId: undefined });
    expect(validarResultado(r)).toMatch(/loteriaId/);
  });

  test("rechaza fecha con formato inválido", () => {
    const r = base({ fecha: "16-07-2026" });
    expect(validarResultado(r)).toMatch(/fecha/);
  });

  test("rechaza tipoJuego desconocido", () => {
    const r = base({ tipoJuego: "INVENTADO" });
    expect(validarResultado(r)).toMatch(/tipoJuego/);
  });

  test("rechaza array de números vacío", () => {
    const r = base({ numeros: [] });
    expect(validarResultado(r)).toMatch(/números/);
  });

  test("YA NO exige que 'hora' esté presente (la API real no siempre la trae)", () => {
    const r = base({ hora: undefined });
    expect(validarResultado(r)).toBeNull();
  });
});

describe("normalizador.js — normalizar (conserva campos nuevos)", () => {
  test("conserva nombreJuego, money, actualizadoEn y seRealizaEseDia", () => {
    const [resultado] = normalizar([
      base({
        nombreJuego: "Mega Millions",
        money: "637 M",
        actualizadoEn: "2026-07-15T03:03:39.894Z",
        seRealizaEseDia: true,
      }),
    ]);
    expect(resultado.nombreJuego).toBe("Mega Millions");
    expect(resultado.money).toBe("637 M");
    expect(resultado.actualizadoEn).toBe("2026-07-15T03:03:39.894Z");
    expect(resultado.seRealizaEseDia).toBe(true);
  });

  test("descarta silenciosamente un resultado inválido sin tumbar el resto", () => {
    const buenos = [base({ id: "ok-1" }), base({ id: "malo", fecha: "fecha-invalida" }), base({ id: "ok-2" })];
    const resultado = normalizar(buenos);
    expect(resultado.map((r) => r.id)).toEqual(["ok-1", "ok-2"]);
  });
});
