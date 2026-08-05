// Módulo 3 — Creador de CV (versión simulada).
//
// Maneja el armado del CV, el análisis de compatibilidad con los sistemas
// automáticos de selección (ATS) y la importación desde el PDF que LinkedIn
// permite exportar del propio perfil.

import { leerDatos, guardarDatos, proximoId, demorar } from './almacenamiento';

export const PLANTILLAS = [
  {
    id: 'ats',
    nombre: 'ATS puro',
    descripcion:
      'Texto plano, una sola columna, sin gráficos ni tablas. Es la que mejor leen los sistemas automáticos.',
    recomendada: 'Para postularte en portales de empleo grandes (LinkedIn, Bumeran, Zonajobs).',
    aptaAts: true,
  },
  {
    id: 'moderno',
    nombre: 'Moderno',
    descripcion:
      'Una columna con títulos destacados y buen uso del espacio. Se ve prolijo y sigue siendo legible por un ATS.',
    recomendada: 'Para mandar por mail a un reclutador o adjuntar en una postulación directa.',
    aptaAts: true,
  },
  {
    id: 'clasico',
    nombre: 'Clásico',
    descripcion:
      'Formato tradicional con tipografía serif. Sobrio y conservador, apto para sectores formales.',
    recomendada: 'Para empresas tradicionales: bancos, estudios, administración pública.',
    aptaAts: true,
  },
];

export function cvVacio() {
  return {
    nombre: '',
    titular: '',
    email: '',
    telefono: '',
    ubicacion: '',
    linkedin: '',
    resumen: '',
    experiencias: [],
    educacion: [],
    habilidades: [],
    idiomas: [],
    plantilla: 'moderno',
  };
}

export function experienciaVacia() {
  return {
    id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    puesto: '',
    empresa: '',
    desde: '',
    hasta: '',
    actual: false,
    descripcion: '',
  };
}

export function educacionVacia() {
  return {
    id: `edu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    titulo: '',
    institucion: '',
    desde: '',
    hasta: '',
    enCurso: false,
  };
}

// ---------------------------------------------------------------------------
// Análisis de compatibilidad con sistemas automáticos de selección (ATS)
// ---------------------------------------------------------------------------

// Verbos de acción: un CV que arranca las descripciones con verbos concretos
// puntúa mejor que uno lleno de frases pasivas.
const VERBOS_ACCION = [
  'lideré', 'lidere', 'desarrollé', 'desarrolle', 'implementé', 'implemente',
  'coordiné', 'coordine', 'diseñé', 'diseñe', 'reduje', 'aumenté', 'aumente',
  'gestioné', 'gestione', 'automaticé', 'automatice', 'optimicé', 'optimice',
  'creé', 'cree', 'analicé', 'analice', 'capacité', 'capacite', 'negocié',
  'negocie', 'migré', 'migre', 'resolví', 'resolvi', 'organicé', 'organice',
];

// Frases que no aportan nada y que los reclutadores marcan como relleno.
const FRASES_VACIAS = [
  'proactivo', 'trabajo en equipo', 'orientado a resultados', 'dinámico',
  'dinamico', 'responsable y puntual', 'ganas de aprender', 'buena predisposición',
  'buena predisposicion',
];

function tieneNumeros(texto) {
  return /\d/.test(texto);
}

// Devuelve un análisis del CV en cuatro dimensiones, cada una de 0 a 100.
export function analizarCv(cv) {
  const problemas = [];
  const aciertos = [];

  // --- 1. Datos de contacto: sin esto el ATS no puede fichar al candidato ---
  let contacto = 0;
  if (cv.nombre?.trim()) contacto += 25;
  else problemas.push({ grave: true, texto: 'Falta tu nombre completo.' });

  if (cv.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cv.email)) contacto += 30;
  else problemas.push({ grave: true, texto: 'Falta un email válido: es el dato que más usan los ATS.' });

  if (cv.telefono?.trim()) contacto += 25;
  else problemas.push({ grave: false, texto: 'Agregá un teléfono de contacto.' });

  if (cv.ubicacion?.trim()) contacto += 20;
  else problemas.push({ grave: false, texto: 'Agregá tu ciudad: muchos filtros buscan por ubicación.' });

  if (contacto === 100) aciertos.push('Tus datos de contacto están completos.');

  // --- 2. Completitud: que estén las secciones que el ATS espera encontrar ---
  let completitud = 0;
  if (cv.titular?.trim()) completitud += 15;
  else problemas.push({ grave: false, texto: 'Agregá un titular con el puesto que buscás (ej: "Desarrollador Full Stack").' });

  if (cv.resumen?.trim().length >= 100) completitud += 20;
  else problemas.push({ grave: false, texto: 'Escribí un resumen profesional de al menos 3 o 4 líneas.' });

  if (cv.experiencias?.length >= 1) {
    completitud += 25;
    if (cv.experiencias.length >= 2) completitud += 5;
  } else {
    problemas.push({ grave: true, texto: 'Cargá al menos una experiencia laboral.' });
  }

  if (cv.educacion?.length >= 1) completitud += 20;
  else problemas.push({ grave: true, texto: 'Cargá tu formación académica.' });

  if (cv.habilidades?.length >= 5) {
    completitud += 15;
    aciertos.push(`Cargaste ${cv.habilidades.length} habilidades: los ATS las cruzan con el aviso.`);
  } else {
    problemas.push({
      grave: false,
      texto: `Cargá al menos 5 habilidades (llevás ${cv.habilidades?.length ?? 0}). Los ATS filtran por palabras clave.`,
    });
  }

  // --- 3. Calidad del contenido: cómo están escritas las descripciones ---
  let calidad = 0;
  const descripciones = (cv.experiencias ?? [])
    .map((e) => e.descripcion ?? '')
    .filter((d) => d.trim());

  if (descripciones.length) {
    const conVerbo = descripciones.filter((d) =>
      VERBOS_ACCION.some((verbo) => d.toLowerCase().includes(verbo))
    ).length;
    const conNumeros = descripciones.filter((d) => tieneNumeros(d)).length;

    calidad += Math.round((conVerbo / descripciones.length) * 40);
    calidad += Math.round((conNumeros / descripciones.length) * 40);

    if (conNumeros === descripciones.length) {
      aciertos.push('Todas tus experiencias tienen datos concretos: eso es lo que más pesa.');
    } else if (conNumeros < descripciones.length) {
      problemas.push({
        grave: false,
        texto: `Sumá números a tus logros (${conNumeros} de ${descripciones.length} experiencias los tienen). "Reduje los tiempos un 30%" vale más que "mejoré los tiempos".`,
      });
    }

    if (conVerbo < descripciones.length) {
      problemas.push({
        grave: false,
        texto: 'Empezá las descripciones con verbos de acción: "Lideré", "Implementé", "Reduje".',
      });
    }

    // Descripciones demasiado cortas para decir algo útil.
    const cortas = descripciones.filter((d) => d.trim().split(/\s+/).length < 12).length;
    if (cortas === 0) calidad += 20;
    else
      problemas.push({
        grave: false,
        texto: `${cortas} ${cortas === 1 ? 'experiencia es' : 'experiencias son'} demasiado breve${cortas === 1 ? '' : 's'}: contá qué hiciste y qué lograste.`,
      });
  } else if (cv.experiencias?.length) {
    problemas.push({ grave: true, texto: 'Tus experiencias no tienen descripción: el ATS no encuentra palabras clave.' });
  }

  // --- 4. Formato: qué tan legible es para una máquina ---
  let formato = 100;
  const plantilla = PLANTILLAS.find((p) => p.id === cv.plantilla);
  if (plantilla && !plantilla.aptaAts) {
    formato -= 40;
    problemas.push({ grave: true, texto: 'La plantilla elegida no es apta para sistemas automáticos.' });
  }

  const textoCompleto = [
    cv.resumen ?? '',
    ...descripciones,
    ...(cv.habilidades ?? []),
  ]
    .join(' ')
    .toLowerCase();

  const vacias = FRASES_VACIAS.filter((frase) => textoCompleto.includes(frase));
  if (vacias.length) {
    formato -= Math.min(vacias.length * 10, 30);
    problemas.push({
      grave: false,
      texto: `Sacá las frases de relleno (${vacias.slice(0, 3).join(', ')}): ocupan lugar y no dicen nada.`,
    });
  }

  if (cv.resumen && cv.resumen.length > 800) {
    formato -= 15;
    problemas.push({ grave: false, texto: 'El resumen es muy largo: con 4 o 5 líneas alcanza.' });
  }

  const acotar = (n) => Math.max(0, Math.min(100, Math.round(n)));

  const dimensiones = {
    contacto: acotar(contacto),
    completitud: acotar(completitud),
    calidad: acotar(calidad),
    formato: acotar(formato),
  };

  const puntajeGeneral = acotar(
    dimensiones.contacto * 0.2 +
      dimensiones.completitud * 0.3 +
      dimensiones.calidad * 0.35 +
      dimensiones.formato * 0.15
  );

  return {
    ...dimensiones,
    puntajeGeneral,
    // Los problemas graves primero, que son los que bloquean.
    problemas: [...problemas].sort((a, b) => Number(b.grave) - Number(a.grave)),
    aciertos,
    veredicto: veredictoDe(puntajeGeneral),
  };
}

function veredictoDe(puntaje) {
  if (puntaje >= 80) {
    return {
      titulo: 'Listo para postularte',
      texto: 'Tu CV pasa sin problemas los filtros automáticos y se lee bien.',
    };
  }
  if (puntaje >= 60) {
    return {
      titulo: 'Casi listo',
      texto: 'Va a pasar la mayoría de los filtros, pero hay ajustes que te conviene hacer.',
    };
  }
  if (puntaje >= 35) {
    return {
      titulo: 'Necesita trabajo',
      texto: 'Con este CV es probable que quedes afuera en el filtro automático, antes de que un humano lo lea.',
    };
  }
  return {
    titulo: 'Incompleto',
    texto: 'Todavía faltan datos básicos que los sistemas automáticos necesitan para procesarlo.',
  };
}

// ---------------------------------------------------------------------------
// Importación desde LinkedIn
// ---------------------------------------------------------------------------
//
// IMPORTANTE: LinkedIn no ofrece una API pública que permita leer el perfil
// completo de un usuario. El "Iniciar sesión con LinkedIn" solo devuelve
// nombre, email y foto, y el acceso al perfil completo exige ser Partner
// aprobado. La vía que sí funciona es que el usuario exporte su propio perfil
// como PDF desde LinkedIn (botón "Más" → "Guardar como PDF") y lo suba acá.
//
// El texto se extrae de verdad con pdf.js, corriendo en el navegador (nada de
// esto pasa por un servidor). Repartir ese texto en campos (qué línea es el
// puesto, cuál la empresa) es una heurística sobre el formato habitual de
// LinkedIn, calibrada contra una exportación real: no hay garantía de que
// funcione perfecto con cualquier variante de layout, así que sigue siendo
// un borrador para revisar, no una importación 100% automática.
//
// Si el PDF no tiene texto extraíble (por ejemplo, es un escaneo de imagen)
// se cae a los datos de ejemplo, para que la pantalla siga siendo recorrible.

const DATOS_DE_EJEMPLO = {
  nombre: 'Enrico Tonelli',
  titular: 'Estudiante de Ingeniería en Informática',
  email: 'enrico.tonelli@ejemplo.com',
  telefono: '+54 11 5555 5555',
  ubicacion: 'Buenos Aires, Argentina',
  linkedin: 'linkedin.com/in/ejemplo',
  resumen:
    'Estudiante avanzado de Ingeniería en Informática con experiencia en desarrollo web. ' +
    'Trabajé en proyectos de gestión interna usando JavaScript, React y Node.js. ' +
    'Busco un puesto donde poder crecer técnicamente y asumir responsabilidad sobre un producto.',
  experiencias: [
    {
      ...experienciaVacia(),
      puesto: 'Desarrollador Web Junior',
      empresa: 'Consultora de Sistemas',
      desde: '2023',
      hasta: '',
      actual: true,
      descripcion:
        'Desarrollé módulos del sistema de gestión interna usando React y Node.js. ' +
        'Reduje en un 40% el tiempo de carga del panel principal optimizando las consultas a la base de datos.',
    },
    {
      ...experienciaVacia(),
      puesto: 'Pasante de Soporte Técnico',
      empresa: 'Estudio Contable',
      desde: '2022',
      hasta: '2023',
      actual: false,
      descripcion:
        'Atención de incidentes de los usuarios internos y tareas de mantenimiento de los equipos.',
    },
  ],
  educacion: [
    {
      ...educacionVacia(),
      titulo: 'Ingeniería en Informática',
      institucion: 'Universidad del Salvador (USAL)',
      desde: '2021',
      hasta: '',
      enCurso: true,
    },
  ],
  habilidades: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git', 'Express'],
  idiomas: [
    { idioma: 'Español', nivel: 'Nativo' },
    { idioma: 'Inglés', nivel: 'Intermedio' },
  ],
};

export async function importarDesdeLinkedin(archivo) {
  if (!archivo) throw new Error('Elegí el PDF que exportaste de LinkedIn.');
  if (!archivo.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('El archivo tiene que ser el PDF que exporta LinkedIn.');
  }

  const { extraerCvDePdf } = await import('./extraccionLinkedin');
  const extraido = await extraerCvDePdf(archivo).catch(() => null);

  if (!extraido) {
    await demorar(600);
    return { ...cvVacio(), ...DATOS_DE_EJEMPLO };
  }

  return {
    ...cvVacio(),
    ...extraido,
    experiencias: extraido.experiencias.length
      ? extraido.experiencias
      : DATOS_DE_EJEMPLO.experiencias,
    educacion: extraido.educacion.length ? extraido.educacion : DATOS_DE_EJEMPLO.educacion,
  };
}

// ---------------------------------------------------------------------------
// Persistencia
// ---------------------------------------------------------------------------

function asegurarLista(datos) {
  return Array.isArray(datos.cvs) ? datos.cvs : [];
}

export async function listarCvs() {
  await demorar(300);
  const datos = leerDatos();
  return [...asegurarLista(datos)].sort(
    (a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion)
  );
}

export async function obtenerCv(cvId) {
  await demorar(250);
  const datos = leerDatos();
  const cv = asegurarLista(datos).find((c) => c.id === Number(cvId));
  if (!cv) throw new Error('No se encontró el CV.');
  return cv;
}

export async function guardarCv(cv) {
  await demorar(400);

  const datos = leerDatos();
  if (!datos.usuario) throw new Error('No hay una sesión activa.');

  const lista = asegurarLista(datos);
  const ahora = new Date().toISOString();

  if (cv.id) {
    const actualizado = { ...cv, fechaActualizacion: ahora };
    guardarDatos({
      ...datos,
      cvs: lista.map((c) => (c.id === cv.id ? actualizado : c)),
    });
    return actualizado;
  }

  const nuevo = {
    ...cv,
    id: proximoId(),
    usuarioId: datos.usuario.id,
    fechaCreacion: ahora,
    fechaActualizacion: ahora,
  };

  const finales = leerDatos();
  guardarDatos({ ...finales, cvs: [...asegurarLista(finales), nuevo] });
  return nuevo;
}

export async function eliminarCv(cvId) {
  await demorar(300);
  const datos = leerDatos();
  guardarDatos({
    ...datos,
    cvs: asegurarLista(datos).filter((c) => c.id !== Number(cvId)),
  });
}
