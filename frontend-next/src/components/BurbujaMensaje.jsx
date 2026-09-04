'use client';

// Mensaje del chat. El entrevistador se muestra como texto suelto con avatar
// (estilo Claude Desktop) y el usuario dentro de una burbuja.
//
// narrando + rangoNarrado: mientras el entrevistador está siendo leído en
// voz alta (ver entrevista/[id]/page.jsx), se resalta la porción de texto
// que se está diciendo en ese momento, tipo karaoke.

function TextoConResaltado({ texto, rango }) {
  const [inicio, fin] = rango;
  return (
    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-texto">
      {texto.slice(0, inicio)}
      <mark className="rounded bg-acento-suave px-0.5 text-acento">{texto.slice(inicio, fin)}</mark>
      {texto.slice(fin)}
    </p>
  );
}

function BurbujaMensaje({ mensaje, narrando = false, rangoNarrado = [0, 0] }) {
  const esUsuario = mensaje.rol === 'usuario';

  if (esUsuario) {
    return (
      <div className="animar-subir flex justify-end">
        <div className="min-w-0 max-w-[85%] rounded-2xl rounded-br-md bg-superficie-alt px-4 py-3 sm:max-w-[75%]">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-texto">
            {mensaje.contenido}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animar-subir flex gap-3">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-acento text-sm font-semibold text-acento-texto ${
          narrando ? 'animate-pulse' : ''
        }`}
        aria-hidden="true"
      >
        M
      </div>

      <div className="min-w-0 flex-1">
        {mensaje.esRepregunta && (
          <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-md bg-acento-suave px-2 py-0.5 text-xs font-medium text-acento">
            Repregunta
          </span>
        )}
        {narrando ? (
          <TextoConResaltado texto={mensaje.contenido} rango={rangoNarrado} />
        ) : (
          <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-texto">
            {mensaje.contenido}
          </p>
        )}
      </div>
    </div>
  );
}

export default BurbujaMensaje;
