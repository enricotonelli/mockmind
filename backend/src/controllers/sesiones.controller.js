const prisma = require('../config/prisma');
const { ErrorApi, asincrono } = require('../middleware/manejoErrores');
const entrevistador = require('../services/entrevistador.service');
const { generarReporte, calcularPuntajeGeneral } = require('../services/reporte.service');

const TIPOS_VALIDOS = ['RRHH', 'Tecnica', 'Estres'];

// Reconstruye el estado del motor (qué pregunta va, cuántas repreguntas
// seguidas lleva la pregunta actual) a partir de los mensajes guardados, en
// vez de persistirlo aparte. `mensajes` tiene que venir ordenado por
// timestamp ascendente.
function calcularEstado(mensajes) {
  const preguntas = mensajes.filter((m) => m.rol === 'entrevistador');

  if (preguntas.length === 0) {
    return { indicePregunta: 0, repreguntasSeguidas: 0, cantidadRepreguntas: 0 };
  }

  const cantidadRepreguntas = preguntas.filter((m) => m.esRepregunta).length;
  const indicePregunta = preguntas.filter((m) => !m.esRepregunta).length - 1;

  let repreguntasSeguidas = 0;
  for (let i = preguntas.length - 1; i >= 0; i--) {
    if (!preguntas[i].esRepregunta) break;
    repreguntasSeguidas += 1;
  }

  return { indicePregunta, repreguntasSeguidas, cantidadRepreguntas };
}

// Trae una sesión verificando que sea del usuario logueado. 404 en vez de
// 403 si no es dueño, para no confirmarle a nadie que el id existe.
async function obtenerSesionPropia(id, usuarioId, incluirMensajes = false) {
  const sesion = await prisma.sesion.findUnique({
    where: { id: Number(id) },
    include: incluirMensajes ? { mensajes: { orderBy: { timestamp: 'asc' } } } : undefined,
  });

  if (!sesion || sesion.usuarioId !== usuarioId) {
    throw new ErrorApi(404, 'No se encontró la sesión.');
  }
  return sesion;
}

const crear = asincrono(async (req, res) => {
  const { puestoAplicado, tipoEntrevista, cantidadPreguntas } = req.body;

  if (!puestoAplicado || puestoAplicado.trim().length < 20) {
    throw new ErrorApi(400, 'Describí el puesto con un poco más de detalle (al menos 20 caracteres).');
  }
  if (!TIPOS_VALIDOS.includes(tipoEntrevista)) {
    throw new ErrorApi(400, 'El tipo de entrevista no es válido.');
  }

  const cantidad = Number.isInteger(cantidadPreguntas) && cantidadPreguntas > 0 ? cantidadPreguntas : 6;
  const puesto = puestoAplicado.trim();

  const sesion = await prisma.sesion.create({
    data: {
      usuarioId: req.usuarioId,
      puestoAplicado: puesto,
      tipoEntrevista,
      cantidadPreguntas: cantidad,
    },
  });

  const apertura = await entrevistador.generarApertura({
    tipo: tipoEntrevista,
    puesto,
    cantidadPreguntas: cantidad,
  });

  await prisma.mensaje.create({
    data: { sesionId: sesion.id, rol: 'entrevistador', contenido: apertura.texto },
  });

  res.status(201).json(sesion);
});

const obtener = asincrono(async (req, res) => {
  const sesion = await obtenerSesionPropia(req.params.id, req.usuarioId, true);
  const estado = calcularEstado(sesion.mensajes);

  res.json({
    sesion: { ...sesion, ...estado },
    mensajes: sesion.mensajes,
  });
});

const responder = asincrono(async (req, res) => {
  const { respuesta } = req.body;
  if (!respuesta || !respuesta.trim()) {
    throw new ErrorApi(400, 'La respuesta no puede estar vacía.');
  }

  const sesion = await obtenerSesionPropia(req.params.id, req.usuarioId, true);
  if (sesion.finalizada) {
    throw new ErrorApi(400, 'Esta entrevista ya finalizó.');
  }

  const respuestaLimpia = respuesta.trim();
  const estado = calcularEstado(sesion.mensajes);

  await prisma.mensaje.create({
    data: { sesionId: sesion.id, rol: 'usuario', contenido: respuestaLimpia },
  });

  const turno = await entrevistador.decidirTurno({
    tipo: sesion.tipoEntrevista,
    puesto: sesion.puestoAplicado,
    cantidadPreguntas: sesion.cantidadPreguntas,
    indicePregunta: estado.indicePregunta,
    repreguntasSeguidas: estado.repreguntasSeguidas,
    mensajesPrevios: sesion.mensajes,
    respuesta: respuestaLimpia,
  });

  const mensaje = await prisma.mensaje.create({
    data: {
      sesionId: sesion.id,
      rol: 'entrevistador',
      contenido: turno.texto,
      esRepregunta: turno.esRepregunta,
    },
  });

  res.json({
    mensaje,
    esRepregunta: turno.esRepregunta,
    finalizada: turno.finalizada,
    progreso: {
      actual: turno.indicePregunta + 1,
      total: sesion.cantidadPreguntas,
    },
  });
});

// Serializa un reporte de la DB al formato que espera el frontend: con
// puntajeGeneral calculado y sugerencias como array (en la DB se guardan
// como texto separado por saltos de línea, para mantener el schema simple).
function serializarReporte(reporte) {
  const dimensiones = {
    puntajeClaridad: reporte.puntajeClaridad,
    puntajeStar: reporte.puntajeStar,
    puntajeEjemplos: reporte.puntajeEjemplos,
    puntajeCoherencia: reporte.puntajeCoherencia,
  };

  return {
    ...reporte,
    puntajeGeneral: calcularPuntajeGeneral(dimensiones),
    sugerencias: reporte.sugerencias.split('\n').filter(Boolean),
  };
}

const finalizar = asincrono(async (req, res) => {
  const sesion = await obtenerSesionPropia(req.params.id, req.usuarioId, true);

  const yaExiste = await prisma.reporteEntrevista.findUnique({ where: { sesionId: sesion.id } });
  if (yaExiste) {
    return res.json(serializarReporte(yaExiste));
  }

  const respuestas = sesion.mensajes.filter((m) => m.rol === 'usuario');
  if (!respuestas.length) {
    throw new ErrorApi(400, 'No hay respuestas para analizar en esta entrevista.');
  }

  const cantidadRepreguntas = sesion.mensajes.filter((m) => m.esRepregunta).length;

  const resultado = await generarReporte({
    tipo: sesion.tipoEntrevista,
    puesto: sesion.puestoAplicado,
    cantidadRepreguntas,
    mensajes: sesion.mensajes,
  });

  const puntajeGeneral = calcularPuntajeGeneral(resultado);
  const duracion = Math.max(1, Math.round((Date.now() - sesion.fecha.getTime()) / 1000));

  const [reporte] = await prisma.$transaction([
    prisma.reporteEntrevista.create({
      data: {
        sesionId: sesion.id,
        puntajeClaridad: resultado.puntajeClaridad,
        puntajeStar: resultado.puntajeStar,
        puntajeEjemplos: resultado.puntajeEjemplos,
        puntajeCoherencia: resultado.puntajeCoherencia,
        cantidadRepreguntas,
        feedbackTexto: resultado.feedbackTexto,
        sugerencias: resultado.sugerencias.join('\n'),
      },
    }),
    prisma.sesion.update({
      where: { id: sesion.id },
      data: { finalizada: true, puntajeGeneral, duracion },
    }),
  ]);

  res.json(serializarReporte(reporte));
});

const obtenerReporte = asincrono(async (req, res) => {
  const sesion = await obtenerSesionPropia(req.params.id, req.usuarioId);
  const reporte = await prisma.reporteEntrevista.findUnique({ where: { sesionId: sesion.id } });

  if (!reporte) {
    throw new ErrorApi(404, 'Esta entrevista todavía no tiene reporte.');
  }

  res.json({ reporte: serializarReporte(reporte), sesion });
});

const listar = asincrono(async (req, res) => {
  const sesiones = await prisma.sesion.findMany({
    where: { usuarioId: req.usuarioId, finalizada: true },
    orderBy: { fecha: 'desc' },
  });
  res.json(sesiones);
});

const listarEnCurso = asincrono(async (req, res) => {
  const sesiones = await prisma.sesion.findMany({
    where: { usuarioId: req.usuarioId, finalizada: false },
    orderBy: { fecha: 'desc' },
    include: { _count: { select: { mensajes: { where: { rol: 'usuario' } } } } },
  });

  res.json(
    sesiones.map((s) => ({
      ...s,
      respondidas: s._count.mensajes,
      _count: undefined,
    }))
  );
});

const eliminar = asincrono(async (req, res) => {
  const sesion = await obtenerSesionPropia(req.params.id, req.usuarioId);
  // Los mensajes y el reporte se borran solos por el onDelete: Cascade del schema.
  await prisma.sesion.delete({ where: { id: sesion.id } });
  res.status(204).end();
});

const resumen = asincrono(async (req, res) => {
  const finalizadas = await prisma.sesion.findMany({
    where: { usuarioId: req.usuarioId, finalizada: true },
    orderBy: { fecha: 'asc' },
  });

  if (!finalizadas.length) {
    return res.json({ cantidadSesiones: 0, puntajePromedio: null, mejorDimension: null, evolucion: null });
  }

  const puntajePromedio = Math.round(
    finalizadas.reduce((suma, s) => suma + (s.puntajeGeneral || 0), 0) / finalizadas.length
  );

  const reportes = await prisma.reporteEntrevista.findMany({
    where: { sesion: { usuarioId: req.usuarioId } },
  });

  const dimensiones = {
    'Claridad expositiva': 'puntajeClaridad',
    'Método STAR': 'puntajeStar',
    'Ejemplos concretos': 'puntajeEjemplos',
    Coherencia: 'puntajeCoherencia',
  };

  let mejorDimension = null;
  let mejorValor = -1;
  for (const [nombre, campo] of Object.entries(dimensiones)) {
    if (!reportes.length) break;
    const promedio = reportes.reduce((s, r) => s + r[campo], 0) / reportes.length;
    if (promedio > mejorValor) {
      mejorValor = promedio;
      mejorDimension = { nombre, puntaje: Math.round(promedio) };
    }
  }

  const evolucion =
    finalizadas.length >= 2
      ? finalizadas[finalizadas.length - 1].puntajeGeneral - finalizadas[0].puntajeGeneral
      : null;

  res.json({
    cantidadSesiones: finalizadas.length,
    puntajePromedio,
    mejorDimension,
    evolucion,
    ultimas: [...finalizadas].reverse().slice(0, 3),
  });
});

module.exports = {
  crear,
  obtener,
  responder,
  finalizar,
  obtenerReporte,
  listar,
  listarEnCurso,
  eliminar,
  resumen,
};
