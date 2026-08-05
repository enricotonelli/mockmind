// Cliente real de autenticación: mismo contrato que api/mock/autenticacion.js
// (mismos nombres de función, mismos parámetros, mismo valor de retorno),
// para que api/index.js pueda intercambiarlos sin que ninguna pantalla se
// entere de cuál está usando.

import apiClient from '../client';
import { guardarSesion, leerSesion, borrarSesion } from './sesionLocal';

export async function registrar({ nombre, email, password }) {
  const { data } = await apiClient.post('/auth/registro', { nombre, email, password });
  guardarSesion(data);
  return data.usuario;
}

export async function iniciarSesion({ email, password }) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  guardarSesion(data);
  return data.usuario;
}

export async function obtenerPerfil() {
  const { data } = await apiClient.get('/auth/perfil');
  return data;
}

// Sincrónico a propósito (igual que la versión mock): se usa para restaurar
// la sesión apenas abre la app, antes de que haya tiempo de esperar una
// respuesta de red.
export function usuarioGuardado() {
  return leerSesion()?.usuario ?? null;
}

// El login es un JWT sin estado en el servidor: no hace falta avisarle al
// backend para "cerrar sesión", alcanza con borrar el token guardado acá.
export async function cerrarSesion() {
  borrarSesion();
}

// No aplica a una cuenta real: solo tiene sentido en modo demostración
// (ver api/index.js, que no expone esta función cuando se usa el backend
// real).
