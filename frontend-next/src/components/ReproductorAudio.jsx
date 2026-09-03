'use client';

import { useRef, useState, useEffect } from 'react';
import Boton from './Boton';

// Componente para reproducir audio
// Recibe un Blob o URL de audio
export default function ReproductorAudio({ audio, titulo = 'Audio', deshabilitado = false }) {
  const audioRef = useRef(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [duracion, setDuracion] = useState(0);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [error, setError] = useState('');

  // Crear URL del audio si es un Blob
  const urlAudio = audio instanceof Blob ? URL.createObjectURL(audio) : audio;

  useEffect(() => {
    const elemento = audioRef.current;
    if (!elemento) return;

    const actualizarTiempo = () => {
      setTiempoActual(elemento.currentTime);
    };

    const actualizarDuracion = () => {
      setDuracion(elemento.duration);
    };

    const handleEnded = () => {
      setReproduciendo(false);
    };

    elemento.addEventListener('timeupdate', actualizarTiempo);
    elemento.addEventListener('loadedmetadata', actualizarDuracion);
    elemento.addEventListener('ended', handleEnded);

    return () => {
      elemento.removeEventListener('timeupdate', actualizarTiempo);
      elemento.removeEventListener('loadedmetadata', actualizarDuracion);
      elemento.removeEventListener('ended', handleEnded);
    };
  }, []);

  function reproducir() {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        setError('Error al reproducir el audio: ' + err.message);
      });
      setReproduciendo(true);
    }
  }

  function pausar() {
    if (audioRef.current) {
      audioRef.current.pause();
      setReproduciendo(false);
    }
  }

  function cambiarTiempo(nuevoTiempo) {
    if (audioRef.current) {
      audioRef.current.currentTime = nuevoTiempo;
    }
  }

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const secs = Math.floor(segundos % 60);
    return `${minutos}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audio) return null;

  return (
    <div className="space-y-3 rounded-lg bg-superficie border border-borde p-4">
      <audio ref={audioRef} src={urlAudio} />

      <div>
        <p className="text-sm font-medium text-texto">{titulo}</p>
      </div>

      <div className="flex items-center gap-3">
        {reproduciendo ? (
          <Boton variante="secundario" tamano="pequeño" onClick={pausar} disabled={deshabilitado}>
            Pausar
          </Boton>
        ) : (
          <Boton variante="secundario" tamano="pequeño" onClick={reproducir} disabled={deshabilitado}>
            Reproducir
          </Boton>
        )}

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duracion || 0}
            value={tiempoActual}
            onChange={(e) => cambiarTiempo(Number(e.target.value))}
            className="w-full h-1 bg-borde rounded-lg cursor-pointer accent-acento"
            disabled={deshabilitado}
          />
        </div>

        <span className="text-xs text-texto-tenue w-12 text-right">
          {formatearTiempo(tiempoActual)} / {formatearTiempo(duracion)}
        </span>
      </div>

      {error && (
        <div className="rounded-lg bg-acento/10 border border-acento/30 px-3 py-2">
          <p className="text-xs text-acento">{error}</p>
        </div>
      )}
    </div>
  );
}
