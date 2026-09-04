'use client';

import { useRef, useState, useEffect } from 'react';
import Boton from './Boton';

// Captura la respuesta hablada con la Web Speech API del navegador (STT
// nativo, gratis) y emite el texto transcripto por onTranscripcion. No graba
// ni sube ningún archivo de audio — todo pasa en el cliente.
export default function EntradaVoz({ onTranscripcion, deshabilitado = false, duracionMaxSegundos = 60 }) {
  const reconocimientoRef = useRef(null);
  const transcriptRef = useRef('');
  const timerRef = useRef(null);
  const [grabando, setGrabando] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [error, setError] = useState('');
  const [soportado, setSoportado] = useState(true);

  useEffect(() => {
    const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Reconocimiento) setSoportado(false);

    return () => {
      if (reconocimientoRef.current) reconocimientoRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function iniciarGrabacion() {
    const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Reconocimiento) {
      setError('Tu navegador no soporta reconocimiento de voz. Probá con Chrome o Edge.');
      return;
    }

    setError('');
    setTiempoTranscurrido(0);
    transcriptRef.current = '';

    const reconocimiento = new Reconocimiento();
    reconocimiento.lang = 'es-AR';
    reconocimiento.continuous = true;
    reconocimiento.interimResults = false;

    reconocimiento.onresult = (evento) => {
      let textoNuevo = '';
      for (let i = evento.resultIndex; i < evento.results.length; i += 1) {
        textoNuevo += evento.results[i][0].transcript;
      }
      transcriptRef.current = `${transcriptRef.current} ${textoNuevo}`.trim();
    };

    reconocimiento.onerror = (evento) => {
      // 'no-speech' salta seguido cuando hay un silencio breve; no cortar la
      // grabación por eso, solo cuando es un error real (mic denegado, etc).
      if (evento.error === 'no-speech') return;
      setError('Error al reconocer la voz: ' + evento.error);
      detenerGrabacion();
    };

    reconocimiento.onend = () => {
      setGrabando(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (onTranscripcion) onTranscripcion(transcriptRef.current);
    };

    reconocimiento.start();
    reconocimientoRef.current = reconocimiento;
    setGrabando(true);

    let segundos = 0;
    timerRef.current = setInterval(() => {
      segundos += 1;
      setTiempoTranscurrido(segundos);
      if (segundos >= duracionMaxSegundos) {
        detenerGrabacion();
      }
    }, 1000);
  }

  function detenerGrabacion() {
    if (reconocimientoRef.current) {
      reconocimientoRef.current.stop();
    }
  }

  const porcentajeUsado = (tiempoTranscurrido / duracionMaxSegundos) * 100;

  if (!soportado) {
    return (
      <div className="rounded-lg bg-acento/10 border border-acento/30 px-3 py-2">
        <p className="text-xs text-acento">
          Tu navegador no soporta reconocimiento de voz. Probá con Chrome, Edge o Safari recientes,
          o usá el modo &quot;Escribir&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {grabando ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-acento animate-pulse">
              <div className="h-3 w-3 rounded-full bg-acento-texto"></div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-texto">Escuchando...</div>
              <div className="text-xs text-texto-suave">{tiempoTranscurrido}s / {duracionMaxSegundos}s</div>
              <div className="mt-1 h-1 w-full bg-superficie rounded-full overflow-hidden">
                <div
                  className="h-full bg-acento transition-all"
                  style={{ width: `${porcentajeUsado}%` }}
                ></div>
              </div>
            </div>
            <Boton
              variante="secundario"
              tamano="pequeño"
              onClick={detenerGrabacion}
              disabled={deshabilitado}
            >
              Detener
            </Boton>
          </>
        ) : (
          <Boton
            onClick={iniciarGrabacion}
            disabled={deshabilitado}
            className="w-full"
          >
            Grabar respuesta
          </Boton>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-acento/10 border border-acento/30 px-3 py-2">
          <p className="text-xs text-acento">{error}</p>
        </div>
      )}
    </div>
  );
}
