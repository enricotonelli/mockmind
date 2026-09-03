import axios from 'axios';
import { leerSesion, borrarSesion } from './real/sesionLocal';
import { leerDatos as leerDatosMock, guardarDatos as guardarDatosMock } from './mock/almacenamiento';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  // Generoso a propósito: los turnos de la entrevista llaman a Claude del
  // otro lado y pueden tardar varios segundos. Lo que dispara el respaldo a
  // datos simulados es que el backend esté caído (error de conexión), no
  // que tarde — ver api/index.js.
  timeout: 25000,
});

// Adjunta el token guardado a cada pedido, si hay uno.
apiClient.interceptors.request.use((config) => {
  const sesion = leerSesion();
  if (sesion?.token) {
    config.headers.Authorization = `Bearer ${sesion.token}`;
  }
  return config;
});

// Si el backend real dice 401 en una ruta protegida (no en login/registro,
// donde un 401 solo significa "contraseña incorrecta"), la sesión actual no
// sirve. Pasa sobre todo cuando queda un usuario de modo demostración viejo
// dando vueltas en el navegador: parece "logueado" pero no tiene token real,
// así que cualquier pantalla que pida datos reales explota. Se limpian las
// dos sesiones posibles (real y mock) y se manda a /login derecho, en vez de
// dejar a la pantalla intentar renderizar con datos que nunca van a llegar.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const esRutaPublica = url.includes('/auth/login') || url.includes('/auth/registro');

    if (error.response?.status === 401 && !esRutaPublica) {
      borrarSesion();
      // Limpieza directa y sincrónica: la función "cerrarSesion" del mock
      // tiene un demorar() artificial (para que se sienta como una llamada
      // de red en la demo), y acá no podemos esperarlo — si no terminaba
      // antes del redirect de abajo, el usuario mock nunca se borraba de
      // verdad y esto entraba en loop infinito de recarga.
      guardarDatosMock({ ...leerDatosMock(), usuario: null });

      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
