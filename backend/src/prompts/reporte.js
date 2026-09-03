// Prompt y herramienta para generar el reporte de feedback al cerrar una
// entrevista. Los puntajes los pone Claude leyendo la conversación completa,
// no una fórmula: por eso importa que el prompt liste bien qué mide cada
// dimensión (CLAUDE.md §7), para que el reporte tenga correspondencia real
// con lo que pasó en la sesión (§11).

const { z } = require('zod');

function promptReporte({ tipo, puesto, cantidadRepreguntas }) {
  return `Sos un evaluador experto de entrevistas laborales. Acabás de terminar de entrevistar a un candidato (entrevista de tipo ${tipo}) para este puesto:
"""
${puesto}
"""

Tenés arriba la conversación completa. Durante la entrevista hubo ${cantidadRepreguntas} repregunta(s) por respuestas incompletas o vagas.

Analizá TODAS las respuestas del candidato (los mensajes de rol "user") y generá un reporte con estas cuatro dimensiones, cada una de 0 a 100:

- puntajeClaridad: qué tan comprensibles y directas fueron las respuestas.
- puntajeStar: si las respuestas siguieron el método STAR (Situación, Tarea, Acción, Resultado) cuando correspondía.
- puntajeEjemplos: si respaldó lo que decía con casos concretos y datos reales, no afirmaciones genéricas.
- puntajeCoherencia: si las respuestas fueron consistentes entre sí a lo largo de la entrevista.

También escribí:
- feedbackTexto: un análisis de 3 a 5 oraciones, en segunda persona, concreto y basado en lo que realmente pasó en ESTA conversación (mencioná algo específico que haya dicho el candidato, no genérico). Si hubo repreguntas, decí por qué se dieron.
- sugerencias: entre 2 y 5 sugerencias concretas y accionables para mejorar, basadas en los puntos más débiles de esta entrevista puntual.

Sé justo pero honesto: si el desempeño fue flojo, que los puntajes y el texto lo reflejen. No regales puntaje alto por default.

Llamá a la herramienta "generar_reporte" con el resultado.`;
}

const HERRAMIENTA_REPORTE = {
  name: 'generar_reporte',
  description: 'Registra el reporte de feedback de la entrevista.',
  input_schema: {
    type: 'object',
    properties: {
      puntajeClaridad: { type: 'integer', minimum: 0, maximum: 100 },
      puntajeStar: { type: 'integer', minimum: 0, maximum: 100 },
      puntajeEjemplos: { type: 'integer', minimum: 0, maximum: 100 },
      puntajeCoherencia: { type: 'integer', minimum: 0, maximum: 100 },
      feedbackTexto: { type: 'string' },
      sugerencias: {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        maxItems: 5,
      },
    },
    required: [
      'puntajeClaridad',
      'puntajeStar',
      'puntajeEjemplos',
      'puntajeCoherencia',
      'feedbackTexto',
      'sugerencias',
    ],
  },
};

// Esquema Zod para Vercel AI SDK
const esquemaReporte = z.object({
  puntajeClaridad: z.number().int().min(0).max(100).describe('Puntaje de claridad (0-100)'),
  puntajeStar: z.number().int().min(0).max(100).describe('Puntaje de método STAR (0-100)'),
  puntajeEjemplos: z.number().int().min(0).max(100).describe('Puntaje de ejemplos (0-100)'),
  puntajeCoherencia: z.number().int().min(0).max(100).describe('Puntaje de coherencia (0-100)'),
  feedbackTexto: z.string().describe('Análisis de 3-5 oraciones sobre el desempeño'),
  sugerencias: z.array(z.string()).min(2).max(5).describe('2-5 sugerencias para mejorar'),
});

module.exports = { promptReporte, HERRAMIENTA_REPORTE, esquemaReporte };
