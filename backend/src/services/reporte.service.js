// Genera el reporte de feedback final, leyendo la conversación completa.

const { anthropic, MODELO } = require('../config/anthropic');
const { ErrorApi } = require('../middleware/manejoErrores');
const { promptReporte, HERRAMIENTA_REPORTE } = require('../prompts/reporte');

const MAX_TOKENS_REPORTE = 1200;

// El puntaje general es un promedio ponderado de las cuatro dimensiones
// (CLAUDE.md §7): se calcula acá, no lo guarda su propia columna en la DB,
// para no tener dos fuentes de verdad para el mismo número.
function calcularPuntajeGeneral(dimensiones) {
  const valor =
    dimensiones.puntajeClaridad * 0.3 +
    dimensiones.puntajeStar * 0.25 +
    dimensiones.puntajeEjemplos * 0.25 +
    dimensiones.puntajeCoherencia * 0.2;
  return Math.max(0, Math.min(100, Math.round(valor)));
}

// mensajes: [{ rol: 'usuario'|'entrevistador', contenido }] en orden.
async function generarReporte({ tipo, puesto, cantidadRepreguntas, mensajes }) {
  const historial = mensajes.map((m) => ({
    role: m.rol === 'usuario' ? 'user' : 'assistant',
    content: m.contenido,
  }));

  let respuesta;
  try {
    respuesta = await anthropic.messages.create({
      model: MODELO,
      max_tokens: MAX_TOKENS_REPORTE,
      system: promptReporte({ tipo, puesto, cantidadRepreguntas }),
      messages: historial,
      tools: [HERRAMIENTA_REPORTE],
      tool_choice: { type: 'tool', name: 'generar_reporte' },
    });
  } catch (error) {
    console.error('Error llamando a la API de Anthropic (reporte):', error);
    throw new ErrorApi(
      502,
      'No se pudo generar el reporte en este momento. Probá de nuevo en unos segundos.'
    );
  }

  const bloque = respuesta.content.find(
    (b) => b.type === 'tool_use' && b.name === 'generar_reporte'
  );
  if (!bloque) {
    throw new ErrorApi(502, 'No se pudo generar el reporte. Probá de nuevo.');
  }

  const acotar = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
  const datos = bloque.input;

  return {
    puntajeClaridad: acotar(datos.puntajeClaridad),
    puntajeStar: acotar(datos.puntajeStar),
    puntajeEjemplos: acotar(datos.puntajeEjemplos),
    puntajeCoherencia: acotar(datos.puntajeCoherencia),
    feedbackTexto: String(datos.feedbackTexto || '').trim(),
    sugerencias: Array.isArray(datos.sugerencias) ? datos.sugerencias : [],
  };
}

module.exports = { generarReporte, calcularPuntajeGeneral };
