// Errores explícitos de negocio (validación, "no encontrado", etc.), para
// distinguirlos de errores inesperados. El controlador los lanza y este
// middleware les pone el código de estado correcto en la respuesta.
class ErrorApi extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

// Evita repetir try/catch en cada controlador: envuelve una función async y
// manda cualquier error al middleware de errores en vez de colgar el request.
function asincrono(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Manejo global de errores: nunca deja que un error tire el servidor
// (CLAUDE.md §10 — las llamadas a Claude pueden fallar o tardar).
function manejoErrores(err, req, res, next) {
  if (err instanceof ErrorApi) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { ErrorApi, asincrono, manejoErrores };
