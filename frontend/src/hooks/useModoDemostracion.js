import { useSyncExternalStore } from 'react';
import { suscribirseAModoDemostracion, estaEnModoDemostracion } from '../api';

// Refleja en vivo si la app está usando datos simulados: arranca según
// VITE_USE_MOCKS, pero también se activa solo si el backend real deja de
// responder a mitad de uso.
export function useModoDemostracion() {
  return useSyncExternalStore(suscribirseAModoDemostracion, estaEnModoDemostracion);
}
