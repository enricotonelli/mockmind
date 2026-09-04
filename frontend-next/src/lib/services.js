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

const MODELO_ENTREVISTA = process.env.GOOGLE_GENERATIVE_AI_MODEL || 'gemini-3.1-flash-lite';
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

  return { texto: resultado.object.mensaje };
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

  const { accion, mensaje } = resultado.object;
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

  const datos = resultado.object;
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

// ===== VOZ =====

// STT sigue en el cliente con Web Speech API (100% gratis, ver EntradaVoz.jsx).
export async function transcribirAudio(audioBuffer) {
  throw new Error('STT debe usarse con Web Speech API en el cliente, no en el servidor');
}

// TTS usa ElevenLabs (voz humana, no la sintética del navegador). Tiene un
// free tier de 10.000 caracteres/mes — si se agota o falla, el cliente
// (PanelRespuestaConVoz / entrevista/[id]/page.jsx) cae solo a la voz del
// navegador (Web Speech API) para no dejar la entrevista muda.
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

export async function generarAudioDesdeTexto(texto) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs no está configurado (falta ELEVENLABS_API_KEY)');
  }

  const respuesta = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: texto,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '');
    throw new Error(`ElevenLabs respondió ${respuesta.status}: ${detalle.slice(0, 200)}`);
  }

  const audioBuffer = await respuesta.arrayBuffer();
  return Buffer.from(audioBuffer);
}
