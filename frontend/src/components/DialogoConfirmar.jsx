import Boton from './Boton';

// Diálogo de confirmación para acciones que no se pueden deshacer.

function DialogoConfirmar({
  abierto,
  titulo,
  descripcion,
  textoConfirmar = 'Confirmar',
  procesando = false,
  onConfirmar,
  onCancelar,
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={procesando ? undefined : onCancelar}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="animar-subir relative w-full max-w-sm rounded-2xl border border-borde bg-superficie p-6 shadow-elevada"
      >
        <h2 className="mb-2 text-lg">{titulo}</h2>
        {descripcion && (
          <p className="mb-6 text-sm leading-relaxed text-texto-suave">{descripcion}</p>
        )}

        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={onCancelar} disabled={procesando}>
            Cancelar
          </Boton>
          <Boton onClick={onConfirmar} cargando={procesando}>
            {textoConfirmar}
          </Boton>
        </div>
      </div>
    </div>
  );
}

export default DialogoConfirmar;
