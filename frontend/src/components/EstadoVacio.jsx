// Estado vacío: explica por qué no hay nada y ofrece la acción siguiente,
// en lugar de dejar una pantalla en blanco.

function EstadoVacio({ icono, titulo, descripcion, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-borde px-6 py-14 text-center">
      {icono && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-superficie-alt text-2xl">
          {icono}
        </div>
      )}
      <h3 className="mb-1.5 text-lg">{titulo}</h3>
      {descripcion && (
        <p className="mb-5 max-w-sm text-sm leading-relaxed text-texto-suave">{descripcion}</p>
      )}
      {children}
    </div>
  );
}

export default EstadoVacio;
