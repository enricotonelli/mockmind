'use client';

// Campo de formulario con etiqueta, ayuda y mensaje de error.

function Campo({
  etiqueta,
  id,
  error,
  ayuda,
  multilinea = false,
  className = '',
  ...props
}) {
  const Elemento = multilinea ? 'textarea' : 'input';

  return (
    <div className={className}>
      {etiqueta && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-texto">
          {etiqueta}
        </label>
      )}

      <Elemento
        id={id}
        className={`w-full rounded-xl border bg-superficie px-3.5 py-2.5 text-sm text-texto
          transition placeholder:text-texto-tenue
          focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20
          ${multilinea ? 'resize-none leading-relaxed' : ''}
          ${error ? 'border-acento' : 'border-borde hover:border-borde-fuerte'}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-acento">
          {error}
        </p>
      )}
      {!error && ayuda && <p className="mt-1.5 text-xs text-texto-tenue">{ayuda}</p>}
    </div>
  );
}

export default Campo;