// Autenticación simulada. En modo demostración no hay contraseñas reales ni
// tokens: se valida el formato y se guarda el usuario en localStorage.

import { leerDatos, guardarDatos, demorar, borrarTodo } from './almacenamiento';
import { sesionesDeEjemplo } from './datosSemilla';

function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Crea el usuario y siembra el historial de ejemplo.
export async function registrar({ nombre, email, password }) {
  await demorar();

  if (!nombre || nombre.trim().length < 2) {
    throw new Error('Ingresá tu nombre.');
  }
  if (!esEmailValido(email)) {
    throw new Error('El email no tiene un formato válido.');
  }
  if (!password || password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  const usuario = {
    id: 1,
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    fechaRegistro: new Date().toISOString(),
  };

  const semilla = sesionesDeEjemplo(usuario.id);

  guardarDatos({
    usuario,
    sesiones: semilla.sesiones,
    mensajes: [],
    reportes: semilla.reportes,
    ultimoId: semilla.ultimoId,
  });

  return usuario;
}

export async function iniciarSesion({ email, password }) {
  await demorar();

  if (!esEmailValido(email)) {
    throw new Error('El email no tiene un formato válido.');
  }
  if (!password || password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  const datos = leerDatos();

  // Si ya existe un usuario guardado, se reutiliza junto con su historial.
  if (datos.usuario) {
    return datos.usuario;
  }

  // Primer ingreso sin registro previo: se crea un usuario a partir del email
  // para que se pueda probar la app sin pasar por el registro.
  const nombre = email.split('@')[0].replace(/[._-]/g, ' ');
  return registrar({
    nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
    email,
    password,
  });
}

export async function obtenerPerfil() {
  await demorar(200);
  const { usuario } = leerDatos();
  if (!usuario) throw new Error('No hay una sesión activa.');
  return usuario;
}

export function usuarioGuardado() {
  return leerDatos().usuario;
}

export async function cerrarSesion() {
  await demorar(150);
  // Se conserva el historial: al volver a entrar, los datos siguen ahí.
  const datos = leerDatos();
  guardarDatos({ ...datos, usuario: null });
}

export async function reiniciarDemostracion() {
  await demorar(200);
  borrarTodo();
}
