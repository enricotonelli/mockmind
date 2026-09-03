'use client';

// "El entrevistador está escribiendo…" mientras se genera la próxima pregunta.

function IndicadorEscribiendo() {
  return (
    <div className="animar-aparecer flex gap-3">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-acento text-sm font-semibold text-acento-texto"
        aria-hidden="true"
      >
        M
      </div>

      <div className="flex items-center gap-1.5 pt-2.5" aria-label="El entrevistador está escribiendo">
        {[0, 1, 2].map((indice) => (
          <span
            key={indice}
            className="punto-escribiendo h-2 w-2 rounded-full bg-texto-suave"
            style={{ animationDelay: `${indice * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default IndicadorEscribiendo;