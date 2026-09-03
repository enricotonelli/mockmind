'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

const TemaContext = createContext(null);
const CLAVE = 'mockmind_tema';

export function ProveedorTema({ children }) {
  // 'claro' es solo el valor por defecto para el render de servidor (ahí no
  // existe document/localStorage). El valor real ya lo aplicó el script
  // anti-flash del <head> (ver src/app/layout.jsx) antes de que React
  // hidrate nada; el primer efecto de acá abajo solo lee esa clase para que
  // el estado de React quede sincronizado con lo que ya se ve en pantalla.
  const [tema, setTema] = useState('claro');
  const primerRenderClase = useRef(true);

  useEffect(() => {
    const yaOscuro = document.documentElement.classList.contains('oscuro');
    setTema(yaOscuro ? 'oscuro' : 'claro');
  }, []);

  useEffect(() => {
    // Salta la primera pasada: la clase ya la puso el script anti-flash, y
    // si acá la volviéramos a tocar con el valor por defecto ('claro')
    // antes de que el efecto de arriba corrija el estado, se vería un
    // parpadeo de oscuro a claro y de vuelta a oscuro.
    if (primerRenderClase.current) {
      primerRenderClase.current = false;
      return;
    }
    document.documentElement.classList.toggle('oscuro', tema === 'oscuro');
    localStorage.setItem(CLAVE, tema);
  }, [tema]);

  function alternarTema() {
    setTema((actual) => (actual === 'oscuro' ? 'claro' : 'oscuro'));
  }

  return (
    <TemaContext.Provider value={{ tema, alternarTema }}>{children}</TemaContext.Provider>
  );
}

export function useTema() {
  const contexto = useContext(TemaContext);
  if (!contexto) throw new Error('useTema debe usarse dentro de ProveedorTema.');
  return contexto;
}
