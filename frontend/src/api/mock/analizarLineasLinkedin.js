// Lógica pura de interpretación de un PDF de LinkedIn ya convertido en
// líneas de texto (sin nada de pdf.js acá adentro, para poder probarla
// tanto en el navegador como en Node sin depender del DOM).
//
// Es un "borrador": el texto que llega es siempre real, pero repartirlo en
// campos (qué línea es el puesto, cuál la empresa, dónde empieza cada
// experiencia) depende de que el PDF respete el formato habitual de
// LinkedIn. Está calibrado contra una exportación real y contempla los
// casos raros que aparecieron ahí (títulos partidos en dos líneas, un email
// cortado a la mitad, una institución separada de su carrera por un salto
// de página), pero no hay garantía de que cubra cualquier variante de
// layout.

const ENCABEZADOS = {
  contacto: /^(contact|contactar)$/i,
  aptitudes: /^(top skills|aptitudes principales)$/i,
  idiomas: /^(languages|idiomas)$/i,
  resumen: /^(summary|extracto|acerca de|about)$/i,
  experiencia: /^(experience|experiencia)$/i,
  educacion: /^(education|educaci[oó]n)$/i,
};

const RUIDO = /^page\s+\d+\s+of\s+\d+$/i;

const NIVELES_IDIOMA = [
  { patron: /nativ|bilingü|bilingual/i, nivel: 'Nativo' },
  { patron: /full professional|avanzad/i, nivel: 'Avanzado' },
  { patron: /professional working|limited working|intermedi/i, nivel: 'Intermedio' },
  { patron: /elementary|elemental|b[aá]sic/i, nivel: 'Básico' },
];

// Agrupa las líneas de una sección en bloques, cortando en cada línea vacía.
function dividirEnBloques(lineas) {
  const bloques = [];
  let actual = [];
  for (const linea of lineas) {
    if (linea === '') {
      if (actual.length) bloques.push(actual);
      actual = [];
    } else {
      actual.push(linea);
    }
  }
  if (actual.length) bloques.push(actual);
  return bloques;
}

function agruparPorSeccion(lineas) {
  const secciones = { contacto: [], aptitudes: [], idiomas: [], resumen: [], experiencia: [], educacion: [] };
  let actual = null;

  for (const linea of lineas) {
    if (RUIDO.test(linea)) continue;

    const encabezado = Object.entries(ENCABEZADOS).find(([, patron]) => patron.test(linea));
    if (encabezado) {
      actual = encabezado[0];
      continue;
    }
    if (actual) secciones[actual].push(linea);
  }

  return secciones;
}

// El PDF puede partir el email a mitad de dominio ("...@usal." + "edu.ar").
// Se prueba línea por línea, y solo se pega la línea siguiente cuando la
// actual tiene "@" pero el dominio todavía no cierra con un punto — nunca se
// concatena todo el bloque de contacto, porque eso arrastra el texto de
// campos vecinos (pasó con la URL de LinkedIn) hacia dentro del email.
function extraerEmail(lineas) {
  const limpias = lineas.filter(Boolean);
  for (let i = 0; i < limpias.length; i++) {
    let candidato = limpias[i];
    if (/@/.test(candidato) && !/@[\w-]+(\.[\w-]+)+/.test(candidato) && limpias[i + 1]) {
      candidato += limpias[i + 1];
    }
    const m = candidato.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/);
    if (m) return m[0].replace(/\.+$/, '');
  }
  return '';
}

// El teléfono se busca línea por línea (no en todo el bloque junto), porque
// una búsqueda de dígitos sobre el texto completo puede unir el número de
// una dirección con el celular de la línea siguiente.
function extraerTelefono(lineas) {
  for (const linea of lineas) {
    const cantidadDigitos = (linea.match(/\d/g) ?? []).length;
    if (cantidadDigitos >= 8) return linea.replace(/[^\d+]/g, '');
  }
  return '';
}

function analizarContacto(lineas) {
  const bloque = lineas.filter(Boolean).join('');
  const linkedin = bloque.match(/linkedin\.com\/in\/[\w-]+/i)?.[0] ?? '';

  return {
    email: extraerEmail(lineas),
    telefono: extraerTelefono(lineas),
    linkedin,
  };
}

// Idiomas e identidad (nombre, titular, ubicación) comparten sección, porque
// en el PDF de LinkedIn el nombre no tiene un encabezado propio: aparece
// justo debajo de "Languages"/"Idiomas".
function analizarIdiomasEIdentidad(lineas) {
  const esLineaDeIdioma = (l) => /\([^)]+\)\s*$/.test(l);
  const bloques = dividirEnBloques(lineas);

  const idiomas = [];
  let bloqueIdentidad = [];

  for (const bloque of bloques) {
    if (bloque.every(esLineaDeIdioma)) {
      for (const linea of bloque) {
        const m = linea.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
        if (!m) continue;
        const nivel = NIVELES_IDIOMA.find((n) => n.patron.test(m[2]))?.nivel ?? 'Intermedio';
        idiomas.push({ idioma: m[1].trim(), nivel });
      }
    } else {
      bloqueIdentidad = bloqueIdentidad.concat(bloque);
    }
  }

  let nombre = '';
  let titular = '';
  let ubicacion = '';

  if (bloqueIdentidad.length === 1) {
    [nombre] = bloqueIdentidad;
  } else if (bloqueIdentidad.length === 2) {
    [nombre, titular] = bloqueIdentidad;
  } else if (bloqueIdentidad.length >= 3) {
    nombre = bloqueIdentidad[0];
    ubicacion = bloqueIdentidad[bloqueIdentidad.length - 1];
    // El titular puede venir partido en varias líneas por el ancho de la
    // página: se reconstruye uniendo lo que quedó en el medio.
    titular = bloqueIdentidad.slice(1, -1).join(' ');
  }

  return { idiomas, nombre, titular, ubicacion };
}

function analizarResumen(lineas) {
  return dividirEnBloques(lineas)
    .map((bloque) => bloque.join(' '))
    .join('\n\n');
}

// Junta bloques consecutivos hasta que, al unir todas sus líneas menos la
// primera, aparezca el patrón esperado. Existe porque un salto de página
// puede separar la primera línea de una entrada (la institución o la
// empresa) del resto, dejándola sola en su propio bloque.
function unirBloquesIncompletos(bloques, tienePatronEsperado) {
  const resultado = [];
  let acumulado = [];

  for (const bloque of bloques) {
    acumulado = acumulado.concat(bloque);
    if (tienePatronEsperado(acumulado)) {
      resultado.push(acumulado);
      acumulado = [];
    }
  }
  if (acumulado.length) resultado.push(acumulado);
  return resultado;
}

const esLineaDeFecha = (l) =>
  Boolean(l) && /\b(19|20)\d{2}\b/.test(l) && (/[-–—]/.test(l) || /present|actualidad/i.test(l));

function analizarExperiencia(lineas) {
  const bloques = unirBloquesIncompletos(dividirEnBloques(lineas), (acumulado) =>
    acumulado.some(esLineaDeFecha)
  );

  return bloques
    .map((bloque) => {
      const indiceFecha = bloque.findIndex(esLineaDeFecha);
      if (indiceFecha < 1) return null;

      const fecha = bloque[indiceFecha];
      const puesto = bloque[indiceFecha - 1] ?? '';
      const empresa = bloque[indiceFecha - 2] ?? '';
      // Todo lo que sigue a la fecha (salteando una posible línea de
      // ubicación) se toma como descripción, si es que el usuario escribió una.
      const descripcion = bloque.slice(indiceFecha + 2).join(' ');

      const [desde, hastaCruda] = fecha.split(/[-–—]/).map((s) => s?.trim());
      const hastaLimpia = (hastaCruda ?? '').replace(/\([^)]*\)\s*$/, '').trim();
      const actual = /present|actualidad/i.test(hastaLimpia);

      return {
        empresa: empresa.trim(),
        puesto: puesto.trim(),
        desde: desde ?? '',
        hasta: actual ? '' : hastaLimpia,
        actual,
        descripcion,
      };
    })
    .filter(Boolean);
}

function analizarEducacion(lineas) {
  const conFechas = (texto) => texto.match(/^(.*?)\s*·\s*\(([^)]+)\)\s*$/);

  const bloques = unirBloquesIncompletos(dividirEnBloques(lineas), (acumulado) =>
    Boolean(conFechas(acumulado.slice(1).join(' ')))
  );

  return bloques
    .map((bloque) => {
      const institucion = bloque[0] ?? '';
      const resto = bloque.slice(1).join(' ');
      const m = conFechas(resto);
      if (!m) return null;

      const [desde, hastaCruda] = m[2].split(/[-–—]/).map((s) => s?.trim());
      const enCurso = /present|actualidad/i.test(hastaCruda ?? '');

      return {
        institucion: institucion.trim(),
        titulo: m[1].trim(),
        desde: desde ?? '',
        hasta: enCurso ? '' : (hastaCruda ?? ''),
        enCurso,
      };
    })
    .filter(Boolean);
}

// Recibe el array de líneas ya reconstruido a partir del PDF y devuelve los
// campos que se pudieron reconocer con confianza. Nunca lanza por no
// encontrar algo: si una sección no aparece o no matchea el formato
// esperado, esa parte del CV simplemente queda vacía para completar a mano.
export function analizarLineasLinkedin(lineas) {
  const secciones = agruparPorSeccion(lineas);

  const contacto = analizarContacto(secciones.contacto);
  const { idiomas, nombre, titular, ubicacion } = analizarIdiomasEIdentidad(secciones.idiomas);
  const habilidades = secciones.aptitudes.filter(Boolean);
  const resumen = analizarResumen(secciones.resumen);
  const experienciasCrudas = analizarExperiencia(secciones.experiencia);
  const educacionCruda = analizarEducacion(secciones.educacion);

  return {
    nombre,
    titular,
    ubicacion,
    email: contacto.email,
    telefono: contacto.telefono,
    linkedin: contacto.linkedin,
    resumen,
    habilidades,
    idiomas,
    experiencias: experienciasCrudas.map((exp, indice) => ({
      id: `exp-importada-${indice}`,
      puesto: exp.puesto,
      empresa: exp.empresa,
      desde: exp.desde,
      hasta: exp.hasta,
      actual: exp.actual,
      descripcion: exp.descripcion,
    })),
    educacion: educacionCruda.map((edu, indice) => ({
      id: `edu-importada-${indice}`,
      titulo: edu.titulo,
      institucion: edu.institucion,
      desde: edu.desde,
      hasta: edu.hasta,
      enCurso: edu.enCurso,
    })),
  };
}
