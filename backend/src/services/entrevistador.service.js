// Lógica del motor de entrevistas: le pide a Claude que abra la entrevista y
// que decida, turno a turno, si repreguntar o avanzar. El estado (qué
// pregunta va, cuántas repreguntas seguidas) lo calcula quien llama a este
// servicio a partir de los mensajes guardados (ver sesiones.controller.js) y
// se le pasa explícitamente a cada función: este archivo no guarda nada.

const { anthropic, MODELO } = require('../config/anthropic');
const { ErrorApi } = require('../middleware/manejoErrores');
const {
  promptApertura,
  promptTurno,
  herramientaDecidirTurno,
  HERRAMIENTA_APERTURA,
} = require('../prompts/entrevistador');

const MAX_TOKENS_TURNO = 500;

async function llamarClaude(params) {
  try {
    return await anthropic.messages.create(params);
  } catch (error) {
    console.error('Error llamando a la API de Anthropic:', error);
    throw new ErrorApi(
      502,
      'No se pudo conectar con el entrevistador en este momento. Probá de nuevo en unos segundos.'
    );
  }
}

// Busca el bloque de uso de herramienta en la respuesta de Claude. Si no
// está (no debería pasar con tool_choice forzado, pero una API externa
// siempre puede sorprender), se trata como una falla del entrevistador.
function extraerHerramienta(respuesta, nombreEsperado) {
  const bloque = respuesta.content.find(
    (b) => b.type === 'tool_use' && b.name === nombreEsperado
  );
  if (!bloque) {
    throw new ErrorApi(502, 'El entrevistador no respondió correctamente. Probá de nuevo.');
  }
  return bloque.input;
}

// Genera el saludo inicial y la primera pregunta.
async function generarApertura({ tipo, puesto, cantidadPreguntas }) {
  const respuesta = await llamarClaude({
    model: MODELO,
    max_tokens: MAX_TOKENS_TURNO,
    system: promptApertura({ tipo, puesto, cantidadPreguntas }),
    messages: [{ role: 'user', content: 'Empezá la entrevista.' }],
    tools: [HERRAMIENTA_APERTURA],
    tool_choice: { type: 'tool', name: 'abrir_entrevista' },
  });

  const { mensaje } = extraerHerramienta(respuesta, 'abrir_entrevista');
  return { texto: mensaje };
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

  const historial = mensajesPrevios.map((m) => ({
    role: m.rol === 'usuario' ? 'user' : 'assistant',
    content: m.contenido,
  }));
  historial.push({ role: 'user', content: respuesta });

  const respuestaClaude = await llamarClaude({
    model: MODELO,
    max_tokens: MAX_TOKENS_TURNO,
    system: promptTurno({
      tipo,
      puesto,
      cantidadPreguntas,
      indicePregunta,
      repreguntasSeguidas,
      esUltimaPregunta,
    }),
    messages: historial,
    tools: [herramientaDecidirTurno({ repreguntasSeguidas })],
    tool_choice: { type: 'tool', name: 'decidir_turno' },
  });

  const { accion, mensaje } = extraerHerramienta(respuestaClaude, 'decidir_turno');
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
