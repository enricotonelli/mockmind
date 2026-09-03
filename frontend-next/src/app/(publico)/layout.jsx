'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

// Reemplaza a RutaPublica: si ya hay sesión, no tiene sentido mostrar
// login o registro.
export default function LayoutPublico({ children }) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && usuario) router.replace('/');
  }, [cargando, usuario, router]);

  if (cargando || usuario) return null;

  return children;
}
