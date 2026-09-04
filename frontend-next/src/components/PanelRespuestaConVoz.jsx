'use client';

import { useRef, useState } from 'react';
import Boton from './Boton';
import EntradaVoz from './EntradaVoz';

// Panel de respuesta que integra entrada de voz y texto. STT y TTS corren
// 100% en el navegador con la Web Speech API (gratis, sin backend) — ver
// EntradaVoz.jsx para la grabación y hablar() acá abajo para la lectura.
//
// La voz es el modo por defecto: la entrevista se piensa como una
// conversación hablada primero, con la opción de escribir como alternativa.
export default function PanelRespuestaConVoz({
  respuestaTexto = '',
  onRespuestaTextoChange = () => {},
  onResponder = () => {},
  deshabilitado = false,
  enProceso = false,
  dispararGrabacion,
  cuentaRegresiva = null,
}) {
  const textareaRef = useRef(null);
  const [modo, setModo] = useState('voz'); // 'voz' | 'texto' | 'revision'
  const [hablando, setHablando] = useState(false);
  const [error, setError] = useState('');

  function ajustarAltura(elemento) {
    if (!elemento) return;
    elemento.style.height = 'auto';
    elemento.style.height = `${Math.min(elemento.scrollHeight, 200)}px`;
  }

  function alPresionarTecla(evento) {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      enviar();
    }
  }

  function manejarTranscripcion(texto) {
    if (!texto || !texto.trim()) {
      setError('No se detectó ninguna voz. Probá de nuevo.');
      return;
    }
    setError('');
    onRespuestaTextoChange(texto);
    setModo('revision');
  }

  function hablar() {
    if (!respuestaTexto.trim()) {
      setError('Escribí algo para escuchar');
      return;
    }
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setError('Tu navegador no soporta síntesis de voz.');
      return;
    }

    setError('');
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(respuestaTexto);
    utterance.lang = 'es-AR';
    utterance.rate = 0.95;
    utterance.onstart = () => setHablando(true);
    utterance.onend = () => setHablando(false);
    utterance.onerror = () => setHablando(false);

    window.speechSynthesis.speak(utterance);
  }

  function detenerHabla() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setHablando(false);
  }

  function enviar() {
    const texto = respuestaTexto.trim();
    if (texto && !enProceso && !deshabilitado) {
      onResponder(texto);
    }
  }

  return (
    <div className="space-y-3">
      {/* Selector de modo: Grabar primero, es la forma principal de responder */}
      <div className="flex gap-2 border-b border-borde">
        <button
          onClick={() => {
            setModo('voz');
            setError('');
          }}
          className={`px-3 py-2 text-sm font-medium transition ${
            modo === 'voz' || modo === 'revision'
              ? 'border-b-2 border-acento text-texto'
              : 'text-texto-suave hover:text-texto'
          }`}
        >
          Grabar
        </button>
        <button
          onClick={() => {
            setModo('texto');
            setError('');
          }}
          className={`px-3 py-2 text-sm font-medium transition ${
            modo === 'texto'
              ? 'border-b-2 border-acento text-texto'
              : 'text-texto-suave hover:text-texto'
          }`}
        >
          Escribir
        </button>
      </div>

      {/* Modo de grabación */}
      {modo === 'voz' && (
        <div className="rounded-2xl border border-borde bg-superficie p-4">
          <EntradaVoz
            onTranscripcion={manejarTranscripcion}
            deshabilitado={deshabilitado}
            duracionMaxSegundos={120}
            dispararGrabacion={dispararGrabacion}
            cuentaRegresiva={cuentaRegresiva}
          />
        </div>
      )}

      {/* Modo de escritura */}
      {modo === 'texto' && (
        <div className="space-y-2 rounded-2xl border border-borde bg-superficie p-2 transition focus-within:border-acento focus-within:ring-2 focus-within:ring-acento/20">
          <textarea
            ref={textareaRef}
            rows={1}
            value={respuestaTexto}
            disabled={deshabilitado || enProceso}
            onChange={(e) => {
              onRespuestaTextoChange(e.target.value);
              ajustarAltura(e.target);
            }}
            onKeyDown={alPresionarTecla}
            placeholder="Escribí tu respuesta…"
            className="max-h-[200px] w-full resize-none bg-transparent px-2.5 py-2 text-sm leading-relaxed text-texto placeholder:text-texto-tenue focus:outline-none disabled:opacity-50"
          />

          <div className="flex items-center gap-2 px-1">
            <Boton
              onClick={enviar}
              disabled={!respuestaTexto.trim() || deshabilitado || enProceso}
              tamano="pequeño"
            >
              Enviar
            </Boton>

            {respuestaTexto.trim() && (
              <Boton
                onClick={hablando ? detenerHabla : hablar}
                variante="secundario"
                tamano="pequeño"
                disabled={deshabilitado}
              >
                {hablando ? 'Detener' : 'Escuchar'}
              </Boton>
            )}
          </div>
        </div>
      )}

      {/* Modo de revisión (después de transcribir) */}
      {modo === 'revision' && (
        <div className="space-y-3 rounded-2xl border border-borde bg-superficie p-4">
          <div>
            <p className="text-sm font-medium text-texto mb-2">Transcripción (editable):</p>
            <div className="rounded-lg bg-superficie-alt border border-borde p-3">
              <textarea
                value={respuestaTexto}
                onChange={(e) => onRespuestaTextoChange(e.target.value)}
                disabled={deshabilitado}
                className="w-full resize-none bg-transparent text-sm leading-relaxed text-texto placeholder:text-texto-tenue focus:outline-none disabled:opacity-50"
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Boton
              onClick={enviar}
              disabled={!respuestaTexto.trim() || deshabilitado || enProceso}
            >
              Enviar respuesta
            </Boton>

            <Boton
              onClick={hablando ? detenerHabla : hablar}
              variante="secundario"
              disabled={deshabilitado || !respuestaTexto.trim()}
            >
              {hablando ? 'Detener' : 'Escuchar'}
            </Boton>

            <Boton
              onClick={() => {
                setModo('voz');
                onRespuestaTextoChange('');
              }}
              variante="secundario"
              disabled={deshabilitado}
            >
              Grabar de nuevo
            </Boton>
          </div>
        </div>
      )}

      {/* Mostrar errores */}
      {error && (
        <div className="rounded-lg bg-acento/10 border border-acento/30 px-3 py-2">
          <p className="text-xs text-acento">{error}</p>
        </div>
      )}

      {/* Instrucciones */}
      {modo === 'texto' && (
        <p className="px-1 text-xs text-texto-tenue">
          Enter para enviar · Shift + Enter para hacer un salto de línea
        </p>
      )}
    </div>
  );
}
