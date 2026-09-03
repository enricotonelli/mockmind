'use client';

import { useRef, useState, useEffect } from 'react';
import Boton from './Boton';

// Componente para capturar audio del micrófono del usuario
// Emite onAudioRecordado con un Blob de audio cuando termina la grabación
export default function EntradaVoz({ onAudioRecordado, deshabilitado = false, duracionMaxSegundos = 60 }) {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const [grabando, setGrabando] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  // Limpiar recursos cuando se desmonta
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  async function iniciarGrabacion() {
    try {
      setError('');
      setTiempoTranscurrido(0);

      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Crear MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        // Crear un blob con el audio grabado
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });

        // Detener todos los tracks del micrófono
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        // Llamar al callback con el audio
        if (onAudioRecordado) {
          onAudioRecordado(audioBlob);
        }

        setGrabando(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorder.start();
      setGrabando(true);

      // Iniciar timer
      let segundos = 0;
      timerRef.current = setInterval(() => {
        segundos += 1;
        setTiempoTranscurrido(segundos);

        // Detener automáticamente si se llega al máximo
        if (segundos >= duracionMaxSegundos) {
          mediaRecorder.stop();
          clearInterval(timerRef.current);
        }
      }, 1000);
    } catch (err) {
      setError(
        err.name === 'NotAllowedError'
          ? 'No tienes permiso para acceder al micrófono'
          : 'Error al acceder al micrófono: ' + err.message
      );
      setGrabando(false);
    }
  }

  function detenerGrabacion() {
    if (mediaRecorderRef.current && grabando) {
      mediaRecorderRef.current.stop();
    }
  }

  const porcentajeUsado = (tiempoTranscurrido / duracionMaxSegundos) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {grabando ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-acento animate-pulse">
              <div className="h-3 w-3 rounded-full bg-acento-texto"></div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-texto">Grabando...</div>
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
