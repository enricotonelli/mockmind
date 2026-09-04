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
  return { reporte: data.reporte, sesion: data.sesion };
}

// Nombres de las dimensiones tal como los muestra la UI, mapeados al campo
// que guarda cada puntaje en el reporte. Mismo mapeo que api/mock/sesiones.js.
const DIMENSIONES = {
  'Claridad expositiva': 'puntajeClaridad',
  'Método STAR': 'puntajeStar',
  'Ejemplos concretos': 'puntajeEjemplos',
  'Coherencia': 'puntajeCoherencia',
};

export async function listarSesiones() {
  const { data } = await apiClient.get('/sesiones');
  return (data.sesiones || []).filter((s) => s.finalizada);
}

export async function listarEnCurso() {
  const { data } = await apiClient.get('/sesiones');
  return (data.sesiones || [])
    .filter((s) => !s.finalizada)
    .map((sesion) => ({ ...sesion, respondidas: sesion._count?.mensajes ?? 0 }));
}

export async function eliminarSesion(sesionId) {
  await apiClient.delete(`/sesiones/${sesionId}`);
}

export async function obtenerResumen() {
  const { data } = await apiClient.get('/sesiones');
  const finalizadas = (data.sesiones || []).filter((s) => s.finalizada);

  if (!finalizadas.length) {
    return { cantidadSesiones: 0, puntajePromedio: null, mejorDimension: null, evolucion: null };
  }

  const puntajePromedio = Math.round(
    finalizadas.reduce((suma, s) => suma + (s.puntajeGeneral || 0), 0) / finalizadas.length
  );

  let mejorDimension = null;
  let mejorValor = -1;
  Object.entries(DIMENSIONES).forEach(([nombre, campo]) => {
    const valores = finalizadas
      .map((s) => s.reporteEntrevista?.[campo])
      .filter((v) => typeof v === 'number');
    if (!valores.length) return;
    const prom = valores.reduce((s, v) => s + v, 0) / valores.length;
    if (prom > mejorValor) {
      mejorValor = prom;
      mejorDimension = { nombre, puntaje: Math.round(prom) };
    }
  });

  const ordenadas = [...finalizadas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const evolucion =
    ordenadas.length >= 2
      ? ordenadas[ordenadas.length - 1].puntajeGeneral - ordenadas[0].puntajeGeneral
      : null;

  return {
    cantidadSesiones: finalizadas.length,
    puntajePromedio,
    mejorDimension,
    evolucion,
    ultimas: [...finalizadas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 3),
  };
}
