// Punto de entrada único de la capa de datos.
//
// Las pantallas SIEMPRE importan desde acá, nunca desde ./mock, ./real ni
// desde axios directamente.
//
// NEXT_PUBLIC_USE_MOCKS=true fuerza el modo demostración sin siquiera intentar
// tocar el backend (útil para desarrollar la interfaz sin servidor).
// En cualquier otro caso, cada llamada intenta el backend real primero; si
// falla por un error de CONEXIÓN (backend caído, sin red — no un 400/401 de
// negocio), esa llamada puntual cae sola al mock, sin que la pantalla que la
// llamó tenga que saberlo. Así la app funciona igual esté el servidor
// prendido, apagado, o directamente no se quiera usar.

import * as autenticacionMock from './mock/autenticacion';
import * as sesionesMock from './mock/sesiones';
import * as cvMock from './mock/cv';
import * as vozMock from './mock/voz';
import * as autenticacionReal from './real/autenticacion';
import * as sesionesReal from './real/sesiones';
import * as vozReal from './real/voz';
import { borrarSesion as borrarSesionReal } from './real/sesionLocal';

const FORZAR_MOCK = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Arranca en el modo configurado, pero se va actualizando en vivo según si
// las llamadas reales funcionan o no. Los suscriptores (el indicador de la
// barra lateral) se enteran del cambio sin tener que recargar la página.
let usandoMock = FORZAR_MOCK;
const listeners = new Set();

function marcarModo(valor) {
  if (valor === usandoMock) return;
  usandoMock = valor;
  listeners.forEach((fn) => fn(usandoMock));
}

export function suscribirseAModoDemostracion(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function estaEnModoDemostracion() {
  return usandoMock;
}

// Se guarda para compatibilidad con código que todavía lee el valor fijo
// inicial (no reactivo). Para UI que se tiene que actualizar en vivo, usar
// el hook useModoDemostracion en su lugar.
export const MODO_DEMOSTRACION = FORZAR_MOCK;

// Un error sin `response` es de conexión (el pedido no llegó a completarse:
// backend caído, timeout, sin red). Un error CON `response` es de negocio
// (400, 401, 404...): el backend sí contestó, y esa respuesta hay que
// mostrarla tal cual, no taparla con datos simulados.
function esErrorDeConexion(error) {
  return !error?.response;
}

// Envuelve una función real con su equivalente mock: intenta la real, y si
// falla por conexión, devuelve el resultado del mock en su lugar.
function conRespaldo(etiqueta, real, mock) {
  return async (...args) => {
    try {
      const resultado = await real(...args);
      marcarModo(false);
      return resultado;
    } catch (error) {
      if (!esErrorDeConexion(error)) throw error;
      console.warn(`[MockMind] "${etiqueta}" sin conexión al backend, uso datos simulados.`);
      marcarModo(true);
      return mock(...args);
    }
  };
}

// Envuelve todas las funciones de un módulo que existan en ambos lados
// (mock y real) con el respaldo automático. Lo que solo existe en el mock
// (como reiniciarDemostracion, que no aplica a una cuenta real) se expone
// tal cual.
function envolverConRespaldo(nombreModulo, real, mock) {
  const envuelto = {};
  for (const clave of Object.keys(mock)) {
    envuelto[clave] =
      typeof mock[clave] === 'function' && typeof real[clave] === 'function'
        ? conRespaldo(`${nombreModulo}.${clave}`, real[clave], mock[clave])
        : mock[clave];
  }
  return envuelto;
}

export const autenticacion = FORZAR_MOCK
  ? autenticacionMock
  : {
      ...envolverConRespaldo('autenticacion', autenticacionReal, autenticacionMock),
      // Sincrónica y sin llamada de red: no pasa por el respaldo genérico
      // (que es async). Se prioriza la sesión real si existe, para no
      // "perder" un login real apenas se abre la app, antes de que la app
      // haya tenido ocasión de comprobar si el backend responde.
      usuarioGuardado: () => autenticacionReal.usuarioGuardado() ?? autenticacionMock.usuarioGuardado(),
      // Cierra las dos sesiones locales que pudieran existir, para no dejar
      // un token real colgado si en algún momento se alternó de modo.
      cerrarSesion: async () => {
        borrarSesionReal();
        await autenticacionMock.cerrarSesion();
      },
    };

export const sesiones = FORZAR_MOCK
  ? sesionesMock
  : envolverConRespaldo('sesiones', sesionesReal, sesionesMock);

export const voz = FORZAR_MOCK
  ? vozMock
  : envolverConRespaldo('voz', vozReal, vozMock);

// El Módulo 3 (creador de CV) todavía no tiene backend: CLAUDE.md §3 dice
// explícitamente no construirlo hasta que el Módulo 1 funcione de punta a
// punta. Corre siempre mockeado, con extracción real de PDF en el navegador
// (ver mock/extraccionLinkedin.js).
export const cv = cvMock;

// Opciones de configuración y utilidades que las pantallas necesitan conocer.
export { DURACIONES } from './mock/entrevistador';
export {
  PLANTILLAS,
  cvVacio,
  experienciaVacia,
  educacionVacia,
  analizarCv,
} from './mock/cv';
