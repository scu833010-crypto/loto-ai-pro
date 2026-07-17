const fs = require("node:fs/promises");
const path = require("node:path");

/** Almacen append-only inyectable; el anfitrion puede reemplazarlo por PostgreSQL. */
function crearArchivoKnowledgeStore(rutaArchivo) {
  if (!rutaArchivo) throw new Error("Se requiere una ruta para la memoria persistente.");
  async function append(tipo, payload) {
    await fs.mkdir(path.dirname(rutaArchivo), { recursive: true });
    const entrada = { id: `${tipo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, tipo, creadoEn: new Date().toISOString(), payload };
    await fs.appendFile(rutaArchivo, `${JSON.stringify(entrada)}\n`, "utf8");
    return entrada;
  }
  async function list(tipo = null) {
    try {
      const contenido = await fs.readFile(rutaArchivo, "utf8");
      return contenido.split("\n").filter(Boolean).map(JSON.parse).filter((entrada) => !tipo || entrada.tipo === tipo);
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }
  return { append, list };
}

module.exports = { crearArchivoKnowledgeStore };
