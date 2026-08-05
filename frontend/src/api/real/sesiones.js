// Cliente real de sesiones de entrevista: mismo contrato que
// api/mock/sesiones.js. Cada función acá dispara una llamada HTTP; si el
// backend no responde, api/index.js se encarga de caer al mock, no este
// archivo.

import apiClient from '../client';

export async function crearSesion({ puestoAplicado, tipoEntrevista, cantidadPreguntas }) {
  const { data } = await apiClient.post('/sesiones', {
    puestoAplicado,
    tipoEntrevista,
    cantidadPreguntas,
  });
  return data;
}

export async function obtenerSesion(sesionId) {
  const { data } = await apiClient.get(`/sesiones/${sesionId}`);
  return data;
}

export async function responder({ sesionId, respuesta }) {
  const { data } = await apiClient.post(`/sesiones/${sesionId}/mensajes`, { respuesta });
  return data;
}

export async function finalizarSesion(sesionId) {
  const { data } = await apiClient.post(`/sesiones/${sesionId}/finalizar`);
  return data;
}

export async function obtenerReporte(sesionId) {
  const { data } = await apiClient.get(`/sesiones/${sesionId}/reporte`);
  return data;
}

export async function listarSesiones() {
  const { data } = await apiClient.get('/sesiones');
  return data;
}

export async function listarEnCurso() {
  const { data } = await apiClient.get('/sesiones/en-curso');
  return data;
}

export async function eliminarSesion(sesionId) {
  await apiClient.delete(`/sesiones/${sesionId}`);
}

export async function obtenerResumen() {
  const { data } = await apiClient.get('/sesiones/resumen');
  return data;
}
