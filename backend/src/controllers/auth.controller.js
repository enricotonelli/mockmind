const prisma = require('../config/prisma');
const { hashearPassword, compararPassword, firmarToken } = require('../services/auth.service');
const { ErrorApi, asincrono } = require('../middleware/manejoErrores');

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nunca se devuelve el hash de la contraseña al frontend.
function sinPassword(usuario) {
  const { password, ...resto } = usuario;
  return resto;
}

const registro = asincrono(async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || nombre.trim().length < 2) {
    throw new ErrorApi(400, 'Ingresá tu nombre.');
  }
  if (!email || !EMAIL_VALIDO.test(email)) {
    throw new ErrorApi(400, 'El email no tiene un formato válido.');
  }
  if (!password || password.length < 6) {
    throw new ErrorApi(400, 'La contraseña debe tener al menos 6 caracteres.');
  }

  const emailNormalizado = email.trim().toLowerCase();
  const existente = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });
  if (existente) {
    throw new ErrorApi(409, 'Ya existe una cuenta con ese email.');
  }

  const usuario = await prisma.usuario.create({
    data: {
      nombre: nombre.trim(),
      email: emailNormalizado,
      password: await hashearPassword(password),
    },
  });

  res.status(201).json({
    token: firmarToken(usuario.id),
    usuario: sinPassword(usuario),
  });
});

const login = asincrono(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !EMAIL_VALIDO.test(email)) {
    throw new ErrorApi(400, 'El email no tiene un formato válido.');
  }
  if (!password) {
    throw new ErrorApi(400, 'Ingresá tu contraseña.');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  // El mismo mensaje para "no existe" y "contraseña incorrecta": no hay que
  // darle a un atacante pistas sobre qué emails están registrados.
  if (!usuario || !(await compararPassword(password, usuario.password))) {
    throw new ErrorApi(401, 'Email o contraseña incorrectos.');
  }

  res.json({
    token: firmarToken(usuario.id),
    usuario: sinPassword(usuario),
  });
});

const perfil = asincrono(async (req, res) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId } });
  if (!usuario) throw new ErrorApi(404, 'Usuario no encontrado.');
  res.json(sinPassword(usuario));
});

module.exports = { registro, login, perfil };
