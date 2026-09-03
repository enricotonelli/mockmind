import bcrypt from 'bcrypt';
import prisma from './prisma';
import { crearToken } from './auth';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import {
  promptApertura,
  promptTurno,
  MAXIMO_REPREGUNTAS_SEGUIDAS,
  esquemaApertura,
  esquemaDecidirTurno,
} from '../prompts/entrevistador';
import { promptReporte, esquemaReporte } from '../prompts/reporte';

const MODELO_ENTREVISTA = process.env.GOOGLE_GENERATIVE_AI_MODEL || 'gemini-1.5-flash';
const modeloEntrevistadorAI = google(MODELO_ENTREVISTA);

// ===== AUTENTICACIÓN =====

export async function registroUsuario(email, password, nombre) {
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    throw new Error('El email ya está registrado');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.create({
    data: { email, passwordHash, nombre },
  });

  const token = crearToken({ id: usuario.id, email: usuario.email });

  return {
    usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    token,
  };
}

export async function loginUsuario(email, password) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    throw new Error('Email o contraseña incorrectos');
  }

  const esValido = await bcrypt.compare(password, usuario.passwordHash);
  if (!esValido) {
    throw new Error('Email o contraseña incorrectos');
  }

  const token = crearToken({ id: usuario.id, email: usuario.email });

  return {
    usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    token,
  };
}

// ===== ENTREVISTA =====

export async function generarApertura({ tipo, puesto, cantidadPreguntas }) {
  const resultado = await generateObject({
    model: modeloEntrevistadorAI,
    system: promptApertura({ tipo, puesto, cantidadPreguntas }),
    prompt: 'Empezá la entrevista.',
    schema: esquemaApertura,
  });

  return { texto: resultado.mensaje };
}

export async function decidirTurno({
  tipo,
  puesto,
  cantidadPreguntas,
  indicePregunta,
  repreguntasSeguidas,
  mensajesPrevios,
  respuesta,
}) {
  const esUltimaPregunta = indicePregunta + 1 >= cantidadPreguntas;
  const puedeRepreguntar = repreguntasSeguidas < MAXIMO_REPREGUNTAS_SEGUIDAS;

  const historial = mensajesPrevios
    .map((m) => `${m.rol === 'usuario' ? 'Candidato' : 'Entrevistador'}: ${m.contenido}`)
    .join('\n\n');

  const prompt = `${historial}\n\nCandidato: ${respuesta}`;

  const resultado = await generateObject({
    model: modeloEntrevistadorAI,
    system: promptTurno({
      tipo,
      puesto,
      cantidadPreguntas,
      indicePregunta,
      repreguntasSeguidas,
      esUltimaPregunta,
    }),
    prompt,
    schema: esquemaDecidirTurno(puedeRepreguntar),
  });

  const { accion, mensaje } = resultado;
  const esRepregunta = accion === 'repregunta';

  if (esRepregunta) {
    return {
      texto: mensaje,
      esRepregunta: true,
      finalizada: false,
      indicePregunta,
      repreguntasSeguidas: repreguntasSeguidas + 1,
    };
  }

  if (esUltimaPregunta) {
    return {
      texto: mensaje,
      esRepregunta: false,
      finalizada: true,
      indicePregunta,
      repreguntasSeguidas: 0,
    };
  }

  return {
    texto: mensaje,
    esRepregunta: false,
    finalizada: false,
    indicePregunta: indicePregunta + 1,
    repreguntasSeguidas: 0,
  };
}

export async function generarReporte({ tipo, puesto, cantidadRepreguntas, mensajes }) {
  const historial = mensajes
    .map((m) => `${m.rol === 'usuario' ? 'Candidato' : 'Entrevistador'}: ${m.contenido}`)
    .join('\n\n');

  const resultado = await generateObject({
    model: modeloEntrevistadorAI,
    system: promptReporte({ tipo, puesto, cantidadRepreguntas }),
    prompt: historial,
    schema: esquemaReporte,
  });

  const datos = resultado;
  const acotar = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

  return {
    puntajeClaridad: acotar(datos.puntajeClaridad),
    puntajeStar: acotar(datos.puntajeStar),
    puntajeEjemplos: acotar(datos.puntajeEjemplos),
    puntajeCoherencia: acotar(datos.puntajeCoherencia),
    feedbackTexto: String(datos.feedbackTexto || '').trim(),
    sugerencias: Array.isArray(datos.sugerencias) ? datos.sugerencias : [],
  };
}

function calcularPuntajeGeneral(dimensiones) {
  const valor =
    dimensiones.puntajeClaridad * 0.3 +
    dimensiones.puntajeStar * 0.25 +
    dimensiones.puntajeEjemplos * 0.25 +
    dimensiones.puntajeCoherencia * 0.2;
  return Math.max(0, Math.min(100, Math.round(valor)));
}

export { calcularPuntajeGeneral };

// ===== VOZ (Web Speech API — gratis, corre en el navegador) =====

// Nota: STT y TTS usan Web Speech API del navegador (100% gratis)
// No requieren backend, se ejecutan en el cliente
// Ver: src/components/PanelRespuestaConVoz.jsx

export async function transcribirAudio(audioBuffer) {
  // STT se maneja en el cliente con Web Speech API
  // Este es un placeholder por si se necesita en el futuro
  throw new Error('STT debe usarse con Web Speech API en el cliente, no en el servidor');
}

export async function generarAudioDesdeTexto(texto) {
  // TTS se maneja en el cliente con Web Speech API
  // Este es un placeholder por si se necesita en el futuro
  throw new Error('TTS debe usarse con Web Speech API en el cliente, no en el servidor');
}
