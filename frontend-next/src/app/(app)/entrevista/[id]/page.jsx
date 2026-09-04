'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sesiones as apiSesiones } from '../../../../api';
import EtiquetaTipo from '../../../../components/EtiquetaTipo';
import BurbujaMensaje from '../../../../components/BurbujaMensaje';
import IndicadorEscribiendo from '../../../../components/IndicadorEscribiendo';
import PanelRespuestaConVoz from '../../../../components/PanelRespuestaConVoz';
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

  // Narración automática de la pregunta del entrevistador (Web Speech API,
  // TTS) con resaltado de texto tipo karaoke, y cuenta regresiva antes de
  // arrancar solo a grabar la respuesta del usuario.
  const [idNarrando, setIdNarrando] = useState(null);
  const [rangoNarrado, setRangoNarrado] = useState([0, 0]);
  const [cuentaRegresiva, setCuentaRegresiva] = useState(null);
  const [dispararGrabacion, setDispararGrabacion] = useState(0);
  const narradosRef = useRef(new Set());
  const cuentaRegresivaRef = useRef(null);

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

  // Arranca la cuenta regresiva de 5s y, al llegar a 0, dispara la
  // grabación automática de la respuesta (EntradaVoz la escucha vía
  // dispararGrabacion).
  function iniciarCuentaRegresiva() {
    if (cuentaRegresivaRef.current) clearInterval(cuentaRegresivaRef.current);

    let restante = 5;
    setCuentaRegresiva(restante);
    cuentaRegresivaRef.current = setInterval(() => {
      restante -= 1;
      if (restante <= 0) {
        clearInterval(cuentaRegresivaRef.current);
        cuentaRegresivaRef.current = null;
        setCuentaRegresiva(null);
        setDispararGrabacion((n) => n + 1);
      } else {
        setCuentaRegresiva(restante);
      }
    }, 1000);
  }

  // Apenas aparece una pregunta nueva del entrevistador (recién cargada o
  // recién respondida), la lee en voz alta con resaltado tipo karaoke y,
  // cuando termina, arranca la cuenta regresiva para grabar solo.
  useEffect(() => {
    if (terminada || finalizando || !mensajes.length) return;

    const ultimo = mensajes[mensajes.length - 1];
    if (ultimo.rol !== 'entrevistador' || narradosRef.current.has(ultimo.id)) return;
    narradosRef.current.add(ultimo.id);

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      iniciarCuentaRegresiva();
      return;
    }

    window.speechSynthesis.cancel();
    setIdNarrando(ultimo.id);
    setRangoNarrado([0, 0]);

    const utterance = new SpeechSynthesisUtterance(ultimo.contenido);
    utterance.lang = 'es-AR';
    utterance.rate = 0.95;
    utterance.onboundary = (evento) => {
      const inicio = evento.charIndex ?? 0;
      let fin = ultimo.contenido.indexOf(' ', inicio);
      if (fin === -1) fin = ultimo.contenido.length;
      setRangoNarrado([inicio, fin]);
    };
    utterance.onend = () => {
      setIdNarrando(null);
      iniciarCuentaRegresiva();
    };
    utterance.onerror = () => {
      setIdNarrando(null);
      iniciarCuentaRegresiva();
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensajes, terminada, finalizando]);

  // Limpieza al salir de la pantalla: no dejar la síntesis de voz ni la
  // cuenta regresiva corriendo de fondo.
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (cuentaRegresivaRef.current) clearInterval(cuentaRegresivaRef.current);
    };
  }, []);

  // El textarea crece con el contenido, hasta un máximo.
  function ajustarAltura(elemento) {
    if (!elemento) return;
    elemento.style.height = 'auto';
    elemento.style.height = `${Math.min(elemento.scrollHeight, 200)}px`;
  }

  async function enviar() {
    const texto = respuesta.trim();
    if (!texto || pensando || terminada) return;

    // Si el usuario ya contestó, no hace falta seguir leyendo la pregunta
    // ni arrancar la grabación sola.
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (cuentaRegresivaRef.current) {
      clearInterval(cuentaRegresivaRef.current);
      cuentaRegresivaRef.current = null;
    }
    setCuentaRegresiva(null);
    setIdNarrando(null);

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
            <BurbujaMensaje
              key={mensaje.id}
              mensaje={mensaje}
              narrando={mensaje.id === idNarrando}
              rangoNarrado={rangoNarrado}
            />
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

      {/* Panel de respuesta (texto o voz) */}
      <div className="border-t border-borde bg-fondo px-5 py-4 sm:px-8">
        <div className="mx-auto max-w-3xl">
          {error && <p className="mb-2 text-sm text-acento">{error}</p>}

          <PanelRespuestaConVoz
            respuestaTexto={respuesta}
            onRespuestaTextoChange={setRespuesta}
            onResponder={enviar}
            deshabilitado={pensando || terminada || finalizando}
            enProceso={pensando || finalizando}
            dispararGrabacion={dispararGrabacion}
            cuentaRegresiva={cuentaRegresiva}
          />
        </div>
      </div>
    </div>
  );
}

export default Entrevista;
