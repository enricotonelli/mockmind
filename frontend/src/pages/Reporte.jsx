import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sesiones as apiSesiones } from '../api';
import EtiquetaTipo from '../components/EtiquetaTipo';
import AnilloPuntaje from '../components/AnilloPuntaje';
import BarraDimension from '../components/BarraDimension';
import BurbujaMensaje from '../components/BurbujaMensaje';
import Tarjeta from '../components/Tarjeta';
import Boton from '../components/Boton';

// Las cuatro dimensiones de evaluación definidas en CLAUDE.md §7.
const DIMENSIONES = [
  {
    campo: 'puntajeClaridad',
    nombre: 'Claridad expositiva',
    descripcion: 'Qué tan comprensible y directa fue cada respuesta',
  },
  {
    campo: 'puntajeStar',
    nombre: 'Uso del método STAR',
    descripcion: 'Si estructuraste Situación, Tarea, Acción y Resultado',
  },
  {
    campo: 'puntajeEjemplos',
    nombre: 'Concreción de ejemplos',
    descripcion: 'Si respaldaste lo que decías con casos y datos reales',
  },
  {
    campo: 'puntajeCoherencia',
    nombre: 'Coherencia del discurso',
    descripcion: 'Si mantuviste consistencia a lo largo de la entrevista',
  },
];

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function Reporte() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [datos, setDatos] = useState(null);
  const [conversacion, setConversacion] = useState([]);
  const [verConversacion, setVerConversacion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;

    Promise.all([apiSesiones.obtenerReporte(id), apiSesiones.obtenerSesion(id)])
      .then(([resultado, { mensajes }]) => {
        if (!vigente) return;
        setDatos(resultado);
        setConversacion(mensajes);
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

  if (cargando) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 px-5 py-10 sm:px-8">
        <div className="esqueleto h-8 w-56" />
        <div className="esqueleto h-48 w-full" />
        <div className="esqueleto h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="mb-2 text-xl">No se pudo abrir el reporte</h1>
        <p className="mb-6 text-sm text-texto-suave">{error}</p>
        <Boton onClick={() => navegar('/')}>Volver al inicio</Boton>
      </div>
    );
  }

  const { reporte, sesion } = datos;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <button
        onClick={() => navegar('/historial')}
        className="mb-6 text-sm text-texto-suave transition hover:text-texto"
      >
        ← Volver al historial
      </button>

      <header className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <EtiquetaTipo tipo={sesion.tipoEntrevista} />
          <span className="text-xs text-texto-tenue">{formatearFecha(sesion.fecha)}</span>
          {sesion.duracion ? (
            <span className="text-xs text-texto-tenue">· {Math.round(sesion.duracion / 60)} min</span>
          ) : null}
        </div>
        <h1 className="mb-1.5 text-3xl font-semibold">Reporte de feedback</h1>
        <p className="text-[15px] leading-relaxed text-texto-suave">{sesion.puestoAplicado}</p>
      </header>

      {/* Puntaje general y dimensiones */}
      <Tarjeta className="mb-6">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <AnilloPuntaje puntaje={reporte.puntajeGeneral} />
          </div>

          <div className="w-full flex-1 space-y-5">
            {DIMENSIONES.map((dimension) => (
              <BarraDimension
                key={dimension.campo}
                nombre={dimension.nombre}
                descripcion={dimension.descripcion}
                puntaje={reporte[dimension.campo]}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-borde pt-4">
          <span className="text-sm text-texto-suave">Repreguntas que recibiste</span>
          <span className="font-serif text-xl font-semibold text-texto">
            {reporte.cantidadRepreguntas}
          </span>
        </div>
      </Tarjeta>

      {/* Análisis en palabras */}
      <Tarjeta className="mb-6">
        <h2 className="mb-3 text-xl">Análisis de la entrevista</h2>
        <p className="text-[15px] leading-relaxed text-texto-suave">{reporte.feedbackTexto}</p>
      </Tarjeta>

      {/* Sugerencias */}
      <Tarjeta className="mb-6">
        <h2 className="mb-4 text-xl">Cómo mejorar</h2>
        <ul className="space-y-3.5">
          {reporte.sugerencias.map((sugerencia, indice) => (
            <li key={indice} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-acento-suave text-xs font-semibold text-acento">
                {indice + 1}
              </span>
              <p className="text-[15px] leading-relaxed text-texto-suave">{sugerencia}</p>
            </li>
          ))}
        </ul>
      </Tarjeta>

      {/* Conversación completa, plegada por defecto */}
      <Tarjeta className="mb-8">
        <button
          onClick={() => setVerConversacion((previo) => !previo)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div>
            <h2 className="text-xl">Releer la conversación</h2>
            <p className="mt-0.5 text-sm text-texto-suave">
              {conversacion.length} mensajes intercambiados
            </p>
          </div>
          <span className="text-texto-tenue">{verConversacion ? '▲' : '▼'}</span>
        </button>

        {verConversacion && (
          <div className="animar-aparecer mt-6 space-y-6 border-t border-borde pt-6">
            {conversacion.map((mensaje) => (
              <BurbujaMensaje key={mensaje.id} mensaje={mensaje} />
            ))}
          </div>
        )}
      </Tarjeta>

      <div className="flex flex-wrap gap-3">
        <Boton tamano="grande" onClick={() => navegar('/entrevista/nueva')}>
          Practicar de nuevo
        </Boton>
        <Boton variante="secundario" tamano="grande" onClick={() => navegar('/historial')}>
          Ver mi evolución
        </Boton>
      </div>
    </div>
  );
}

export default Reporte;
