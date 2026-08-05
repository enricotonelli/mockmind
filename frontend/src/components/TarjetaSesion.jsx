import { useNavigate } from 'react-router-dom';
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

function TarjetaSesion({ sesion }) {
  const navegar = useNavigate();
  const duracion = formatearDuracion(sesion.duracion);

  return (
    <button
      onClick={() => navegar(`/reporte/${sesion.id}`)}
      className="flex w-full items-center gap-4 rounded-2xl border border-borde bg-superficie p-4 text-left transition hover:border-borde-fuerte hover:shadow-suave"
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
  );
}

export default TarjetaSesion;
