'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cv as apiCv, analizarCv } from '../../../../api';
import EditorCv from '../../../../components/cv/EditorCv';
import VistaPreviaCv from '../../../../components/cv/VistaPreviaCv';
import PanelAts from '../../../../components/cv/PanelAts';
import Boton from '../../../../components/Boton';

const PESTANAS = [
  { id: 'editar', etiqueta: 'Editar' },
  { id: 'vista', etiqueta: 'Vista previa' },
  { id: 'ats', etiqueta: 'Compatibilidad ATS' },
];

function EditarCv() {
  const { id } = useParams();
  const router = useRouter();

  const [cv, setCv] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardadoEn, setGuardadoEn] = useState(null);
  const [error, setError] = useState('');
  const [pestana, setPestana] = useState('editar');

  // Evita guardar apenas se carga el CV, antes de que el usuario toque nada.
  const primeraCarga = useRef(true);

  useEffect(() => {
    let vigente = true;
    apiCv
      .obtenerCv(id)
      .then((datos) => {
        if (vigente) setCv(datos);
      })
      .catch((problema) => {
        if (vigente) setError(problema.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [id]);

  // Guardado automático: espera a que el usuario deje de escribir.
  useEffect(() => {
    if (!cv) return;
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }

    const temporizador = setTimeout(async () => {
      setGuardando(true);
      try {
        await apiCv.guardarCv(cv);
        setGuardadoEn(new Date());
      } catch (problema) {
        setError(problema.message);
      } finally {
        setGuardando(false);
      }
    }, 900);

    return () => clearTimeout(temporizador);
  }, [cv]);

  const analisis = useMemo(() => (cv ? analizarCv(cv) : null), [cv]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-5xl space-y-5 px-5 py-10 sm:px-8">
        <div className="esqueleto h-8 w-48" />
        <div className="esqueleto h-96 w-full" />
      </div>
    );
  }

  if (error && !cv) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="mb-2 text-xl">No se pudo abrir el CV</h1>
        <p className="mb-6 text-sm text-texto-suave">{error}</p>
        <Boton onClick={() => router.push('/cv')}>Volver a mis CVs</Boton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      {/* Encabezado: no se imprime */}
      <div className="no-imprimir">
        <button
          onClick={() => router.push('/cv')}
          className="mb-5 text-sm text-texto-suave transition hover:text-texto"
        >
          Mis CVs
        </button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">
              {cv.nombre ? `CV de ${cv.nombre}` : 'Tu CV'}
            </h1>
            <p className="mt-0.5 text-sm text-texto-tenue">
              {guardando
                ? 'Guardando…'
                : guardadoEn
                  ? `Guardado a las ${guardadoEn.toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'Los cambios se guardan solos'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-lg px-2.5 py-1 text-sm font-medium ${
                analisis.puntajeGeneral >= 60
                  ? 'bg-exito/15 text-exito'
                  : 'bg-alerta/15 text-alerta'
              }`}
            >
              ATS {analisis.puntajeGeneral}/100
            </span>
            <Boton
              variante="secundario"
              onClick={() => window.print()}
              title='Se abre el diálogo de impresión: elegí "Guardar como PDF" como destino'
            >
              Descargar PDF
            </Boton>
          </div>
        </div>

        <p className="mb-6 text-xs text-texto-tenue">
          «Descargar PDF» abre el diálogo de impresión de tu navegador: elegí{' '}
          <strong className="font-medium text-texto-suave">Guardar como PDF</strong> como
          destino para obtener el archivo.
        </p>

        {/* Pestañas */}
        <div className="mb-6 flex gap-1 border-b border-borde">
          {PESTANAS.map((item) => (
            <button
              key={item.id}
              onClick={() => setPestana(item.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition ${
                pestana === item.id
                  ? 'border-acento font-medium text-texto'
                  : 'border-transparent text-texto-suave hover:text-texto'
              }`}
            >
              {item.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {/* En pantallas grandes se muestran editor y vista previa lado a lado */}
      <div className="lg:grid lg:grid-cols-[1fr_460px] lg:gap-8">
        <div className={`no-imprimir ${pestana === 'editar' ? '' : 'hidden lg:block'}`}>
          {pestana === 'ats' ? (
            <div className="rounded-2xl border border-borde bg-superficie p-5 lg:hidden">
              <PanelAts analisis={analisis} />
            </div>
          ) : (
            <EditorCv cv={cv} alCambiar={setCv} />
          )}
        </div>

        <div className={pestana === 'editar' ? 'hidden lg:block' : ''}>
          <div className="lg:sticky lg:top-8 lg:space-y-6">
            {/* Vista previa */}
            <div
              className={`zona-impresion overflow-hidden rounded-2xl border border-borde shadow-suave ${
                pestana === 'ats' ? 'hidden lg:block' : ''
              }`}
            >
              <VistaPreviaCv cv={cv} />
            </div>

            {/* Análisis ATS, siempre visible en pantallas grandes */}
            <div className="no-imprimir hidden rounded-2xl border border-borde bg-superficie p-5 lg:block">
              <PanelAts analisis={analisis} />
            </div>

            {pestana === 'ats' && (
              <div className="no-imprimir rounded-2xl border border-borde bg-superficie p-5 lg:hidden">
                <PanelAts analisis={analisis} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditarCv;
