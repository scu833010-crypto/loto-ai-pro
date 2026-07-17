import { verificarInversion, calcularGanancia } from "../src/core/mivrEngine";
import { TipoJuego } from "../src/core/models";
import { FactorPagoReferencial } from "../src/core/payoutRules";

function resultado(fecha, numeros) {
  return { fecha, numeros };
}

describe("mivrEngine.js — verificarInversion (QUINIELA)", () => {
  test("coincide si el número salió en cualquier sorteo desde la fecha de la inversión", () => {
    const inversion = { fecha: "2026-07-10" };
    const combinacion = { tipoJuego: TipoJuego.QUINIELA, numeros: ["45"] };
    const historico = [resultado("2026-07-09", ["45"]), resultado("2026-07-12", ["45", "10", "20"])];

    const r = verificarInversion(inversion, combinacion, historico);
    expect(r.coincide).toBe(true);
    expect(r.resultado.fecha).toBe("2026-07-12"); // el del 09 es ANTES de la inversión, no cuenta
  });

  test("no coincide si el número nunca salió", () => {
    const inversion = { fecha: "2026-07-10" };
    const combinacion = { tipoJuego: TipoJuego.QUINIELA, numeros: ["99"] };
    const historico = [resultado("2026-07-12", ["45", "10", "20"])];

    const r = verificarInversion(inversion, combinacion, historico);
    expect(r.coincide).toBe(false);
    expect(r.resultado).toBeNull();
  });
});

describe("mivrEngine.js — verificarInversion (PALE)", () => {
  test("coincide si ambos números salieron el mismo día (sumando todos los sorteos de ese día)", () => {
    const inversion = { fecha: "2026-07-10" };
    const combinacion = { tipoJuego: TipoJuego.PALE, numeros: ["12", "34"] };
    // Dos sorteos distintos el mismo día — el pale se arma combinando ambos
    const historico = [resultado("2026-07-11", ["12", "99"]), resultado("2026-07-11", ["34", "55"])];

    const r = verificarInversion(inversion, combinacion, historico);
    expect(r.coincide).toBe(true);
  });

  test("NO coincide si los dos números salen en días distintos", () => {
    const inversion = { fecha: "2026-07-10" };
    const combinacion = { tipoJuego: TipoJuego.PALE, numeros: ["12", "34"] };
    const historico = [resultado("2026-07-11", ["12"]), resultado("2026-07-12", ["34"])];

    const r = verificarInversion(inversion, combinacion, historico);
    expect(r.coincide).toBe(false);
  });
});

describe("mivrEngine.js — calcularGanancia", () => {
  test("multiplica el monto por el factor de pago referencial del tipo de juego", () => {
    expect(calcularGanancia(100, TipoJuego.QUINIELA, FactorPagoReferencial)).toBe(100 * 24);
    expect(calcularGanancia(50, TipoJuego.PALE, FactorPagoReferencial)).toBe(50 * 900);
  });

  test("devuelve 0 si el tipo de juego no tiene factor configurado (ej. MULTIPLE)", () => {
    expect(calcularGanancia(100, "MULTIPLE", FactorPagoReferencial)).toBe(0);
  });
});
