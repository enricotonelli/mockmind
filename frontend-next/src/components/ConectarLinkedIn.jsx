'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';

export default function ConectarLinkedIn({ onDatosLinkedIn, onCargar }) {
  const { usuario } = useAuth();
  const searchParams = useSearchParams();
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [datosLinkedIn, setDatosLinkedIn] = useState(null);
  const [error, setError] = useState(null);
  const [conectado, setConectado] = useState(false);

  // Detectar callback de LinkedIn
  useEffect(() => {
    const linkedinData = searchParams.get('linkedin');
    if (linkedinData) {
      try {
        const datos = JSON.parse(Buffer.from(linkedinData, 'base64').toString());
        setDatosLinkedIn(datos);
        setMostrarModal(true);
        setConectado(true);
      } catch (e) {
        setError('Error al procesar datos de LinkedIn');
        console.error(e);
      }
    }
  }, [searchParams]);

  const iniciarOAuth = async () => {
    if (!usuario) {
      setError('Usuario no autenticado');
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/auth/linkedin?userId=${usuario.id}&token=${localStorage.getItem('token')}`
      );
      if (!res.ok) throw new Error('Error al iniciar OAuth');

      const { url } = await res.json();
      if (!url) throw new Error('URL de OAuth no disponible');

      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error al conectar con LinkedIn');
      setCargando(false);
    }
  };

  const procesarDatos = async (opcion) => {
    if (opcion === 'cargar' && datosLinkedIn) {
      try {
        if (onCargar) {
          await onCargar(datosLinkedIn);
        }
        if (onDatosLinkedIn) {
          onDatosLinkedIn(datosLinkedIn);
        }
        setMostrarModal(false);
        setConectado(true);
      } catch (e) {
        setError('Error al guardar datos de LinkedIn');
        console.error(e);
      }
    } else {
      setMostrarModal(false);
    }
  };

  const desconectar = () => {
    setDatosLinkedIn(null);
    setConectado(false);
    setMostrarModal(false);
  };

  return (
    <>
      {error && (
        <div className="mb-3 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {conectado ? (
        <div className="w-full space-y-2">
          <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium">✓ Conectado con LinkedIn</span>
            <span className="text-xs">{datosLinkedIn?.nombre}</span>
          </div>
          <button
            onClick={desconectar}
            className="w-full px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-black dark:text-white font-medium rounded-lg text-sm"
          >
            Desconectar
          </button>
        </div>
      ) : (
        <button
          onClick={iniciarOAuth}
          disabled={cargando}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </svg>
          {cargando ? 'Conectando con LinkedIn...' : 'Conectar con LinkedIn'}
        </button>
      )}

      {mostrarModal && datosLinkedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-bold mb-2">✓ Datos de LinkedIn</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Se encontraron tus datos. ¿Qué quieres hacer?
            </p>

            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded mb-6">
              <div className="flex gap-3 items-start">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{datosLinkedIn.nombre}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {datosLinkedIn.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => procesarDatos('cargar')}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                ✓ Cargar automáticamente
              </button>
              <button
                onClick={() => procesarDatos('manual')}
                className="w-full px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-black dark:text-white font-medium rounded-lg transition-colors"
              >
                ✏️ Llenar manualmente
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              Puedes editar después en tu perfil
            </p>
          </div>
        </div>
      )}
    </>
  );
}
