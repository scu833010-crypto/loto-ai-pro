import { ordenarLoteriasPorFavoritas, esLoteriaFavorita } from "../src/core/favoritos";

const loteriasDePrueba = [
  { id: "a", nombre: "A" },
  { id: "b", nombre: "B" },
  { id: "c", nombre: "C" },
  { id: "d", nombre: "D" },
];

describe("favoritos.js — ordenarLoteriasPorFavoritas", () => {
  test("pone las favoritas primero, preservando su orden relativo original", () => {
    const resultado = ordenarLoteriasPorFavoritas(loteriasDePrueba, ["c", "a"]);
    expect(resultado.map((l) => l.id)).toEqual(["a", "c", "b", "d"]);
  });

  test("sin favoritos, el orden queda igual al original", () => {
    const resultado = ordenarLoteriasPorFavoritas(loteriasDePrueba, []);
    expect(resultado.map((l) => l.id)).toEqual(["a", "b", "c", "d"]);
  });

  test("con todas favoritas, el orden queda igual al original", () => {
    const resultado = ordenarLoteriasPorFavoritas(loteriasDePrueba, ["a", "b", "c", "d"]);
    expect(resultado.map((l) => l.id)).toEqual(["a", "b", "c", "d"]);
  });

  test("no muta el array original", () => {
    const copia = [...loteriasDePrueba];
    ordenarLoteriasPorFavoritas(loteriasDePrueba, ["c"]);
    expect(loteriasDePrueba).toEqual(copia);
  });

  test("un id favorito que no existe en la lista simplemente no aparece duplicado", () => {
    const resultado = ordenarLoteriasPorFavoritas(loteriasDePrueba, ["no-existe", "b"]);
    expect(resultado.map((l) => l.id)).toEqual(["b", "a", "c", "d"]);
  });
});

describe("favoritos.js — esLoteriaFavorita", () => {
  test("true si el id está en la lista de favoritos", () => {
    expect(esLoteriaFavorita("leidsa", ["leidsa", "real"])).toBe(true);
  });

  test("false si no está", () => {
    expect(esLoteriaFavorita("anguila", ["leidsa", "real"])).toBe(false);
  });

  test("false con lista de favoritos vacía (valor por defecto)", () => {
    expect(esLoteriaFavorita("leidsa")).toBe(false);
  });
});
