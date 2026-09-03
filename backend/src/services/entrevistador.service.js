// Lógica del motor de entrevistas: le pide a Claude que abra la entrevista y
// que decida, turno a turno, si repreguntar o avanzar. El estado (qué
// pregunta va, cuántas repreguntas seguidas) lo calcula quien llama a este
// servicio a partir de los mensajes guardados (ver sesiones.controller.js) y
// se le pasa explícitamente a cada función: este archivo no guarda nada.

const { generateObject } = require('ai');
const { modeloEntrevistadorAI } = require('../config/anthropic');
const { ErrorApi } = require('../middleware/manejoErrores');
const {
  promptApertura,
  promptTurno,
  MAXIMO_REPREGUNTAS_SEGUIDAS,
  esquemaApertura,
  esquemaDecidirTurno,
} = require('../prompts/entrevistador');

// Función helper para llamar al LLM con generateObject
async function llamarClaude(prompt, schema, system) {
  try {
    const resultado = await generateObject({
      model: modeloEntrevistadorAI,
      system,
      prompt,
      schema,
    });
    return resultado.object;
  } catch (error) {
    console.error('Error llamando a Vercel AI SDK:', error);
    throw new ErrorApi(
      502,
      'No se pudo conectar con el entrevistador en este momento. Probá de nuevo en unos segundos.'
    );
  }
}

// Genera el saludo inicial y la primera pregunta.
async function generarApertura({ tipo, puesto, cantidadPreguntas }) {
  const resultado = await llamarClaude(
    'Empezá la entrevista.',
    esquemaApertura,
    promptApertura({ tipo, puesto, cantidadPreguntas })
  );

  return { texto: resultado.mensaje };
}

// Decide el siguiente turno a partir de la respuesta del candidato.
// mensajesPrevios: [{ rol: 'usuario'|'entrevistador', contenido }] en orden,
// sin incluir la respuesta que se acaba de dar (va aparte, en `respuesta`).
async function decidirTurno({
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

  // Construir el historial de la conversación
  const historial = mensajesPrevios
    .map((m) => `${m.rol === 'usuario' ? 'Candidato' : 'Entrevistador'}: ${m.contenido}`)
    .join('\n\n');

  const prompt = `${historial}

Candidato: ${respuesta}`;

  const resultado = await llamarClaude(
    prompt,
    esquemaDecidirTurno(puedeRepreguntar),
    promptTurno({
      tipo,
      puesto,
      cantidadPreguntas,
      indicePregunta,
      repreguntasSeguidas,
      esUltimaPregunta,
    })
  );

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

module.exports = { generarApertura, decidirTurno };
