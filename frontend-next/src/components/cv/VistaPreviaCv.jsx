'use client';

// Vista previa del CV en las cinco plantillas.
//
// Todas usan una sola columna y texto real (nada de tablas, fotos ni
// imágenes con texto adentro), que es la condición para que un sistema
// automático de selección pueda leerlas. Lo que cambia entre plantillas no
// es solo la tipografía: Harvard y Funcional también cambian el ORDEN de
// las secciones, porque eso es justamente lo que las distingue en la vida
// real (Harvard antepone la formación académica; Funcional antepone las
// habilidades).

function periodo(desde, hasta, sigue, etiquetaActual = 'Actualidad') {
  if (!desde && !hasta) return '';
  const fin = sigue ? etiquetaActual : hasta;
  if (desde && fin) return `${desde} — ${fin}`;
  return desde || fin;
}

function Seccion({ titulo, children, clasesTitulo }) {
  return (
    <section className="mt-5">
      <h3 className={clasesTitulo}>{titulo}</h3>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

const ORDEN_POR_DEFECTO = ['resumen', 'experiencia', 'educacion', 'habilidades', 'idiomas'];

const ESTILOS = {
  ats: {
    raiz: 'font-sans text-[13px] leading-relaxed',
    nombre: 'text-xl font-bold uppercase tracking-wide text-neutral-900',
    titular: 'text-sm',
    seccion: 'text-xs font-bold uppercase tracking-wider border-b border-neutral-400 pb-1',
    puesto: 'font-bold',
    centrado: false,
    orden: ORDEN_POR_DEFECTO,
  },
  moderno: {
    raiz: 'font-sans text-[13px] leading-relaxed',
    nombre: 'text-2xl font-semibold text-neutral-900',
    titular: 'text-sm text-neutral-600',
    seccion: 'text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500',
    puesto: 'font-semibold',
    centrado: false,
    orden: ORDEN_POR_DEFECTO,
  },
  clasico: {
    raiz: 'font-serif text-[13px] leading-relaxed',
    nombre: 'text-2xl font-semibold text-center text-neutral-900',
    titular: 'text-sm text-center italic',
    seccion: 'text-sm font-semibold border-b border-neutral-300 pb-1',
    puesto: 'font-semibold',
    centrado: true,
    orden: ORDEN_POR_DEFECTO,
  },
  harvard: {
    raiz: 'font-serif text-[13px] leading-relaxed',
    nombre: 'text-xl font-bold uppercase tracking-[0.15em] text-center text-neutral-900',
    titular: 'text-sm text-center',
    seccion: 'text-sm font-bold uppercase tracking-wide border-b border-neutral-900 pb-0.5',
    puesto: 'font-bold',
    centrado: true,
    // Convención real del formato Harvard: la formación va antes que la
    // experiencia, porque suele usarse cuando el título académico pesa más.
    orden: ['resumen', 'educacion', 'experiencia', 'habilidades', 'idiomas'],
  },
  funcional: {
    raiz: 'font-sans text-[13px] leading-relaxed',
    nombre: 'text-2xl font-semibold text-neutral-900',
    titular: 'text-sm text-neutral-600',
    seccion: 'text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500',
    puesto: 'font-semibold',
    centrado: false,
    // Lo que define a un CV funcional: las habilidades quedan primero, antes
    // que el historial laboral cronológico.
    orden: ['resumen', 'habilidades', 'experiencia', 'educacion', 'idiomas'],
  },
};

function VistaPreviaCv({ cv }) {
  const datosContacto = [cv.email, cv.telefono, cv.ubicacion, cv.linkedin].filter(Boolean);

  const hayContenido =
    cv.nombre ||
    cv.resumen ||
    cv.experiencias?.length ||
    cv.educacion?.length ||
    cv.habilidades?.length;

  if (!hayContenido) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-center">
        <p className="text-sm text-texto-tenue">
          Empezá a completar tus datos y vas a ver el CV armarse acá.
        </p>
      </div>
    );
  }

  const e = ESTILOS[cv.plantilla] ?? ESTILOS.moderno;

  const secciones = {
    resumen: cv.resumen && (
      <Seccion key="resumen" titulo="Perfil profesional" clasesTitulo={e.seccion}>
        <p className="whitespace-pre-wrap break-words">{cv.resumen}</p>
      </Seccion>
    ),
    experiencia: cv.experiencias?.length > 0 && (
      <Seccion key="experiencia" titulo="Experiencia laboral" clasesTitulo={e.seccion}>
        {cv.experiencias.map((exp) => (
          <div key={exp.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className={e.puesto}>
                {exp.puesto || 'Puesto'}
                {exp.empresa && <span className="font-normal"> · {exp.empresa}</span>}
              </p>
              <span className="text-xs text-neutral-600">
                {periodo(exp.desde, exp.hasta, exp.actual)}
              </span>
            </div>
            {exp.descripcion && (
              <p className="mt-1 whitespace-pre-wrap break-words text-neutral-800">
                {exp.descripcion}
              </p>
            )}
          </div>
        ))}
      </Seccion>
    ),
    educacion: cv.educacion?.length > 0 && (
      <Seccion key="educacion" titulo="Formación académica" clasesTitulo={e.seccion}>
        {cv.educacion.map((edu) => (
          <div key={edu.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className={e.puesto}>
              {edu.titulo || 'Título'}
              {edu.institucion && <span className="font-normal"> · {edu.institucion}</span>}
            </p>
            <span className="text-xs text-neutral-600">
              {periodo(edu.desde, edu.hasta, edu.enCurso, 'En curso')}
            </span>
          </div>
        ))}
      </Seccion>
    ),
    habilidades: cv.habilidades?.length > 0 && (
      <Seccion key="habilidades" titulo="Habilidades" clasesTitulo={e.seccion}>
        {/* Separadas por coma en una línea de texto: un ATS las lee mejor
            que si estuvieran en columnas o en etiquetas gráficas. */}
        <p className="break-words">{cv.habilidades.join(' · ')}</p>
      </Seccion>
    ),
    idiomas: cv.idiomas?.length > 0 && (
      <Seccion key="idiomas" titulo="Idiomas" clasesTitulo={e.seccion}>
        <p>{cv.idiomas.map((i) => `${i.idioma} (${i.nivel})`).join(' · ')}</p>
      </Seccion>
    ),
  };

  return (
    // La vista previa siempre va en blanco y negro: así se ve impresa y así
    // la procesa un ATS, sin importar el tema de la aplicación.
    <div className={`bg-white p-8 text-neutral-900 ${e.raiz}`}>
      <header className={e.centrado ? 'text-center' : ''}>
        <h2 className={e.nombre}>{cv.nombre || 'Tu nombre'}</h2>
        {cv.titular && <p className={e.titular}>{cv.titular}</p>}
        {datosContacto.length > 0 && (
          <p className={`mt-1.5 text-xs text-neutral-600 ${e.centrado ? 'text-center' : ''}`}>
            {datosContacto.join('  ·  ')}
          </p>
        )}
      </header>

      {e.orden.map((clave) => secciones[clave])}
    </div>
  );
}

export default VistaPreviaCv;