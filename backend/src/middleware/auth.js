// Protege rutas exigiendo un JWT válido, y deja el id del usuario en
// req.usuarioId para que los controladores no tengan que decodificar nada.

const { verificarToken } = require('../services/auth.service');
const { ErrorApi } = require('./manejoErrores');

function requiereAuth(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const [tipo, token] = encabezado.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new ErrorApi(401, 'No autenticado.'));
  }

  try {
    const payload = verificarToken(token);
    req.usuarioId = payload.usuarioId;
    next();
  } catch {
    next(new ErrorApi(401, 'Sesión inválida o vencida.'));
  }
}

module.exports = { requiereAuth };
