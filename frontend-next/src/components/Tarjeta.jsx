'use client';

function Tarjeta({ children, className = '', comoBoton = false, ...props }) {
  const Elemento = comoBoton ? 'button' : 'div';

  return (
    <Elemento
      className={`rounded-2xl border border-borde bg-superficie p-5 transition
        ${comoBoton ? 'w-full text-left hover:border-borde-fuerte hover:shadow-suave' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </Elemento>
  );
}

export default Tarjeta;