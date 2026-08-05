// Gestión simulada de sesiones de entrevista: creación, conversación,
// finalización con reporte, e historial.

import { leerDatos, guardarDatos, proximoId, demorar } from './almacenamiento';
import {
  primeraPregunta,
  siguienteTurno,
  generarReporte,
  preguntasDe,
  CANTIDAD_PREGUNTAS,
} from './entrevistador';

function agregarMensaje(datos, sesionId, rol, contenido, esRepregunta = false) {
  const mensaje = {
    id: datos.mensajes.length + 1,
    sesionId,
    rol, // 'usuario' | 'entrevistador'
    contenido,
    esRepregunta,
    timestamp: new Date().toISOString(),
  };
  datos.mensajes.push(mensaje);
  return mensaje;
}

// Crea la sesión y devuelve la primera pregunta del entrevistador.
export async function crearSesion({ puestoAplicado, tipoEntrevista }) {
  await demorar();

  if (!puestoAplicado || puestoAplicado.trim().length < 20) {
    throw new Error('Describí el puesto con un poco más de detalle (al menos 20 caracteres).');
  }

  const datos = leerDatos();
  if (!datos.usuario) throw new Error('No hay una sesión activa.');

  const id = proximoId();
  const sesion = {
    id,
    usuarioId: datos.usuario.id,
    puestoAplicado: puestoAplicado.trim(),
    tipoEntrevista,
    fecha: new Date().toISOString(),
    duracion: null,
    puntajeGeneral: null,
    finalizada: false,
    // Estado interno del motor, no existe en la tabla real:
    indicePregunta: 0,
    repreguntasSeguidas: 0,
    cantidadRepreguntas: 0,
    inicio: Date.now(),
  };

  const actualizados = leerDatos();
  actualizados.sesiones.push(sesion);

  const apertura = primeraPregunta(tipoEntrevista, puestoAplicado);
  agregarMensaje(actualizados, id, 'entrevistador', apertura.texto);

  guardarDatos(actualizados);
  return sesion;
}

export async function obtenerSesion(sesionId) {
  await demorar(250);
  const datos = leerDatos();
  const sesion = datos.sesiones.find((s) => s.id === Number(sesionId));
  if (!sesion) throw new Error('No se encontró la sesión.');
  const mensajes = datos.mensajes.filter((m) => m.sesionId === Number(sesionId));
  return { sesion, mensajes };
}

// Registra la respuesta del usuario y devuelve el turno del entrevistador.
export async function responder({ sesionId, respuesta }) {
  const datos = leerDatos();
  const sesion = datos.sesiones.find((s) => s.id === Number(sesionId));
  if (!sesion) throw new Error('No se encontró la sesión.');
  if (sesion.finalizada) throw new Error('Esta entrevista ya finalizó.');

  agregarMensaje(datos, sesion.id, 'usuario', respuesta.trim());

  // El tiempo de "pensar" del entrevistador depende del largo de la respuesta,
  // para que la conversación se sienta natural.
  const espera = 700 + Math.min(respuesta.length * 8, 1400);
  await demorar(espera);

  const turno = siguienteTurno({
    tipo: sesion.tipoEntrevista,
    puesto: sesion.puestoAplicado,
    respuesta,
    estado: {
      indicePregunta: sesion.indicePregunta,
      repreguntasSeguidas: sesion.repreguntasSeguidas,
    },
  });

  sesion.indicePregunta = turno.indicePregunta;
  sesion.repreguntasSeguidas = turno.repreguntasSeguidas;
  if (turno.esRepregunta) {
    sesion.cantidadRepreguntas += 1;
  }

  const mensaje = agregarMensaje(
    datos,
    sesion.id,
    'entrevistador',
    turno.texto,
    turno.esRepregunta
  );

  guardarDatos(datos);

  return {
    mensaje,
    esRepregunta: turno.esRepregunta,
    finalizada: turno.finalizada,
    progreso: {
      actual: turno.indicePregunta + 1,
      total: Math.min(CANTIDAD_PREGUNTAS, preguntasDe(sesion.tipoEntrevista, sesion.puestoAplicado).length),
    },
  };
}

// Cierra la entrevista y genera el reporte de feedback.
export async function finalizarSesion(sesionId) {
  await demorar(1200);

  const datos = leerDatos();
  const sesion = datos.sesiones.find((s) => s.id === Number(sesionId));
  if (!sesion) throw new Error('No se encontró la sesión.');

  const yaExiste = datos.reportes.find((r) => r.sesionId === sesion.id);
  if (yaExiste) return yaExiste;

  const respuestas = datos.mensajes
    .filter((m) => m.sesionId === sesion.id && m.rol === 'usuario')
    .map((m) => m.contenido);

  if (!respuestas.length) {
    throw new Error('No hay respuestas para analizar en esta entrevista.');
  }

  const resultado = generarReporte({
    tipo: sesion.tipoEntrevista,
    puesto: sesion.puestoAplicado,
    respuestas,
    cantidadRepreguntas: sesion.cantidadRepreguntas || 0,
  });

  const reporte = {
    id: proximoId(),
    sesionId: sesion.id,
    ...resultado,
  };

  const finales = leerDatos();
  const sesionFinal = finales.sesiones.find((s) => s.id === sesion.id);
  sesionFinal.finalizada = true;
  sesionFinal.puntajeGeneral = resultado.puntajeGeneral;
  sesionFinal.duracion = Math.round((Date.now() - (sesion.inicio || Date.now())) / 1000);
  finales.reportes.push(reporte);
  guardarDatos(finales);

  return reporte;
}

export async function obtenerReporte(sesionId) {
  await demorar(300);
  const datos = leerDatos();
  const reporte = datos.reportes.find((r) => r.sesionId === Number(sesionId));
  if (!reporte) throw new Error('Esta entrevista todavía no tiene reporte.');
  const sesion = datos.sesiones.find((s) => s.id === Number(sesionId));
  return { reporte, sesion };
}

// Historial ordenado de la más reciente a la más antigua.
export async function listarSesiones() {
  await demorar(350);
  const datos = leerDatos();
  return [...datos.sesiones]
    .filter((s) => s.finalizada)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// Métricas para el panel principal.
export async function obtenerResumen() {
  await demorar(300);
  const datos = leerDatos();
  const finalizadas = datos.sesiones.filter((s) => s.finalizada);

  if (!finalizadas.length) {
    return { cantidadSesiones: 0, puntajePromedio: null, mejorDimension: null, evolucion: null };
  }

  const puntajePromedio = Math.round(
    finalizadas.reduce((suma, s) => suma + (s.puntajeGeneral || 0), 0) / finalizadas.length
  );

  // Se busca la dimensión con mejor promedio entre todos los reportes.
  const dimensiones = {
    'Claridad expositiva': 'puntajeClaridad',
    'Método STAR': 'puntajeStar',
    'Ejemplos concretos': 'puntajeEjemplos',
    'Coherencia': 'puntajeCoherencia',
  };

  let mejorDimension = null;
  let mejorValor = -1;
  Object.entries(dimensiones).forEach(([nombre, campo]) => {
    const valores = datos.reportes.map((r) => r[campo]).filter((v) => typeof v === 'number');
    if (!valores.length) return;
    const prom = valores.reduce((s, v) => s + v, 0) / valores.length;
    if (prom > mejorValor) {
      mejorValor = prom;
      mejorDimension = { nombre, puntaje: Math.round(prom) };
    }
  });

  // Diferencia entre la primera y la última sesión: muestra la evolución.
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
    ultimas: [...finalizadas]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 3),
  };
}
