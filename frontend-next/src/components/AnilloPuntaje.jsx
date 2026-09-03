'use client';

// Anillo circular de progreso dibujado con SVG, sin librerías externas.

function colorSegunPuntaje(puntaje) {
  if (puntaje >= 75) return 'rgb(var(--exito))';
  if (puntaje >= 50) return 'rgb(var(--alerta))';
  return 'rgb(var(--acento))';
}

function AnilloPuntaje({ puntaje = 0, tamano = 160, etiqueta = 'Puntaje general' }) {
  const grosor = tamano / 12;
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const avance = circunferencia * (1 - Math.min(Math.max(puntaje, 0), 100) / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: tamano, height: tamano }}>
        <svg width={tamano} height={tamano} className="-rotate-90">
          <circle
            cx={tamano / 2}
            cy={tamano / 2}
            r={radio}
            fill="none"
            stroke="rgb(var(--borde))"
            strokeWidth={grosor}
          />
          <circle
            cx={tamano / 2}
            cy={tamano / 2}
            r={radio}
            fill="none"
            stroke={colorSegunPuntaje(puntaje)}
            strokeWidth={grosor}
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={avance}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-serif font-semibold text-texto"
            style={{ fontSize: tamano / 3.5 }}
          >
            {Math.round(puntaje)}
          </span>
          <span className="text-xs text-texto-tenue">de 100</span>
        </div>
      </div>

      {etiqueta && <p className="text-sm text-texto-suave">{etiqueta}</p>}
    </div>
  );
}

export default AnilloPuntaje;