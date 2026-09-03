// Motor de entrevista simulado.
//
// Reemplaza a Claude mientras el frontend corre sin backend. No es una lista
// fija de preguntas: analiza cada respuesta y decide si repreguntar o avanzar,
// igual que hará el motor real. Los puntajes del reporte final se calculan con
// lo que efectivamente pasó en la sesión, no son números al azar.

// ---------------------------------------------------------------------------
// Banco de preguntas por tipo de entrevista
// ---------------------------------------------------------------------------
// {puesto} se reemplaza por la descripción del puesto que cargó el usuario.

const PREGUNTAS = {
  RRHH: [
    'Contame un poco sobre vos y sobre tu recorrido profesional hasta ahora.',
    '¿Por qué te interesa el puesto de {puesto}?',
    'Contame sobre un logro del que estés orgulloso. ¿Qué hiciste concretamente y qué resultado tuvo?',
    'Describime una situación en la que tuviste un conflicto con un compañero o con tu jefe. ¿Cómo lo resolviste?',
    '¿Cuál dirías que es tu principal debilidad y qué estás haciendo para mejorarla?',
    'Contame de una vez que hayas cometido un error importante en el trabajo. ¿Qué pasó después?',
    '¿Cómo te organizás cuando tenés varias tareas urgentes al mismo tiempo?',
    '¿Dónde te ves profesionalmente dentro de tres años?',
  ],
  Tecnica: [
    'Contame sobre el proyecto técnico más complejo en el que participaste. ¿Cuál fue tu rol?',
    '¿Qué herramientas y tecnologías usás habitualmente y por qué elegiste esas?',
    'Describime cómo encarás un problema que nunca resolviste antes.',
    'Contame de una decisión técnica que hayas tomado y que después resultó equivocada. ¿Cómo te diste cuenta?',
    'Si tuvieras que explicarle a alguien sin conocimiento técnico qué hacés en tu trabajo, ¿cómo lo harías?',
    '¿Cómo te asegurás de que lo que construís funcione bien antes de entregarlo?',
    'Contame sobre una vez que tuviste que aprender algo nuevo bajo presión de tiempo.',
    '¿Qué buscarías mejorar del último proyecto en el que trabajaste?',
  ],
  Estres: [
    'Tenés treinta segundos para convencerme de que sos la mejor opción para el puesto de {puesto}. Empezá.',
    'Mirando tu perfil, no veo nada que te distinga de los otros cincuenta candidatos. ¿Qué me estoy perdiendo?',
    'Contame de la última vez que fracasaste rotundamente en algo.',
    'Si tu jefe anterior estuviera acá, ¿qué diría que es lo peor de trabajar con vos?',
    'Recién dijiste algo que no me terminó de cerrar. ¿Podés justificarlo mejor?',
    'Te doy un escenario: el proyecto se cae el día antes de la entrega y es tu responsabilidad. ¿Qué hacés?',
    '¿Por qué debería contratarte a vos y no a alguien con más experiencia?',
    'Si te ofrecen mañana un puesto mejor pago en otro lado, ¿te vas?',
  ],
};

// Repreguntas según el problema detectado en la respuesta.
const REPREGUNTAS = {
  corta: [
    'Me quedé con ganas de saber más. ¿Podés desarrollar un poco esa respuesta?',
    'Es una respuesta breve. Contame con más detalle cómo fue.',
    'Necesito entenderlo mejor. ¿Podés extenderte un poco más?',
  ],
  sinEjemplo: [
    'Entiendo el concepto, pero me ayudaría un caso puntual. ¿Podés contarme una situación concreta donde te haya pasado?',
    '¿Tenés un ejemplo real de tu experiencia que muestre eso?',
    'Bajémoslo a un caso concreto: ¿en qué situación específica lo aplicaste?',
  ],
  vaga: [
    'Noto cierta indefinición en la respuesta. ¿Qué hiciste vos puntualmente en esa situación?',
    'Me gustaría algo más concreto: ¿cuál fue tu aporte específico ahí?',
    'Vamos a lo concreto. ¿Qué acciones tomaste exactamente?',
  ],
  sinResultado: [
    'Contaste bien qué hiciste. ¿Y cuál fue el resultado final?',
    '¿Cómo terminó esa situación? ¿Qué impacto tuvo lo que hiciste?',
    'Me falta el cierre: ¿qué se logró concretamente con eso?',
  ],
};

const CIERRE =
  'Muy bien, con esto terminamos la entrevista. Gracias por tu tiempo. ' +
  'Voy a analizar tus respuestas y en un momento tenés tu reporte de feedback.';

// ---------------------------------------------------------------------------
// Análisis de una respuesta
// ---------------------------------------------------------------------------

const SENALES_VAGUEDAD = [
  'creo que', 'más o menos', 'mas o menos', 'depende', 'no sé', 'no se',
  'supongo', 'en general', 'a veces', 'la verdad no', 'ni idea', 'cosas así',
  'etcétera', 'etcetera', 'algo así', 'algo asi',
];

const SENALES_EJEMPLO = [
  'por ejemplo', 'una vez', 'en mi trabajo', 'en la empresa', 'el año pasado',
  'cuando trabajaba', 'un caso', 'me pasó', 'me paso', 'tuve que', 'recuerdo',
  'en un proyecto', 'específicamente', 'especificamente', 'concretamente',
];

const SENALES_RESULTADO = [
  'logramos', 'logré', 'logre', 'conseguimos', 'resultado', 'terminamos',
  'mejoró', 'mejoro', 'aumentó', 'aumento', 'redujo', 'reduje', 'se resolvió',
  'se resolvio', 'entregamos', 'gracias a eso', 'como consecuencia', 'al final',
];

const SENALES_SITUACION = [
  'cuando', 'en ese momento', 'la situación', 'la situacion', 'el problema era',
  'el contexto', 'trabajaba en', 'estábamos', 'estabamos', 'teníamos', 'teniamos',
];

const SENALES_ACCION = [
  'hice', 'armé', 'arme', 'implementé', 'implemente', 'propuse', 'decidí',
  'decidi', 'organicé', 'organice', 'coordiné', 'coordine', 'desarrollé',
  'desarrolle', 'me encargué', 'me encargue', 'lideré', 'lidere', 'analicé',
  'analice',
];

function contiene(texto, senales) {
  return senales.some((senal) => texto.includes(senal));
}

// Devuelve un diagnóstico de la respuesta del usuario.
export function analizarRespuesta(respuesta) {
  const texto = respuesta.toLowerCase().trim();
  const palabras = texto.split(/\s+/).filter(Boolean);

  const tieneNumeros = /\d/.test(texto);
  const tieneEjemplo = contiene(texto, SENALES_EJEMPLO) || tieneNumeros;
  const tieneResultado = contiene(texto, SENALES_RESULTADO);
  const tieneSituacion = contiene(texto, SENALES_SITUACION);
  const tieneAccion = contiene(texto, SENALES_ACCION);
  const senalesVagas = SENALES_VAGUEDAD.filter((s) => texto.includes(s)).length;

  // Cuántos elementos del método STAR aparecen (Situación, Tarea, Acción, Resultado).
  const elementosStar =
    (tieneSituacion ? 1 : 0) +
    (tieneAccion ? 1 : 0) +
    (tieneResultado ? 1 : 0) +
    (tieneEjemplo ? 1 : 0);

  // Se decide el motivo de repregunta por orden de gravedad.
  let motivo = null;
  if (palabras.length < 15) {
    motivo = 'corta';
  } else if (senalesVagas >= 2 && !tieneEjemplo) {
    motivo = 'vaga';
  } else if (!tieneEjemplo) {
    motivo = 'sinEjemplo';
  } else if (palabras.length >= 25 && !tieneResultado) {
    motivo = 'sinResultado';
  }

  return {
    cantidadPalabras: palabras.length,
    tieneEjemplo,
    tieneResultado,
    tieneSituacion,
    tieneAccion,
    senalesVagas,
    elementosStar,
    motivo, // null => la respuesta está completa, se puede avanzar
  };
}

function elegirAlAzar(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// ---------------------------------------------------------------------------
// Conducción de la entrevista
// ---------------------------------------------------------------------------

export const CANTIDAD_PREGUNTAS = 6;
const MAXIMO_REPREGUNTAS_SEGUIDAS = 2;

// Duraciones que puede elegir el usuario al configurar la entrevista.
export const DURACIONES = [
  {
    valor: 4,
    nombre: 'Corta',
    detalle: '4 preguntas · unos 5 minutos',
    descripcion: 'Para una práctica rápida o probar cómo funciona.',
  },
  {
    valor: 6,
    nombre: 'Completa',
    detalle: '6 preguntas · unos 10 minutos',
    descripcion: 'La duración recomendada: alcanza para evaluar todas las dimensiones.',
  },
  {
    valor: 8,
    nombre: 'Extendida',
    detalle: '8 preguntas · unos 15 minutos',
    descripcion: 'Se acerca a la duración de una entrevista real.',
  },
];

export function preguntasDe(tipo, puesto, cantidad = CANTIDAD_PREGUNTAS) {
  const resumenPuesto = resumirPuesto(puesto);
  return PREGUNTAS[tipo]
    .slice(0, cantidad)
    .map((pregunta) => pregunta.replace('{puesto}', resumenPuesto));
}

// La descripción del puesto puede ser larga; para insertarla en una pregunta
// se toma solo el comienzo.
function resumirPuesto(puesto) {
  const limpio = (puesto || '').trim().replace(/\s+/g, ' ');
  if (!limpio) return 'este puesto';
  const palabras = limpio.split(' ');
  if (palabras.length <= 6) return limpio;
  return palabras.slice(0, 6).join(' ');
}

export function primeraPregunta(tipo, puesto, cantidad) {
  const preguntas = preguntasDe(tipo, puesto, cantidad);
  return {
    texto: `Hola, gracias por venir. Vamos a hacer una entrevista ${nombreTipo(tipo)}. ${preguntas[0]}`,
    indicePregunta: 0,
    esRepregunta: false,
    finalizada: false,
  };
}

function nombreTipo(tipo) {
  if (tipo === 'RRHH') return 'de recursos humanos';
  if (tipo === 'Tecnica') return 'técnica';
  return 'de estrés';
}

// Decide el siguiente turno del entrevistador a partir de la respuesta del usuario.
// estado: { indicePregunta, repreguntasSeguidas }
export function siguienteTurno({ tipo, puesto, respuesta, estado, cantidad }) {
  const preguntas = preguntasDe(tipo, puesto, cantidad);
  const analisis = analizarRespuesta(respuesta);

  const puedeRepreguntar =
    analisis.motivo !== null &&
    estado.repreguntasSeguidas < MAXIMO_REPREGUNTAS_SEGUIDAS;

  if (puedeRepreguntar) {
    return {
      texto: elegirAlAzar(REPREGUNTAS[analisis.motivo]),
      indicePregunta: estado.indicePregunta,
      repreguntasSeguidas: estado.repreguntasSeguidas + 1,
      esRepregunta: true,
      finalizada: false,
      analisis,
    };
  }

  const proximoIndice = estado.indicePregunta + 1;

  if (proximoIndice >= preguntas.length) {
    return {
      texto: CIERRE,
      indicePregunta: estado.indicePregunta,
      repreguntasSeguidas: 0,
      esRepregunta: false,
      finalizada: true,
      analisis,
    };
  }

  return {
    texto: preguntas[proximoIndice],
    indicePregunta: proximoIndice,
    repreguntasSeguidas: 0,
    esRepregunta: false,
    finalizada: false,
    analisis,
  };
}

// ---------------------------------------------------------------------------
// Reporte final
// ---------------------------------------------------------------------------

function acotar(valor) {
  return Math.max(0, Math.min(100, Math.round(valor)));
}

function promedio(numeros) {
  if (!numeros.length) return 0;
  return numeros.reduce((suma, n) => suma + n, 0) / numeros.length;
}

// Genera el reporte analizando todas las respuestas que dio el usuario.
// Los puntajes se derivan de métricas reales de la sesión, de modo que el
// reporte tenga correspondencia con lo que efectivamente pasó (CLAUDE.md §11).
export function generarReporte({ tipo, puesto, respuestas, cantidadRepreguntas }) {
  const analisis = respuestas.map((r) => analizarRespuesta(r));
  const total = analisis.length || 1;

  // Claridad: penaliza respuestas muy cortas y el uso de muletillas vagas.
  const puntajeClaridad = acotar(
    promedio(
      analisis.map((a) => {
        const porLargo = Math.min(a.cantidadPalabras / 60, 1) * 100;
        const castigo = a.senalesVagas * 12;
        return porLargo - castigo;
      })
    )
  );

  // STAR: proporción de elementos del método presentes en las respuestas.
  const puntajeStar = acotar(promedio(analisis.map((a) => (a.elementosStar / 4) * 100)));

  // Ejemplos: cuántas respuestas incluyeron un caso concreto.
  const conEjemplo = analisis.filter((a) => a.tieneEjemplo).length;
  const puntajeEjemplos = acotar((conEjemplo / total) * 100);

  // Coherencia: baja cuando hubo muchas repreguntas o respuestas muy dispares
  // en extensión (señal de discurso irregular).
  const largos = analisis.map((a) => a.cantidadPalabras);
  const promedioLargo = promedio(largos) || 1;
  const dispersion = promedio(largos.map((l) => Math.abs(l - promedioLargo))) / promedioLargo;
  const puntajeCoherencia = acotar(100 - dispersion * 45 - cantidadRepreguntas * 6);

  const puntajeGeneral = acotar(
    puntajeClaridad * 0.3 + puntajeStar * 0.25 + puntajeEjemplos * 0.25 + puntajeCoherencia * 0.2
  );

  return {
    puntajeClaridad,
    puntajeStar,
    puntajeEjemplos,
    puntajeCoherencia,
    puntajeGeneral,
    cantidadRepreguntas,
    feedbackTexto: armarFeedback({
      tipo,
      puesto,
      puntajeGeneral,
      puntajeClaridad,
      puntajeStar,
      puntajeEjemplos,
      cantidadRepreguntas,
      total,
      conEjemplo,
    }),
    sugerencias: armarSugerencias({
      puntajeClaridad,
      puntajeStar,
      puntajeEjemplos,
      puntajeCoherencia,
      cantidadRepreguntas,
    }),
  };
}

function armarFeedback(datos) {
  const partes = [];

  if (datos.puntajeGeneral >= 75) {
    partes.push(
      'Tuviste un buen desempeño general en esta entrevista. Se nota preparación y capacidad para sostener el discurso.'
    );
  } else if (datos.puntajeGeneral >= 50) {
    partes.push(
      'Tu desempeño fue aceptable, con puntos sólidos pero también con margen claro de mejora en varias respuestas.'
    );
  } else {
    partes.push(
      'La entrevista mostró varias dificultades. Con práctica dirigida podés mejorar bastante en poco tiempo.'
    );
  }

  if (datos.cantidadRepreguntas === 0) {
    partes.push(
      'No hizo falta repreguntarte en ningún momento: tus respuestas fueron completas desde el primer intento.'
    );
  } else if (datos.cantidadRepreguntas <= 2) {
    partes.push(
      `Hubo ${datos.cantidadRepreguntas} repregunta${datos.cantidadRepreguntas > 1 ? 's' : ''} por respuestas que quedaron incompletas, algo normal y fácil de corregir.`
    );
  } else {
    partes.push(
      `Hubo ${datos.cantidadRepreguntas} repreguntas, lo que indica que varias respuestas iniciales fueron vagas o demasiado breves. Ese es hoy tu punto más débil.`
    );
  }

  if (datos.puntajeEjemplos >= 70) {
    partes.push(
      `Respaldaste tus afirmaciones con casos concretos en ${datos.conEjemplo} de ${datos.total} respuestas, que es lo que un entrevistador busca.`
    );
  } else {
    partes.push(
      `Solo ${datos.conEjemplo} de ${datos.total} respuestas incluyeron un ejemplo concreto. Sin casos reales, las afirmaciones suenan genéricas.`
    );
  }

  if (datos.puntajeStar < 55) {
    partes.push(
      'Tus respuestas no siguieron una estructura clara. El método STAR (Situación, Tarea, Acción, Resultado) te daría un orden mucho más convincente.'
    );
  }

  return partes.join(' ');
}

function armarSugerencias(puntajes) {
  const sugerencias = [];

  if (puntajes.puntajeClaridad < 65) {
    sugerencias.push(
      'Desarrollá más tus respuestas: apuntá a 45-60 segundos por pregunta en vez de contestar en una o dos frases.'
    );
    sugerencias.push(
      'Evitá muletillas como "creo que", "más o menos" o "depende": restan seguridad a lo que decís.'
    );
  }

  if (puntajes.puntajeStar < 65) {
    sugerencias.push(
      'Practicá el método STAR: primero contá la Situación, después tu Tarea, luego la Acción concreta que tomaste y cerrá con el Resultado.'
    );
  }

  if (puntajes.puntajeEjemplos < 65) {
    sugerencias.push(
      'Preparate tres o cuatro historias reales de tu experiencia y usalas como ejemplo. Sumá datos concretos: cuántas personas, cuánto tiempo, qué números.'
    );
  }

  if (puntajes.cantidadRepreguntas > 2) {
    sugerencias.push(
      'Cuando te repreguntan es porque faltó información. Anticipate: respondé de entrada el qué, el cómo y el resultado.'
    );
  }

  if (puntajes.puntajeCoherencia < 65) {
    sugerencias.push(
      'Mantené un nivel de detalle parejo entre respuestas: alternar entre muy extenso y muy breve da una impresión de improvisación.'
    );
  }

  if (!sugerencias.length) {
    sugerencias.push(
      'Muy buen nivel. Para seguir mejorando, probá el tipo de entrevista de estrés y practicá con descripciones de puesto más exigentes.'
    );
    sugerencias.push(
      'Trabajá los cierres: terminar cada respuesta con el resultado obtenido deja una impresión más fuerte.'
    );
  }

  return sugerencias;
}
