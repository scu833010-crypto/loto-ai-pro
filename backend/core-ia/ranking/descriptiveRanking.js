function crearRankingDescriptivo(frecuencias, limite = 10) {
  return frecuencias.slice(0, limite).map((item, indice) => ({
    posicion: indice + 1,
    numero: item.numero,
    veces: item.veces,
    explicacion: `Puesto ${indice + 1} por apariciones registradas en el historico analizado.`,
  }));
}

module.exports = { crearRankingDescriptivo };
