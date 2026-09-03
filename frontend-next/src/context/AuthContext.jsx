'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { autenticacion } from '../api';

const AuthContext = createContext(null);

export function ProveedorAuth({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la app se recupera la sesión guardada, si existe. Va en un
  // efecto (no en el estado inicial) porque localStorage no existe durante
  // el render de servidor de Next.js.
  useEffect(() => {
    setUsuario(autenticacion.usuarioGuardado());
    setCargando(false);
  }, []);

  async function registrar(datos) {
    const nuevo = await autenticacion.registrar(datos);
    setUsuario(nuevo);
    return nuevo;
  }

  async function iniciarSesion(datos) {
    const encontrado = await autenticacion.iniciarSesion(datos);
    setUsuario(encontrado);
    return encontrado;
  }

  async function cerrarSesion() {
    await autenticacion.cerrarSesion();
    setUsuario(null);
  }

  async function reiniciarDemostracion() {
    await autenticacion.reiniciarDemostracion();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, cargando, registrar, iniciarSesion, cerrarSesion, reiniciarDemostracion }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de ProveedorAuth.');
  return contexto;
}
