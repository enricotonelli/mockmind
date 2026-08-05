// Sesiones de ejemplo para que el historial y el gráfico de evolución tengan
// contenido desde el primer arranque. Los puntajes son crecientes para mostrar
// la hipótesis del proyecto: la práctica repetida mejora el desempeño.

function fechaHaceDias(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha.toISOString();
}

export function sesionesDeEjemplo(usuarioId) {
  const plantillas = [
    {
      dias: 21,
      puestoAplicado: 'Analista de Sistemas Junior',
      tipoEntrevista: 'RRHH',
      duracion: 480,
      puntajes: { claridad: 48, star: 35, ejemplos: 40, coherencia: 55 },
      repreguntas: 5,
      feedback:
        'La entrevista mostró varias dificultades. Hubo 5 repreguntas, lo que indica que varias respuestas iniciales fueron vagas o demasiado breves. Solo 2 de 6 respuestas incluyeron un ejemplo concreto, así que las afirmaciones sonaron genéricas.',
      sugerencias: [
        'Desarrollá más tus respuestas: apuntá a 45-60 segundos por pregunta en vez de contestar en una o dos frases.',
        'Practicá el método STAR: Situación, Tarea, Acción y Resultado.',
        'Preparate tres o cuatro historias reales de tu experiencia y usalas como ejemplo.',
      ],
    },
    {
      dias: 14,
      puestoAplicado: 'Analista de Sistemas Junior',
      tipoEntrevista: 'RRHH',
      duracion: 620,
      puntajes: { claridad: 60, star: 52, ejemplos: 58, coherencia: 64 },
      repreguntas: 3,
      feedback:
        'Tu desempeño fue aceptable, con puntos sólidos pero margen de mejora. Hubo 3 repreguntas por respuestas incompletas. Mejoraste en el uso de ejemplos concretos respecto de la sesión anterior.',
      sugerencias: [
        'Cuando te repreguntan es porque faltó información: respondé de entrada el qué, el cómo y el resultado.',
        'Sumá datos concretos a tus ejemplos: cuántas personas, cuánto tiempo, qué números.',
      ],
    },
    {
      dias: 7,
      puestoAplicado: 'Desarrollador Full Stack Semi Senior',
      tipoEntrevista: 'Tecnica',
      duracion: 715,
      puntajes: { claridad: 71, star: 66, ejemplos: 72, coherencia: 70 },
      repreguntas: 2,
      feedback:
        'Buen manejo de los temas técnicos y de la estructura del relato. Hubo 2 repreguntas por respuestas que quedaron incompletas, algo normal y fácil de corregir. Respaldaste tus afirmaciones con casos concretos en la mayoría de las respuestas.',
      sugerencias: [
        'Cerrá cada respuesta con el resultado obtenido: deja una impresión más fuerte.',
        'Mantené un nivel de detalle parejo entre respuestas.',
      ],
    },
    {
      dias: 2,
      puestoAplicado: 'Desarrollador Full Stack Semi Senior',
      tipoEntrevista: 'Estres',
      duracion: 540,
      puntajes: { claridad: 78, star: 74, ejemplos: 80, coherencia: 76 },
      repreguntas: 1,
      feedback:
        'Tuviste un buen desempeño general en esta entrevista, sosteniendo el discurso incluso bajo presión. Solo hizo falta repreguntarte una vez. Respaldaste tus afirmaciones con casos concretos en 5 de 6 respuestas, que es lo que un entrevistador busca.',
      sugerencias: [
        'Muy buen nivel. Para seguir mejorando, practicá con descripciones de puesto más exigentes.',
        'Trabajá los cierres: terminar con el resultado obtenido refuerza el mensaje.',
      ],
    },
  ];

  const sesiones = [];
  const reportes = [];

  plantillas.forEach((plantilla, indice) => {
    const idSesion = indice + 1;
    const { claridad, star, ejemplos, coherencia } = plantilla.puntajes;
    const general = Math.round(
      claridad * 0.3 + star * 0.25 + ejemplos * 0.25 + coherencia * 0.2
    );

    sesiones.push({
      id: idSesion,
      usuarioId,
      puestoAplicado: plantilla.puestoAplicado,
      tipoEntrevista: plantilla.tipoEntrevista,
      fecha: fechaHaceDias(plantilla.dias),
      duracion: plantilla.duracion,
      puntajeGeneral: general,
      finalizada: true,
    });

    reportes.push({
      id: idSesion,
      sesionId: idSesion,
      puntajeClaridad: claridad,
      puntajeStar: star,
      puntajeEjemplos: ejemplos,
      puntajeCoherencia: coherencia,
      puntajeGeneral: general,
      cantidadRepreguntas: plantilla.repreguntas,
      feedbackTexto: plantilla.feedback,
      sugerencias: plantilla.sugerencias,
    });
  });

  return { sesiones, reportes, ultimoId: plantillas.length };
}
