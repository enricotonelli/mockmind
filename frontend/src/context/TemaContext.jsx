import { createContext, useContext, useEffect, useState } from 'react';

const TemaContext = createContext(null);
const CLAVE = 'mockmind_tema';

export function ProveedorTema({ children }) {
  const [tema, setTema] = useState(() => {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return guardado;
    // Si no hay preferencia guardada, se respeta la del sistema operativo.
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  });

  useEffect(() => {
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
