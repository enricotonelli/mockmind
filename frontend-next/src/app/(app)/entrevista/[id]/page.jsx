'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sesiones as apiSesiones } from '../../../../api';
import EtiquetaTipo from '../../../../components/EtiquetaTipo';
import BurbujaMensaje from '../../../../components/BurbujaMensaje';
import IndicadorEscribiendo from '../../../../components/IndicadorEscribiendo';
import Boton from '../../../../components/Boton';

const TOTAL_PREGUNTAS = 6;

function Entrevista() {
  const { id } = useParams();
  const router = useRouter();

  const [sesion, setSesion] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const [cargando, setCargando] = useState(true);
  const [pensando, setPensando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [terminada, setTerminada] = useState(false);
  const [error, setError] = useState('');
  const [progreso, setProgreso] = useState({ actual: 1, total: TOTAL_PREGUNTAS });

  const finalRef = useRef(null);
  const textareaRef = useRef(null);

  // Carga inicial de la conversación.
  useEffect(() => {
    let vigente = true;
    apiSesiones
      .obtenerSesion(id)
      .then(({ sesion: datos, mensajes: historial }) => {
        if (!vigente) return;
        setSesion(datos);
        setMensajes(historial);
        setTerminada(datos.finalizada);
        setProgreso({
          actual: (datos.indicePregunta ?? 0) + 1,
          total: datos.cantidadPreguntas || TOTAL_PREGUNTAS,
        });
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

  // Se mantiene la vista pegada al último mensaje.
  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, pensando]);

  // El textarea crece con el contenido, hasta un máximo.
  function ajustarAltura(elemento) {
    if (!elemento) return;
    elemento.style.height = 'auto';
    elemento.style.height = `${Math.min(elemento.scrollHeight, 200)}px`;
  }

  async function enviar() {
    const texto = respuesta.trim();
    if (!texto || pensando || terminada) return;

    setError('');
    setRespuesta('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Se muestra la respuesta del usuario de inmediato, sin esperar al motor.
    setMensajes((previos) => [
      ...previos,
      {
        id: `temporal-${Date.now()}`,
        rol: 'usuario',
        contenido: texto,
        timestamp: new Date().toISOString(),
      },
    ]);
    setPensando(true);

    try {
      const resultado = await apiSesiones.responder({ sesionId: id, respuesta: texto });
      setMensajes((previos) => [...previos, resultado.mensaje]);
      setProgreso(resultado.progreso);

      if (resultado.finalizada) {
        setTerminada(true);
        // Se genera el reporte y se lleva al usuario a verlo.
        setFinalizando(true);
        await apiSesiones.finalizarSesion(id);
        router.push(`/reporte/${id}`);
      }
    } catch (problema) {
      setError(problema.message);
    } finally {
      setPensando(false);
    }
  }

  // Enter envía, Shift+Enter hace un salto de línea.
  function alPresionarTecla(evento) {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      enviar();
    }
  }

  async function terminarAntes() {
    const hayRespuestas = mensajes.some((m) => m.rol === 'usuario');
    if (!hayRespuestas) {
      setError('Respondé al menos una pregunta antes de finalizar.');
      return;
    }

    setFinalizando(true);
    setError('');
    try {
      await apiSesiones.finalizarSesion(id);
      router.push(`/reporte/${id}`);
    } catch (problema) {
      setError(problema.message);
      setFinalizando(false);
    }
  }

  if (cargando) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-5 py-10">
        <div className="esqueleto h-6 w-48" />
        <div className="esqueleto h-20 w-full" />
        <div className="esqueleto h-16 w-3/4" />
      </div>
    );
  }

  if (error && !sesion) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="mb-2 text-xl">No se pudo abrir la entrevista</h1>
        <p className="mb-6 text-sm text-texto-suave">{error}</p>
        <Boton onClick={() => router.push('/')}>Volver al inicio</Boton>
      </div>
    );
  }

  const porcentaje = Math.min((progreso.actual / progreso.total) * 100, 100);

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col lg:h-screen">
      {/* Encabezado con el puesto y el progreso */}
      <header className="border-b border-borde bg-fondo px-5 py-3 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <EtiquetaTipo tipo={sesion.tipoEntrevista} />
              <span className="text-xs text-texto-tenue">
                Pregunta {Math.min(progreso.actual, progreso.total)} de {progreso.total}
              </span>
            </div>
            <p className="truncate text-sm text-texto-suave">{sesion.puestoAplicado}</p>
          </div>

          {!terminada && (
            <Boton variante="secundario" tamano="chico" onClick={terminarAntes} disabled={finalizando}>
              Finalizar
            </Boton>
          )}
        </div>

        <div className="mx-auto mt-3 max-w-3xl">
          <div className="h-1 overflow-hidden rounded-full bg-superficie-alt">
            <div
              className="h-full rounded-full bg-acento"
              style={{ width: `${porcentaje}%`, transition: 'width 500ms ease-out' }}
            />
          </div>
        </div>
      </header>

      {/* Conversación */}
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {mensajes.map((mensaje) => (
            <BurbujaMensaje key={mensaje.id} mensaje={mensaje} />
          ))}

          {pensando && <IndicadorEscribiendo />}

          {finalizando && (
            <div className="animar-aparecer rounded-2xl border border-borde bg-superficie-alt px-4 py-3 text-center">
              <p className="text-sm text-texto-suave">
                Analizando tus respuestas y preparando el reporte…
              </p>
            </div>
          )}

          <div ref={finalRef} />
        </div>
      </div>

      {/* Cuadro de respuesta */}
      <div className="border-t border-borde bg-fondo px-5 py-4 sm:px-8">
        <div className="mx-auto max-w-3xl">
          {error && <p className="mb-2 text-sm text-acento">{error}</p>}

          <div className="flex items-end gap-2 rounded-2xl border border-borde bg-superficie p-2 transition focus-within:border-acento focus-within:ring-2 focus-within:ring-acento/20">
            <textarea
              ref={textareaRef}
              rows={1}
              value={respuesta}
              disabled={pensando || terminada || finalizando}
              onChange={(e) => {
                setRespuesta(e.target.value);
                ajustarAltura(e.target);
              }}
              onKeyDown={alPresionarTecla}
              placeholder={
                terminada ? 'La entrevista terminó' : 'Escribí tu respuesta…'
              }
              className="max-h-[200px] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm leading-relaxed text-texto placeholder:text-texto-tenue focus:outline-none disabled:opacity-50"
            />

            <button
              onClick={enviar}
              disabled={!respuesta.trim() || pensando || terminada || finalizando}
              className="flex h-9 shrink-0 items-center justify-center rounded-xl bg-acento px-4 text-sm font-medium text-acento-texto transition hover:brightness-110 disabled:opacity-30"
            >
              Enviar
            </button>
          </div>

          <p className="mt-2 px-1 text-xs text-texto-tenue">
            Enter para enviar · Shift + Enter para hacer un salto de línea
          </p>
        </div>
      </div>
    </div>
  );
}

export default Entrevista;
