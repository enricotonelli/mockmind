const VARIANTES = {
  primario:
    'bg-acento text-acento-texto hover:brightness-110 active:brightness-95 shadow-suave',
  secundario:
    'bg-superficie text-texto border border-borde hover:border-borde-fuerte hover:bg-superficie-alt',
  fantasma: 'text-texto-suave hover:bg-superficie-alt hover:text-texto',
};

const TAMANOS = {
  chico: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  medio: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  grande: 'px-6 py-3.5 text-base rounded-xl gap-2.5',
};

function Boton({
  children,
  variante = 'primario',
  tamano = 'medio',
  cargando = false,
  disabled,
  className = '',
  ...props
}) {
  const inactivo = disabled || cargando;

  return (
    <button
      disabled={inactivo}
      className={`inline-flex items-center justify-center font-medium transition
        disabled:cursor-not-allowed disabled:opacity-50
        ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {cargando && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

export default Boton;
