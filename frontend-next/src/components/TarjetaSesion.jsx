'use client';

import { useRouter } from 'next/navigation';
import EtiquetaTipo from './EtiquetaTipo';

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatearDuracion(segundos) {
  if (!segundos) return null;
  const minutos = Math.round(segundos / 60);
  return `${minutos} min`;
}

function colorPuntaje(puntaje) {
  if (puntaje >= 75) return 'text-exito';
  if (puntaje >= 50) return 'text-alerta';
  return 'text-acento';
}

// La tarjeta no puede ser un <button> porque adentro lleva el botón de borrar
// (no se puede anidar un botón dentro de otro). Se usa un div con la zona
// principal clickeable.
function TarjetaSesion({ sesion, onEliminar }) {
  const router = useRouter();
  const duracion = formatearDuracion(sesion.duracion);

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-borde bg-superficie pr-3 transition hover:border-borde-fuerte hover:shadow-suave">
      <button
        onClick={() => router.push(`/reporte/${sesion.id}`)}
        className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <EtiquetaTipo tipo={sesion.tipoEntrevista} />
            <span className="text-xs text-texto-tenue">{formatearFecha(sesion.fecha)}</span>
            {duracion && <span className="text-xs text-texto-tenue">· {duracion}</span>}
          </div>
          <p className="truncate text-sm font-medium text-texto">{sesion.puestoAplicado}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className={`font-serif text-2xl font-semibold ${colorPuntaje(sesion.puntajeGeneral)}`}>
            {sesion.puntajeGeneral}
          </p>
          <p className="text-xs text-texto-tenue">puntos</p>
        </div>
      </button>

      {onEliminar && (
        <button
          onClick={() => onEliminar(sesion)}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-texto-tenue transition hover:bg-superficie-alt hover:text-acento"
        >
          Eliminar
        </button>
      )}
    </div>
  );
}

export default TarjetaSesion;
