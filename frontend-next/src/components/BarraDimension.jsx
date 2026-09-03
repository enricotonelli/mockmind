'use client';

// Barra horizontal de una dimensión del reporte, con animación de llenado.

function colorSegunPuntaje(puntaje) {
  if (puntaje >= 75) return 'bg-exito';
  if (puntaje >= 50) return 'bg-alerta';
  return 'bg-acento';
}

function BarraDimension({ nombre, descripcion, puntaje }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-texto">{nombre}</span>
        <span className="font-serif text-lg text-texto">{Math.round(puntaje)}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-superficie-alt">
        <div
          className={`h-full rounded-full ${colorSegunPuntaje(puntaje)}`}
          style={{
            width: `${Math.min(Math.max(puntaje, 0), 100)}%`,
            transition: 'width 900ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>

      {descripcion && <p className="mt-1.5 text-xs text-texto-tenue">{descripcion}</p>}
    </div>
  );
}

export default BarraDimension;