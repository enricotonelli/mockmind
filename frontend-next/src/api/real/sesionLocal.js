// Guarda el token JWT y el usuario logueado del backend real. Va en una
// clave de localStorage separada de la del modo demostración
// ('mockmind_datos'), para que no se pisen entre sí si se alterna entre uno
// y otro mientras se prueba la app.

const CLAVE = 'mockmind_sesion_real';

export function guardarSesion({ token, usuario }) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ token, usuario }));
  } catch (error) {
    console.warn('No se pudo guardar la sesión.', error);
  }
}

export function leerSesion() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE);
}
