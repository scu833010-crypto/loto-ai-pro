// ============================================================
// MOTOR ANALÍTICO — cálculos estadísticos sobre el histórico.
// Reglas: nunca predice, siempre describe el pasado.
// Diseñado para extenderse (nuevas métricas) sin romper el contrato:
// toda función recibe un array de Resultado y devuelve datos planos.
// ============================================================

/**
 * Filtra un histórico por lotería. Todas las métricas de este motor
 * deben calcularse SIEMPRE sobre datos de una sola lotería a la vez
 * (nunca mezclar loterías) — este helper es el punto único donde se
 * aplica ese filtro, para que sea imposible olvidarlo por accidente.
 */
export function filtrarPorLoteria(resultados, loteriaId) {
  return resultados.filter((r) => r.loteriaId === loteriaId);
}

/**
 * Filtra un histórico por rango de fechas (inclusive), formato 'YYYY-MM-DD'.
 */
export function filtrarPorRangoFechas(resultados, fechaInicio, fechaFin) {
  return resultados.filter((r) => r.fecha >= fechaInicio && r.fecha <= fechaFin);
}

/**
 * Frecuencia calculada exclusivamente sobre una lotería puntual dentro
 * de un rango de fechas opcional. Envoltorio de calcularFrecuencias +
 * los dos filtros de arriba, para dejar explícito en el nombre de la
 * función que nunca mezcla loterías.
 */
export function calcularFrecuenciaPorLoteria(resultados, loteriaId, fechaInicio = null, fechaFin = null) {
  let filtrados = filtrarPorLoteria(resultados, loteriaId);
  if (fechaInicio && fechaFin) filtrados = filtrarPorRangoFechas(filtrados, fechaInicio, fechaFin);
  return calcularFrecuencias(filtrados);
}

/**
 * Frecuencia: cuántas veces salió cada número (00-99) en el conjunto dado.
 * Devuelve array ordenado descendente por frecuencia.
 */
export function calcularFrecuencias(resultados) {
  const conteo = {};
  for (let i = 0; i < 100; i++) conteo[String(i).padStart(2, "0")] = 0;

  resultados.forEach((r) => {
    r.numeros.forEach((num) => {
      conteo[num] = (conteo[num] || 0) + 1;
    });
  });

  return Object.entries(conteo)
    .map(([numero, veces]) => ({ numero, veces }))
    .sort((a, b) => b.veces - a.veces);
}

/**
 * Ausencia: cuántos sorteos (o días) han pasado desde la última vez
 * que salió cada número. Requiere resultados ordenados desc por fecha.
 */
export function calcularAusencias(resultadosOrdenadosDesc) {
  const ultimaAparicion = {};
  for (let i = 0; i < 100; i++) ultimaAparicion[String(i).padStart(2, "0")] = null;

  resultadosOrdenadosDesc.forEach((r, index) => {
    r.numeros.forEach((num) => {
      if (ultimaAparicion[num] === null) {
        ultimaAparicion[num] = index; // posición = sorteos transcurridos
      }
    });
  });

  return Object.entries(ultimaAparicion)
    .map(([numero, sorteosAusente]) => ({
      numero,
      sorteosAusente: sorteosAusente === null ? resultadosOrdenadosDesc.length : sorteosAusente,
    }))
    .sort((a, b) => b.sorteosAusente - a.sorteosAusente);
}

/**
 * Agrupa números por decena (00-09, 10-19, ... 90-99).
 */
export function agruparPorDecena(resultados) {
  const grupos = {};
  for (let d = 0; d < 10; d++) grupos[d] = 0;
  resultados.forEach((r) =>
    r.numeros.forEach((num) => {
      const decena = Math.floor(Number(num) / 10);
      grupos[decena] += 1;
    })
  );
  return Object.entries(grupos).map(([decena, veces]) => ({
    decena: `${decena}0-${decena}9`,
    veces,
  }));
}

/**
 * Agrupa por terminación (último dígito 0-9).
 */
export function agruparPorTerminacion(resultados) {
  const grupos = {};
  for (let t = 0; t < 10; t++) grupos[t] = 0;
  resultados.forEach((r) =>
    r.numeros.forEach((num) => {
      const term = Number(num) % 10;
      grupos[term] += 1;
    })
  );
  return Object.entries(grupos).map(([term, veces]) => ({ terminacion: term, veces }));
}

/**
 * Métrica de calidad de datos: % de sorteos esperados que realmente
 * se recibieron en el rango de fechas (detecta huecos de sincronización).
 */
export function calidadDeDatos(resultados, diasEsperados) {
  const fechasUnicas = new Set(resultados.map((r) => r.fecha));
  const cobertura = diasEsperados > 0 ? fechasUnicas.size / diasEsperados : 0;
  return {
    diasConDato: fechasUnicas.size,
    diasEsperados,
    coberturaPorcentaje: Math.round(cobertura * 100),
  };
}

/**
 * Agrupa números en rangos de tamaño fijo (por defecto 00-19, 20-39, ...),
 * usado para el gráfico de distribución (donut). Describe qué proporción
 * del histórico cae en cada rango; no es una predicción de rango futuro.
 */
export function agruparPorRango(resultados, tamanoRango = 20) {
  const cantidadRangos = Math.ceil(100 / tamanoRango);
  const grupos = new Array(cantidadRangos).fill(0);
  resultados.forEach((r) =>
    r.numeros.forEach((num) => {
      const idx = Math.min(Math.floor(Number(num) / tamanoRango), cantidadRangos - 1);
      grupos[idx] += 1;
    })
  );
  return grupos.map((veces, idx) => {
    const inicio = idx * tamanoRango;
    const fin = Math.min(inicio + tamanoRango - 1, 99);
    return {
      etiqueta: `${String(inicio).padStart(2, "0")}-${String(fin).padStart(2, "0")}`,
      veces,
    };
  });
}

/**
 * Divide el histórico (ordenado desc por fecha) en `periodos` bloques
 * cronológicos y cuenta cuántas veces salió `numero` en cada bloque.
 * Sirve para graficar una tendencia histórica; describe el pasado,
 * no proyecta el futuro.
 */
export function tendenciaDeNumero(resultadosOrdenadosDesc, numero, periodos = 6) {
  const cronologicos = [...resultadosOrdenadosDesc].reverse(); // más antiguo primero
  const tamanoBloque = Math.max(Math.ceil(cronologicos.length / periodos), 1);
  const bloques = [];
  for (let i = 0; i < periodos; i++) {
    const inicio = i * tamanoBloque;
    const bloque = cronologicos.slice(inicio, inicio + tamanoBloque);
    const veces = bloque.reduce((acc, r) => acc + (r.numeros.includes(numero) ? 1 : 0), 0);
    bloques.push(veces);
  }
  return bloques;
}

/**
 * Tendencia diaria: apariciones de `numero` día por día (los últimos
 * `dias` días calendario). Es la granularidad más fina — complementa
 * a tendenciaSemanal y tendenciaMensual, que agrupan en bloques
 * más grandes.
 */
export function tendenciaDiaria(resultados, numero, dias = 14) {
  const hoy = new Date();
  const bloques = [];
  for (let i = dias - 1; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    const iso = fecha.toISOString().slice(0, 10);
    const veces = resultados.filter((r) => r.fecha === iso && r.numeros.includes(numero)).length;
    bloques.push(veces);
  }
  return bloques;
}

/**
 * Tendencia semanal: agrupa el histórico en semanas reales (7 días
 * calendario cada una) y cuenta apariciones de `numero` en cada semana,
 * de la más antigua a la más reciente. Útil para ver si un número
 * "se está calentando" o "enfriando" semana a semana.
 */
export function tendenciaSemanal(resultados, numero, semanas = 6) {
  const hoy = new Date();
  const bloques = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const fin = new Date(hoy);
    fin.setDate(hoy.getDate() - i * 7);
    const inicio = new Date(fin);
    inicio.setDate(fin.getDate() - 6);
    const finISO = fin.toISOString().slice(0, 10);
    const inicioISO = inicio.toISOString().slice(0, 10);
    const veces = resultados.filter(
      (r) => r.fecha >= inicioISO && r.fecha <= finISO && r.numeros.includes(numero)
    ).length;
    bloques.push(veces);
  }
  return bloques;
}

/**
 * Tendencia mensual: igual que la semanal, pero agrupando por mes
 * calendario en vez de por semana.
 */
export function tendenciaMensual(resultados, numero, meses = 6) {
  const hoy = new Date();
  const bloques = [];
  for (let i = meses - 1; i >= 0; i--) {
    const mesRef = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const anio = mesRef.getFullYear();
    const mes = mesRef.getMonth();
    const veces = resultados.filter((r) => {
      const [ra, rm] = r.fecha.split("-").map(Number);
      return ra === anio && rm - 1 === mes && r.numeros.includes(numero);
    }).length;
    bloques.push(veces);
  }
  return bloques;
}

/**
 * Palés más frecuentes: para loterías con más de un número por sorteo
 * (Palé, Tripleta), cuenta cuántas veces salió cada pareja de números
 * juntos en el mismo sorteo. Descriptivo del histórico, no una
 * predicción de qué pareja saldrá después.
 */
export function calcularPalesFrecuentes(resultados, maxResultados = 15) {
  const conteo = {};
  resultados.forEach((r) => {
    if (!Array.isArray(r.numeros) || r.numeros.length < 2) return;
    for (let i = 0; i < r.numeros.length; i++) {
      for (let j = i + 1; j < r.numeros.length; j++) {
        const par = [r.numeros[i], r.numeros[j]].sort().join("-");
        conteo[par] = (conteo[par] || 0) + 1;
      }
    }
  });
  return Object.entries(conteo)
    .map(([par, veces]) => ({ par, veces }))
    .sort((a, b) => b.veces - a.veces)
    .slice(0, maxResultados);
}

/**
 * Evolución histórica de un número: combina las tres granularidades
 * (diaria, semanal, mensual) en un solo objeto, para pantallas que
 * quieran mostrarlas juntas sin llamar a 3 funciones por separado.
 */
export function evolucionHistorica(resultados, numero) {
  const ordenadosDesc = [...resultados].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  return {
    numero,
    diaria: tendenciaDiaria(resultados, numero, 14),
    semanal: tendenciaSemanal(resultados, numero, 8),
    mensual: tendenciaMensual(resultados, numero, 6),
    totalHistorico: ordenadosDesc.filter((r) => r.numeros.includes(numero)).length,
  };
}

/**
 * Tríos más frecuentes: igual que los palés, pero para grupos de tres
 * números que salieron juntos en el mismo sorteo (tripletas). También
 * descriptivo del histórico — no una predicción.
 */
export function calcularTriosFrecuentes(resultados, maxResultados = 15) {
  const conteo = {};
  resultados.forEach((r) => {
    if (!Array.isArray(r.numeros) || r.numeros.length < 3) return;
    for (let i = 0; i < r.numeros.length; i++) {
      for (let j = i + 1; j < r.numeros.length; j++) {
        for (let k = j + 1; k < r.numeros.length; k++) {
          const trio = [r.numeros[i], r.numeros[j], r.numeros[k]].sort().join("-");
          conteo[trio] = (conteo[trio] || 0) + 1;
        }
      }
    }
  });
  return Object.entries(conteo)
    .map(([trio, veces]) => ({ trio, veces }))
    .sort((a, b) => b.veces - a.veces)
    .slice(0, maxResultados);
}
