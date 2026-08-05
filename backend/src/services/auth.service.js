// Hasheo de contraseñas y firma/verificación de JWT. Separado del
// controlador para que la lógica de negocio no dependa de Express.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const RONDAS_SAL = 10;
const DURACION_TOKEN = '7d';

function hashearPassword(password) {
  return bcrypt.hash(password, RONDAS_SAL);
}

function compararPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function firmarToken(usuarioId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en las variables de entorno.');
  }
  return jwt.sign({ usuarioId }, process.env.JWT_SECRET, { expiresIn: DURACION_TOKEN });
}

function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { hashearPassword, compararPassword, firmarToken, verificarToken };
