// Punto de entrada único de la capa de datos.
//
// Las pantallas SIEMPRE importan desde acá, nunca desde ./mock ni desde axios
// directamente. Cuando el backend esté listo, se implementa la versión real y
// se cambia la variable VITE_USE_MOCKS a "false": ninguna pantalla se toca.

import * as autenticacionMock from './mock/autenticacion';
import * as sesionesMock from './mock/sesiones';
import * as cvMock from './mock/cv';

export const MODO_DEMOSTRACION = import.meta.env.VITE_USE_MOCKS !== 'false';

export const autenticacion = autenticacionMock;
export const sesiones = sesionesMock;
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
