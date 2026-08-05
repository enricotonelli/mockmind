import { useState } from 'react';

// Gráfico de líneas dibujado a mano con SVG, para no sumar una librería de
// charts al proyecto (CLAUDE.md §10: sin dependencias innecesarias).

const ANCHO = 640;
const ALTO = 220;
const MARGEN = { arriba: 16, derecha: 16, abajo: 32, izquierda: 36 };

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function GraficoEvolucion({ sesiones = [] }) {
  const [activo, setActivo] = useState(null);

  // Se ordenan de la más antigua a la más reciente para leer la evolución.
  const puntos = [...sesiones]
    .filter((s) => typeof s.puntajeGeneral === 'number')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  if (puntos.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-texto-tenue">
        Necesitás al menos dos entrevistas finalizadas para ver tu evolución.
      </p>
    );
  }

  const anchoUtil = ANCHO - MARGEN.izquierda - MARGEN.derecha;
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;

  const x = (indice) =>
    MARGEN.izquierda + (puntos.length === 1 ? anchoUtil / 2 : (indice / (puntos.length - 1)) * anchoUtil);
  const y = (valor) => MARGEN.arriba + altoUtil - (valor / 100) * altoUtil;

  const linea = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.puntajeGeneral)}`).join(' ');
  const area = `${linea} L ${x(puntos.length - 1)} ${MARGEN.arriba + altoUtil} L ${x(0)} ${MARGEN.arriba + altoUtil} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="w-full min-w-[420px]"
        role="img"
        aria-label="Evolución del puntaje general a lo largo de las sesiones"
      >
        <defs>
          <linearGradient id="degradadoArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--acento))" stopOpacity="0.18" />
            <stop offset="100%" stopColor="rgb(var(--acento))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Líneas guía horizontales cada 25 puntos */}
        {[0, 25, 50, 75, 100].map((valor) => (
          <g key={valor}>
            <line
              x1={MARGEN.izquierda}
              y1={y(valor)}
              x2={ANCHO - MARGEN.derecha}
              y2={y(valor)}
              stroke="rgb(var(--borde))"
              strokeWidth="1"
              strokeDasharray={valor === 0 ? '0' : '3 4'}
            />
            <text
              x={MARGEN.izquierda - 8}
              y={y(valor) + 4}
              textAnchor="end"
              fontSize="11"
              fill="rgb(var(--texto-tenue))"
            >
              {valor}
            </text>
          </g>
        ))}

        <path d={area} fill="url(#degradadoArea)" />
        <path
          d={linea}
          fill="none"
          stroke="rgb(var(--acento))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {puntos.map((punto, i) => (
          <g key={punto.id}>
            <circle
              cx={x(i)}
              cy={y(punto.puntajeGeneral)}
              r={activo === i ? 7 : 5}
              fill="rgb(var(--superficie))"
              stroke="rgb(var(--acento))"
              strokeWidth="2.5"
              className="transition-all"
            />
            {/* Área invisible más grande para facilitar el hover */}
            <circle
              cx={x(i)}
              cy={y(punto.puntajeGeneral)}
              r="18"
              fill="transparent"
              onMouseEnter={() => setActivo(i)}
              onMouseLeave={() => setActivo(null)}
            />
            <text
              x={x(i)}
              y={ALTO - 10}
              textAnchor="middle"
              fontSize="11"
              fill="rgb(var(--texto-tenue))"
            >
              {formatearFecha(punto.fecha)}
            </text>
          </g>
        ))}

        {/* Etiqueta emergente del punto bajo el cursor */}
        {activo !== null && (
          <g transform={`translate(${x(activo)}, ${y(puntos[activo].puntajeGeneral) - 16})`}>
            <rect x="-58" y="-34" width="116" height="30" rx="8" fill="rgb(var(--texto))" />
            <text textAnchor="middle" y="-14" fontSize="12" fill="rgb(var(--fondo))">
              {puntos[activo].puntajeGeneral} · {puntos[activo].tipoEntrevista}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default GraficoEvolucion;
