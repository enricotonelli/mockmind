// Genera el reporte de feedback final, leyendo la conversación completa.

const { generateObject } = require('ai');
const { modeloEntrevistadorAI } = require('../config/anthropic');
const { ErrorApi } = require('../middleware/manejoErrores');
const { promptReporte, esquemaReporte } = require('../prompts/reporte');

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
  // Construir el historial de la conversación en formato de diálogo
  const historial = mensajes
    .map((m) => `${m.rol === 'usuario' ? 'Candidato' : 'Entrevistador'}: ${m.contenido}`)
    .join('\n\n');

  try {
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
  } catch (error) {
    console.error('Error generando reporte:', error);
    throw new ErrorApi(
      502,
      'No se pudo generar el reporte en este momento. Probá de nuevo en unos segundos.'
    );
  }
}

module.exports = { generarReporte, calcularPuntajeGeneral };
