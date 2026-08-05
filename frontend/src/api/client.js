import axios from 'axios';
import { leerSesion } from './real/sesionLocal';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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

export default apiClient;
