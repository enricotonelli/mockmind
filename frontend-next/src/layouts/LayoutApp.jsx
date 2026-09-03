'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTema } from '../context/TemaContext';
import { useModoDemostracion } from '../hooks/useModoDemostracion';

const ENLACES = [
  { a: '/', etiqueta: 'Inicio' },
  { a: '/historial', etiqueta: 'Historial' },
  { a: '/cv', etiqueta: 'Mis CVs' },
  { a: '/perfil', etiqueta: 'Perfil' },
];

function LayoutApp({ children }) {
  const { usuario, cerrarSesion } = useAuth();
  const { tema, alternarTema } = useTema();
  const modoDemostracion = useModoDemostracion();
  const pathname = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);

  async function salir() {
    await cerrarSesion();
    router.push('/login');
  }

  const iniciales = (usuario?.nombre ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');

  const barraLateral = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-acento text-sm font-semibold text-acento-texto">
          M
        </div>
        <span className="font-serif text-lg font-semibold text-texto">MockMind</span>
      </div>

      <button
        onClick={() => {
          setMenuAbierto(false);
          router.push('/entrevista/nueva');
        }}
        className="mx-3 mb-4 flex items-center justify-center gap-2 rounded-xl bg-acento px-4 py-2.5 text-sm font-medium text-acento-texto shadow-suave transition hover:brightness-110"
      >
        <span className="text-base leading-none">+</span>
        Nueva entrevista
      </button>

      <nav className="flex-1 space-y-0.5 px-3">
        {ENLACES.map((enlace) => {
          const activo = enlace.a === '/' ? pathname === '/' : pathname.startsWith(enlace.a);
          return (
            <Link
              key={enlace.a}
              href={enlace.a}
              onClick={() => setMenuAbierto(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                activo
                  ? 'bg-superficie-alt font-medium text-texto'
                  : 'text-texto-suave hover:bg-superficie-alt hover:text-texto'
              }`}
            >
              {enlace.etiqueta}
            </Link>
          );
        })}
      </nav>

      {modoDemostracion && (
        <div className="mx-3 mb-3 rounded-lg border border-borde bg-superficie-alt px-3 py-2.5">
          <p className="text-xs font-medium text-texto-suave">Modo demostración</p>
          <p className="mt-0.5 text-xs leading-relaxed text-texto-tenue">
            Sin conexión al servidor: el entrevistador y los datos son simulados.
          </p>
        </div>
      )}

      <div className="border-t border-borde p-3">
        <button
          onClick={alternarTema}
          className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-texto-suave transition hover:bg-superficie-alt hover:text-texto"
        >
          {tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
        </button>

        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-superficie-alt text-xs font-semibold text-texto-suave">
            {iniciales}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-texto">{usuario?.nombre}</p>
            <p className="truncate text-xs text-texto-tenue">{usuario?.email}</p>
          </div>
          <button
            onClick={salir}
            className="shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-texto-tenue transition hover:bg-superficie-alt hover:text-texto"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-fondo">
      {/* Barra lateral fija en pantallas grandes */}
      <aside className="hidden w-64 shrink-0 border-r border-borde bg-fondo-alt lg:block">
        <div className="sticky top-0 h-screen">{barraLateral}</div>
      </aside>

      {/* Barra lateral deslizable en pantallas chicas */}
      {menuAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMenuAbierto(false)}
            aria-hidden="true"
          />
          <aside className="animar-aparecer absolute left-0 top-0 h-full w-64 border-r border-borde bg-fondo-alt">
            {barraLateral}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Encabezado solo visible en pantallas chicas */}
        <header className="flex items-center gap-3 border-b border-borde px-4 py-3 lg:hidden">
          <button
            onClick={() => setMenuAbierto(true)}
            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-texto-suave transition hover:bg-superficie-alt"
          >
            Menú
          </button>
          <span className="font-serif text-lg font-semibold">MockMind</span>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export default LayoutApp;
