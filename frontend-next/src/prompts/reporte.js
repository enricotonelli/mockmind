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

const esquemaReporte = z.object({
  puntajeClaridad: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Puntaje de claridad (0-100)'),
  puntajeStar: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Puntaje de método STAR (0-100)'),
  puntajeEjemplos: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Puntaje de ejemplos (0-100)'),
  puntajeCoherencia: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Puntaje de coherencia (0-100)'),
  feedbackTexto: z.string().describe('Análisis de 3-5 oraciones sobre el desempeño'),
  sugerencias: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe('2-5 sugerencias para mejorar'),
});

module.exports = { promptReporte, esquemaReporte };
