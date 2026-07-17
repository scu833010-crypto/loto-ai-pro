const express = require("express");
const { LOTERIAS } = require("../config/loterias");
const { obtenerResultadosRecientes } = require("../db/resultadosRepo");

function crearRouterV1({ coreIa }) {
  const router = express.Router();
  const limiteSeguro = (valor, defecto = 100, maximo = 500) => {
    const limite = Number(valor || defecto);
    if (!Number.isInteger(limite) || limite < 1 || limite > maximo) throw new Error(`limite debe estar entre 1 y ${maximo}.`);
    return limite;
  };
  const loteriaValida = (id) => LOTERIAS.some((l) => l.id === id);

  router.get("/loterias", (req, res) => res.json({ datos: LOTERIAS.map(({ id, nombre }) => ({ id, nombre })) }));
  router.get("/resultados", (req, res, next) => {
    try {
      const resultados = obtenerResultadosRecientes({ rango: req.query.rango || "hoy", fecha: req.query.fecha || null, loteriaId: req.query.loteriaId || null });
      res.json({ datos: resultados.slice(0, limiteSeguro(req.query.limite)), meta: { fuente: "backend", total: resultados.length } });
    } catch (error) { next(error); }
  });
  router.get("/historico", (req, res, next) => {
    try {
      if (!loteriaValida(req.query.loteriaId)) return res.status(400).json({ error: "loteriaId valido es obligatorio." });
      const pagina = Math.max(Number(req.query.pagina || 1), 1);
      const limite = limiteSeguro(req.query.limite, 100);
      const todo = obtenerResultadosRecientes({ rango: "todo", loteriaId: req.query.loteriaId });
      const inicio = (pagina - 1) * limite;
      return res.json({ datos: todo.slice(inicio, inicio + limite), meta: { pagina, limite, total: todo.length } });
    } catch (error) { return next(error); }
  });
  router.get("/core-ia/estado", (req, res) => res.json({ datos: coreIa.estado() }));
  router.get(["/analitica", "/evaluaciones", "/tendencias", "/rankings", "/simulaciones"], async (req, res, next) => {
    try {
      if (!loteriaValida(req.query.loteriaId)) return res.status(400).json({ error: "loteriaId valido es obligatorio." });
      const respuesta = await coreIa.analizar(req.query.loteriaId, { limite: req.query.limite });
      const datos = respuesta.datos;
      const clave = req.path.slice(1);
      const seleccionado = clave === "analitica" ? datos : clave === "evaluaciones" ? datos.evaluacion : clave === "tendencias" ? datos.tendencias : clave === "rankings" ? datos.ranking : datos.simulacionHistorica;
      return res.json({ datos: seleccionado, aviso: respuesta.aviso });
    } catch (error) { return next(error); }
  });
  return router;
}

module.exports = { crearRouterV1 };
