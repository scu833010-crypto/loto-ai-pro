describe("apiOficialClient.js — obtenerResultadosDelDia", () => {
  let obtenerResultadosDelDia;

  beforeEach(() => {
    jest.resetModules();
    ({ obtenerResultadosDelDia } = require("../src/scraper/apiOficialClient"));
  });

  afterEach(() => {
    delete global.fetch;
  });

  test("mapea un game_id catalogado a su lotería y nombre real, con hora calculada", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => [
        {
          game_id: "6966a6d1ea7015c3b8a3d453", // Quiniela Leidsa
          lastSession: {
            _id: "s1",
            date: "2026-07-16T04:00:00.000Z",
            score: [["98", "24", "44"]],
            updatedAt: "2026-07-17T00:59:58.063Z",
          },
        },
      ],
    });

    const { resultados, sinCatalogar } = await obtenerResultadosDelDia(new Date("2026-07-16"));

    expect(sinCatalogar).toEqual([]);
    expect(resultados).toHaveLength(1);
    expect(resultados[0]).toMatchObject({
      loteriaId: "leidsa",
      nombreJuego: "Quiniela Leidsa",
      fecha: "2026-07-16",
      numeros: ["98", "24", "44"],
      tipoJuego: "TRIPLETA",
    });
    // La hora se calcula desde horarios.js, no queda en null.
    expect(resultados[0].hora).toBe("20:55");
  });

  test("un game_id NO catalogado se reporta, nunca se inventa un nombre", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => [
        { game_id: "ID_QUE_NO_EXISTE", lastSession: { _id: "x", date: "2026-07-16T04:00:00.000Z", score: [["99"]] } },
      ],
    });

    const { resultados, sinCatalogar } = await obtenerResultadosDelDia(new Date("2026-07-16"));
    expect(resultados).toHaveLength(0);
    expect(sinCatalogar).toEqual(["ID_QUE_NO_EXISTE"]);
  });

  test("conserva 'money' (bote/jackpot) cuando el sorteo lo trae", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => [
        {
          game_id: "6966a6d3ea7015c3b8a3d5cc", // Loto 5+ (sí está en el catálogo actual)
          lastSession: { _id: "s2", date: "2026-07-16T04:00:00.000Z", money: "3 M", score: [["21", "03", "13"]] },
        },
      ],
    });

    const { resultados } = await obtenerResultadosDelDia(new Date("2026-07-16"));
    expect(resultados).toHaveLength(1);
    expect(resultados[0].money).toBe("3 M");
  });

  test("infiere tipoJuego MULTIPLE para formatos que no son quiniela/palé/tripleta de 2 dígitos", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => [
        {
          game_id: "6966a6d3ea7015c3b8a3d5cc", // Loto 5+ (La Primera) — 6 números
          lastSession: { _id: "s3", date: "2026-07-16T04:00:00.000Z", score: [["21", "03", "13", "11", "02", "02"]] },
        },
      ],
    });

    const { resultados } = await obtenerResultadosDelDia(new Date("2026-07-16"));
    expect(resultados[0].tipoJuego).toBe("MULTIPLE");
  });
});

describe("apiOficialClient.js — backfillHistorico", () => {
  beforeEach(() => {
    jest.resetModules();
  });
  afterEach(() => {
    delete global.fetch;
  });

  test("hace una llamada de red por cada día solicitado, con fechas distintas", async () => {
    const { backfillHistorico } = require("../src/scraper/apiOficialClient");
    const fechasConsultadas = [];

    global.fetch = async (url) => {
      const fecha = new URL(url).searchParams.get("date").slice(0, 10);
      fechasConsultadas.push(fecha);
      return {
        ok: true,
        json: async () => [
          {
            game_id: "6966a6d1ea7015c3b8a3d453",
            lastSession: { _id: `s-${fecha}`, date: `${fecha}T04:00:00.000Z`, score: [["11", "22", "33"]] },
          },
        ],
      };
    };

    const { resultados, errores } = await backfillHistorico({ dias: 3, pausaMs: 1 });

    expect(fechasConsultadas).toHaveLength(3);
    expect(new Set(fechasConsultadas).size).toBe(3); // 3 fechas distintas, no repetidas
    expect(resultados).toHaveLength(3);
    expect(errores).toHaveLength(0);
  });

  test("un día que falla no detiene el backfill de los demás días", async () => {
    const { backfillHistorico } = require("../src/scraper/apiOficialClient");
    let llamada = 0;

    global.fetch = async () => {
      llamada++;
      if (llamada === 2) throw new Error("Fallo de red simulado");
      return { ok: true, json: async () => [] };
    };

    const { errores } = await backfillHistorico({ dias: 3, pausaMs: 1 });
    expect(llamada).toBe(3); // se intentaron los 3 días igual
    expect(errores).toHaveLength(1);
  });
});
