'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import LayoutApp from '../../layouts/LayoutApp';

// Reemplaza a RutaProtegida de la SPA con react-router-dom: en el App
// Router de Next.js la protección de rutas no es un componente central con
// <Routes>, es este layout envolviendo todas las páginas de este grupo.
export default function LayoutProtegido({ children }) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && !usuario) router.replace('/login');
  }, [cargando, usuario, router]);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fondo">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-acento border-t-transparent" />
      </div>
    );
  }

  if (!usuario) return null;

  return <LayoutApp>{children}</LayoutApp>;
}
