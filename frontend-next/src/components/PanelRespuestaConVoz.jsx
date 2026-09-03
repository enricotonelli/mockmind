'use client';

import { useRef, useState } from 'react';
import { voz as apiVoz } from '../api';
import Boton from './Boton';
import EntradaVoz from './EntradaVoz';
import ReproductorAudio from './ReproductorAudio';

// Panel de respuesta que integra entrada de texto y voz
// onResponder: callback que recibe el texto de la respuesta
export default function PanelRespuestaConVoz({
  respuestaTexto = '',
  onRespuestaTextoChange = () => {},
  onResponder = () => {},
  deshabilitado = false,
  enProceso = false,
}) {
  const textareaRef = useRef(null);
  const [modo, setModo] = useState('texto'); // 'texto' o 'voz'
  const [audioGrabado, setAudioGrabado] = useState(null);
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [audioGenerado, setAudioGenerado] = useState(null);
  const [generandoAudio, setGenerandoAudio] = useState(false);
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

  async function manejarAudioGrabado(audioBlob) {
    try {
      setError('');
      setTranscribiendo(true);
      setAudioGrabado(audioBlob);

      // Transcribir el audio
      const texto = await apiVoz.transcribir(audioBlob);

      // Actualizar el campo de texto con la transcripción
      onRespuestaTextoChange(texto);

      // Cambiar a modo de revisión
      setModo('revision');
    } catch (err) {
      setError('Error al transcribir el audio: ' + err.message);
      setAudioGrabado(null);
    } finally {
      setTranscribiendo(false);
    }
  }

  async function generarAudio() {
    if (!respuestaTexto.trim()) {
      setError('Escribí algo para generar audio');
      return;
    }

    try {
      setError('');
      setGenerandoAudio(true);

      // Generar audio desde el texto
      const audioBlob = await apiVoz.hablar(respuestaTexto);
      setAudioGenerado(audioBlob);
    } catch (err) {
      setError('Error al generar audio: ' + err.message);
    } finally {
      setGenerandoAudio(false);
    }
  }

  function enviar() {
    const texto = respuestaTexto.trim();
    if (texto && !enProceso && !deshabilitado) {
      onResponder(texto);
    }
  }

  return (
    <div className="space-y-3">
      {/* Selector de modo */}
      <div className="flex gap-2 border-b border-borde">
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
        <button
          onClick={() => {
            setModo('voz');
            setError('');
          }}
          className={`px-3 py-2 text-sm font-medium transition ${
            modo === 'voz'
              ? 'border-b-2 border-acento text-texto'
              : 'text-texto-suave hover:text-texto'
          }`}
        >
          Grabar
        </button>
      </div>

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
                onClick={generarAudio}
                variante="secundario"
                tamano="pequeño"
                disabled={deshabilitado || generandoAudio}
                cargando={generandoAudio}
              >
                {generandoAudio ? 'Generando audio…' : 'Escuchar'}
              </Boton>
            )}
          </div>
        </div>
      )}

      {/* Modo de grabación */}
      {modo === 'voz' && modo !== 'revision' && (
        <div className="rounded-2xl border border-borde bg-superficie p-4">
          <EntradaVoz
            onAudioRecordado={manejarAudioGrabado}
            deshabilitado={deshabilitado || transcribiendo}
            duracionMaxSegundos={120}
          />
        </div>
      )}

      {/* Modo de revisión (después de transcribir) */}
      {modo === 'revision' && (
        <div className="space-y-3 rounded-2xl border border-borde bg-superficie p-4">
          <div>
            <p className="text-sm font-medium text-texto mb-2">Tu respuesta grabada:</p>
            {audioGrabado && (
              <ReproductorAudio
                audio={audioGrabado}
                titulo="Audio grabado"
                deshabilitado={deshabilitado}
              />
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-texto mb-2">Transcripción (editable):</p>
            <div className="rounded-lg bg-superficie-alt border border-borde p-3">
              <textarea
                value={respuestaTexto}
                onChange={(e) => onRespuestaTextoChange(e.target.value)}
                disabled={deshabilitado || transcribiendo}
                className="w-full resize-none bg-transparent text-sm leading-relaxed text-texto placeholder:text-texto-tenue focus:outline-none disabled:opacity-50"
                rows={3}
              />
            </div>
          </div>

          {audioGenerado && (
            <div>
              <p className="text-sm font-medium text-texto mb-2">Vista previa de audio:</p>
              <ReproductorAudio
                audio={audioGenerado}
                titulo="Preview de tu respuesta"
                deshabilitado={deshabilitado}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Boton
              onClick={enviar}
              disabled={!respuestaTexto.trim() || deshabilitado || enProceso}
            >
              Enviar respuesta
            </Boton>

            {!audioGenerado && (
              <Boton
                onClick={generarAudio}
                variante="secundario"
                disabled={deshabilitado || generandoAudio}
                cargando={generandoAudio}
              >
                {generandoAudio ? 'Generando audio…' : 'Generar audio'}
              </Boton>
            )}

            <Boton
              onClick={() => {
                setModo('voz');
                setAudioGrabado(null);
                setAudioGenerado(null);
                setRespuestaTexto('');
              }}
              variante="secundario"
              disabled={deshabilitado}
            >
              Grabar de nuevo
            </Boton>
          </div>
        </div>
      )}

      {/* Mostrar audio generado en modo texto */}
      {modo === 'texto' && audioGenerado && (
        <ReproductorAudio
          audio={audioGenerado}
          titulo="Audio generado de tu respuesta"
          deshabilitado={deshabilitado}
        />
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
