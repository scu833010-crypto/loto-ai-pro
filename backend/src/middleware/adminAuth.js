// ============================================================
// AUTENTICACIÓN DE RUTAS SENSIBLES — protege /api/sync y /api/debug,
// que antes eran completamente públicas (cualquiera podía disparar el
// pipeline manualmente o ver el HTML/JSON crudo de depuración).
//
// Modelo simple de clave compartida (API key), no usuarios/roles —
// suficiente para un backend de un solo operador (vos). Si más
// adelante se necesitan varios administradores con permisos
// distintos, esto se reemplaza por un sistema de cuentas real; por
// ahora sería sobre-ingeniería para el tamaño de este proyecto.
//
// Configuración:
//  - Variable de entorno ADMIN_API_KEY en Render (Settings > Environment).
//  - Cada request a una ruta protegida debe incluir el header:
//      x-admin-key: <el mismo valor de ADMIN_API_KEY>
//
// En desarrollo local (NODE_ENV !== "production") se deja pasar sin
// exigir la clave, para no trabar el trabajo diario — pero se avisa
// por consola para que no se te olvide que en producción sí se exige.
// ============================================================

function requiereAdminKey(req, res, next) {
  const esProduccion = process.env.NODE_ENV === "production";
  const claveConfigurada = process.env.ADMIN_API_KEY;

  if (!esProduccion) {
    if (!claveConfigurada) {
      console.warn(`[seguridad] ADMIN_API_KEY no configurada — en producción esta ruta quedaría bloqueada (correcto). En desarrollo se permite el paso.`);
    }
    return next();
  }

  if (!claveConfigurada) {
    // Fail-closed: si en producción no se configuró la clave, se
    // bloquea todo en vez de dejar la ruta abierta por accidente.
    return res.status(503).json({
      error: "Ruta administrativa deshabilitada: falta configurar ADMIN_API_KEY en el servidor.",
    });
  }

  const claveRecibida = req.get("x-admin-key");
  if (claveRecibida !== claveConfigurada) {
    return res.status(401).json({ error: "No autorizado. Falta o es incorrecto el header x-admin-key." });
  }

  next();
}

module.exports = { requiereAdminKey };
