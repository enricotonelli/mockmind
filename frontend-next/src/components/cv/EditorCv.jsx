'use client';

import { useState } from 'react';
import { experienciaVacia, educacionVacia, PLANTILLAS } from '../../api';
import Campo from '../Campo';
import Boton from '../Boton';

// Formulario de edición del CV. Cada cambio se propaga hacia arriba para que
// la vista previa y el análisis ATS se actualicen en vivo.

const NIVELES_IDIOMA = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];

function Bloque({ titulo, descripcion, children, accion }) {
  return (
    <section className="border-b border-borde py-6 first:pt-0 last:border-0">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg">{titulo}</h3>
          {descripcion && (
            <p className="mt-0.5 text-sm leading-relaxed text-texto-suave">{descripcion}</p>
          )}
        </div>
        {accion}
      </div>
      {children}
    </section>
  );
}

function EditorCv({ cv, alCambiar }) {
  const [habilidadNueva, setHabilidadNueva] = useState('');
  const [idiomaNuevo, setIdiomaNuevo] = useState('');

  // Cambia un campo simple del CV.
  function cambiar(campo, valor) {
    alCambiar({ ...cv, [campo]: valor });
  }

  // Cambia un elemento dentro de una lista (experiencias o educación).
  function cambiarEnLista(lista, id, campo, valor) {
    alCambiar({
      ...cv,
      [lista]: cv[lista].map((item) => (item.id === id ? { ...item, [campo]: valor } : item)),
    });
  }

  function quitarDeLista(lista, id) {
    alCambiar({ ...cv, [lista]: cv[lista].filter((item) => item.id !== id) });
  }

  function agregarHabilidad() {
    const limpia = habilidadNueva.trim();
    if (!limpia) return;
    if (cv.habilidades.some((h) => h.toLowerCase() === limpia.toLowerCase())) {
      setHabilidadNueva('');
      return;
    }
    alCambiar({ ...cv, habilidades: [...cv.habilidades, limpia] });
    setHabilidadNueva('');
  }

  function agregarIdioma() {
    const limpio = idiomaNuevo.trim();
    if (!limpio) return;
    alCambiar({ ...cv, idiomas: [...cv.idiomas, { idioma: limpio, nivel: 'Intermedio' }] });
    setIdiomaNuevo('');
  }

  return (
    <div>
      {/* --- Datos personales --- */}
      <Bloque
        titulo="Datos personales"
        descripcion="Es lo primero que lee un sistema automático. Si falta el email, tu CV puede quedar afuera sin que nadie lo mire."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            id="cv-nombre"
            etiqueta="Nombre completo"
            value={cv.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            placeholder="Enrico Tonelli"
          />
          <Campo
            id="cv-titular"
            etiqueta="Titular"
            value={cv.titular}
            onChange={(e) => cambiar('titular', e.target.value)}
            placeholder="Desarrollador Full Stack"
            ayuda="El puesto que buscás, no el que tenés"
          />
          <Campo
            id="cv-email"
            etiqueta="Email"
            type="email"
            value={cv.email}
            onChange={(e) => cambiar('email', e.target.value)}
            placeholder="tunombre@ejemplo.com"
          />
          <Campo
            id="cv-telefono"
            etiqueta="Teléfono"
            value={cv.telefono}
            onChange={(e) => cambiar('telefono', e.target.value)}
            placeholder="+54 11 5555 5555"
          />
          <Campo
            id="cv-ubicacion"
            etiqueta="Ubicación"
            value={cv.ubicacion}
            onChange={(e) => cambiar('ubicacion', e.target.value)}
            placeholder="Buenos Aires, Argentina"
          />
          <Campo
            id="cv-linkedin"
            etiqueta="LinkedIn (opcional)"
            value={cv.linkedin}
            onChange={(e) => cambiar('linkedin', e.target.value)}
            placeholder="linkedin.com/in/tuusuario"
          />
        </div>
      </Bloque>

      {/* --- Resumen --- */}
      <Bloque
        titulo="Perfil profesional"
        descripcion="Tres o cuatro líneas contando quién sos y qué buscás. Usá las palabras del aviso al que te postulás."
      >
        <Campo
          id="cv-resumen"
          multilinea
          rows={5}
          value={cv.resumen}
          onChange={(e) => cambiar('resumen', e.target.value)}
          placeholder="Estudiante avanzado de Ingeniería en Informática con 2 años de experiencia en desarrollo web…"
          ayuda={`${cv.resumen.length} caracteres · lo ideal está entre 200 y 600`}
        />
      </Bloque>

      {/* --- Experiencia --- */}
      <Bloque
        titulo="Experiencia laboral"
        descripcion="Empezá cada descripción con un verbo de acción y cerrá con un número. Eso es lo que más levanta el puntaje."
        accion={
          <Boton
            variante="secundario"
            tamano="chico"
            onClick={() =>
              alCambiar({ ...cv, experiencias: [...cv.experiencias, experienciaVacia()] })
            }
          >
            + Agregar
          </Boton>
        }
      >
        {cv.experiencias.length === 0 ? (
          <p className="rounded-xl border border-dashed border-borde px-4 py-6 text-center text-sm text-texto-tenue">
            Todavía no cargaste ninguna experiencia.
          </p>
        ) : (
          <div className="space-y-5">
            {cv.experiencias.map((exp) => (
              <div key={exp.id} className="rounded-xl border border-borde p-4">
                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  <Campo
                    id={`puesto-${exp.id}`}
                    etiqueta="Puesto"
                    value={exp.puesto}
                    onChange={(e) => cambiarEnLista('experiencias', exp.id, 'puesto', e.target.value)}
                    placeholder="Desarrollador Web Junior"
                  />
                  <Campo
                    id={`empresa-${exp.id}`}
                    etiqueta="Empresa"
                    value={exp.empresa}
                    onChange={(e) => cambiarEnLista('experiencias', exp.id, 'empresa', e.target.value)}
                    placeholder="Nombre de la empresa"
                  />
                  <Campo
                    id={`desde-${exp.id}`}
                    etiqueta="Desde"
                    value={exp.desde}
                    onChange={(e) => cambiarEnLista('experiencias', exp.id, 'desde', e.target.value)}
                    placeholder="2023"
                  />
                  <div>
                    <Campo
                      id={`hasta-${exp.id}`}
                      etiqueta="Hasta"
                      value={exp.actual ? '' : exp.hasta}
                      disabled={exp.actual}
                      onChange={(e) => cambiarEnLista('experiencias', exp.id, 'hasta', e.target.value)}
                      placeholder="2024"
                    />
                    <label className="mt-2 flex items-center gap-2 text-sm text-texto-suave">
                      <input
                        type="checkbox"
                        checked={exp.actual}
                        onChange={(e) =>
                          cambiarEnLista('experiencias', exp.id, 'actual', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-borde-fuerte accent-acento"
                      />
                      Trabajo acá actualmente
                    </label>
                  </div>
                </div>

                <Campo
                  id={`desc-${exp.id}`}
                  etiqueta="Qué hiciste y qué lograste"
                  multilinea
                  rows={3}
                  value={exp.descripcion}
                  onChange={(e) =>
                    cambiarEnLista('experiencias', exp.id, 'descripcion', e.target.value)
                  }
                  placeholder="Desarrollé el módulo de facturación y reduje en un 40% el tiempo de carga…"
                />

                <div className="mt-3 flex justify-end">
                  <Boton
                    variante="fantasma"
                    tamano="chico"
                    onClick={() => quitarDeLista('experiencias', exp.id)}
                  >
                    Quitar
                  </Boton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Bloque>

      {/* --- Educación --- */}
      <Bloque
        titulo="Formación académica"
        accion={
          <Boton
            variante="secundario"
            tamano="chico"
            onClick={() => alCambiar({ ...cv, educacion: [...cv.educacion, educacionVacia()] })}
          >
            + Agregar
          </Boton>
        }
      >
        {cv.educacion.length === 0 ? (
          <p className="rounded-xl border border-dashed border-borde px-4 py-6 text-center text-sm text-texto-tenue">
            Todavía no cargaste tu formación.
          </p>
        ) : (
          <div className="space-y-4">
            {cv.educacion.map((edu) => (
              <div key={edu.id} className="rounded-xl border border-borde p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo
                    id={`titulo-${edu.id}`}
                    etiqueta="Título o carrera"
                    value={edu.titulo}
                    onChange={(e) => cambiarEnLista('educacion', edu.id, 'titulo', e.target.value)}
                    placeholder="Ingeniería en Informática"
                  />
                  <Campo
                    id={`institucion-${edu.id}`}
                    etiqueta="Institución"
                    value={edu.institucion}
                    onChange={(e) =>
                      cambiarEnLista('educacion', edu.id, 'institucion', e.target.value)
                    }
                    placeholder="Universidad del Salvador"
                  />
                  <Campo
                    id={`edu-desde-${edu.id}`}
                    etiqueta="Desde"
                    value={edu.desde}
                    onChange={(e) => cambiarEnLista('educacion', edu.id, 'desde', e.target.value)}
                    placeholder="2021"
                  />
                  <div>
                    <Campo
                      id={`edu-hasta-${edu.id}`}
                      etiqueta="Hasta"
                      value={edu.enCurso ? '' : edu.hasta}
                      disabled={edu.enCurso}
                      onChange={(e) => cambiarEnLista('educacion', edu.id, 'hasta', e.target.value)}
                      placeholder="2026"
                    />
                    <label className="mt-2 flex items-center gap-2 text-sm text-texto-suave">
                      <input
                        type="checkbox"
                        checked={edu.enCurso}
                        onChange={(e) =>
                          cambiarEnLista('educacion', edu.id, 'enCurso', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-borde-fuerte accent-acento"
                      />
                      En curso
                    </label>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <Boton
                    variante="fantasma"
                    tamano="chico"
                    onClick={() => quitarDeLista('educacion', edu.id)}
                  >
                    Quitar
                  </Boton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Bloque>

      {/* --- Habilidades --- */}
      <Bloque
        titulo="Habilidades"
        descripcion="Los sistemas automáticos cruzan estas palabras con las del aviso. Copiá las que aparezcan en la búsqueda a la que te postulás."
      >
        <div className="mb-3 flex gap-2">
          <input
            value={habilidadNueva}
            onChange={(e) => setHabilidadNueva(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregarHabilidad();
              }
            }}
            placeholder="Ej: JavaScript, Excel avanzado, Atención al cliente"
            className="flex-1 rounded-xl border border-borde bg-superficie px-3.5 py-2.5 text-sm text-texto transition placeholder:text-texto-tenue focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20"
          />
          <Boton variante="secundario" onClick={agregarHabilidad}>
            Agregar
          </Boton>
        </div>

        {cv.habilidades.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cv.habilidades.map((habilidad) => (
              <span
                key={habilidad}
                className="inline-flex items-center gap-1.5 rounded-lg bg-superficie-alt px-2.5 py-1 text-sm text-texto"
              >
                {habilidad}
                <button
                  onClick={() =>
                    alCambiar({
                      ...cv,
                      habilidades: cv.habilidades.filter((h) => h !== habilidad),
                    })
                  }
                  className="text-xs font-medium text-texto-tenue transition hover:text-acento"
                >
                  Quitar
                </button>
              </span>
            ))}
          </div>
        )}
      </Bloque>

      {/* --- Idiomas --- */}
      <Bloque titulo="Idiomas">
        <div className="mb-3 flex gap-2">
          <input
            value={idiomaNuevo}
            onChange={(e) => setIdiomaNuevo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregarIdioma();
              }
            }}
            placeholder="Ej: Inglés"
            className="flex-1 rounded-xl border border-borde bg-superficie px-3.5 py-2.5 text-sm text-texto transition placeholder:text-texto-tenue focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20"
          />
          <Boton variante="secundario" onClick={agregarIdioma}>
            Agregar
          </Boton>
        </div>

        {cv.idiomas.length > 0 && (
          <div className="space-y-2">
            {cv.idiomas.map((item, indice) => (
              <div key={`${item.idioma}-${indice}`} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-texto">{item.idioma}</span>
                <select
                  value={item.nivel}
                  onChange={(e) =>
                    alCambiar({
                      ...cv,
                      idiomas: cv.idiomas.map((i, pos) =>
                        pos === indice ? { ...i, nivel: e.target.value } : i
                      ),
                    })
                  }
                  className="rounded-lg border border-borde bg-superficie px-2.5 py-1.5 text-sm text-texto focus:border-acento focus:outline-none"
                >
                  {NIVELES_IDIOMA.map((nivel) => (
                    <option key={nivel} value={nivel}>
                      {nivel}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    alCambiar({ ...cv, idiomas: cv.idiomas.filter((_, pos) => pos !== indice) })
                  }
                  className="rounded-lg px-2 py-1.5 text-xs font-medium text-texto-tenue transition hover:text-acento"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </Bloque>

      {/* --- Plantilla --- */}
      <Bloque
        titulo="Plantilla"
        descripcion="Las tres están armadas en una sola columna y con texto real, que es lo que necesita un sistema automático para leerlas."
      >
        <div className="space-y-3">
          {PLANTILLAS.map((plantilla) => {
            const elegida = cv.plantilla === plantilla.id;
            return (
              <button
                key={plantilla.id}
                onClick={() => cambiar('plantilla', plantilla.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                  elegida
                    ? 'border-acento bg-acento-suave/40'
                    : 'border-borde hover:border-borde-fuerte'
                }`}
              >
                <span
                  className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    elegida ? 'border-acento bg-acento' : 'border-borde-fuerte'
                  }`}
                >
                  {elegida && <span className="h-1 w-1 rounded-full bg-acento-texto" />}
                </span>
                <div>
                  <p className="text-sm font-medium text-texto">{plantilla.nombre}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-texto-suave">
                    {plantilla.descripcion}
                  </p>
                  <p className="mt-1 text-xs text-texto-tenue">{plantilla.recomendada}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Bloque>
    </div>
  );
}

export default EditorCv;
