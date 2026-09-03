// Cliente real de sesiones de entrevista: mismo contrato que
// api/mock/sesiones.js. Cada función acá dispara una llamada HTTP; si el
// backend no responde, api/index.js se encarga de caer al mock, no este
// archivo.

import apiClient from '../client';

export async function crearSesion({ puestoAplicado, tipoEntrevista, cantidadPreguntas }) {
  const { data } = await apiClient.post('/sesiones/crear', {
    puesto: puestoAplicado,
    tipoEntrevista,
    cantidadPreguntas,
  });
  return data.sesion;
}

export async function obtenerSesion(sesionId) {
  const { data } = await apiClient.get(`/sesiones/${sesionId}/detalles`);
  return { sesion: data.sesion, mensajes: data.mensajes };
}

export async function responder({ sesionId, respuesta }) {
  const { data } = await apiClient.post(`/sesiones/${sesionId}/turno`, { respuesta });
  return {
    mensaje: data.mensaje,
    esRepregunta: data.esRepregunta,
    finalizada: data.finalizada,
    progreso: data.progreso,
  };
}

export async function generarApertura(sesionId) {
  const { data } = await apiClient.post(`/sesiones/${sesionId}/apertura`);
  return data;
}

export async function finalizarSesion(sesionId) {
  const { data } = await apiClient.post(`/sesiones/${sesionId}/reporte`);
  return data.reporte;
}

export async function obtenerReporte(sesionId) {
  const { data } = await apiClient.get(`/sesiones/${sesionId}/reporte`);
  return data.reporte;
}

export async function listarSesiones() {
  const { data } = await apiClient.get('/sesiones');
  return data.sesiones;
}

export async function listarEnCurso() {
  const { data } = await apiClient.get('/sesiones');
  // Filtrar sesiones no finalizadas en el cliente
  return (data.sesiones || []).filter((s) => !s.finalizada);
}

export async function eliminarSesion(sesionId) {
  await apiClient.delete(`/sesiones/${sesionId}`);
}

export async function obtenerResumen() {
  const { data } = await apiClient.get('/sesiones');
  const sesiones = data.sesiones || [];

  const finalizadas = sesiones.filter((s) => s.finalizada);
  const promedioPuntaje = finalizadas.length > 0
    ? finalizadas.reduce((sum, s) => sum + (s.puntajeGeneral || 0), 0) / finalizadas.length
    : 0;

  return {
    totalSesiones: sesiones.length,
    sesionesFinalizadas: finalizadas.length,
    promedioPuntaje: Math.round(promedioPuntaje),
  };
}
