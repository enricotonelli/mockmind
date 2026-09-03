// Persistencia del modo simulado: guarda todo en localStorage para que los datos
// sobrevivan a las recargas de la página. Cuando entre el backend real, este
// archivo desaparece sin tocar ninguna pantalla.

const CLAVE = 'mockmind_datos';

// Estructura que replica las tablas del schema de Prisma (ver backend/prisma/schema.prisma).
const ESTADO_INICIAL = {
  usuario: null,
  sesiones: [],
  mensajes: [],
  reportes: [],
  ultimoId: 0,
};

export function leerDatos() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return { ...ESTADO_INICIAL };
    return { ...ESTADO_INICIAL, ...JSON.parse(crudo) };
  } catch (error) {
    // Si el localStorage tiene basura o está bloqueado, se arranca de cero
    // en vez de romper la aplicación.
    console.warn('No se pudieron leer los datos guardados, se reinicia.', error);
    return { ...ESTADO_INICIAL };
  }
}

export function guardarDatos(datos) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch (error) {
    console.warn('No se pudieron guardar los datos.', error);
  }
}

// Modifica el estado guardado aplicando una función y devuelve el resultado nuevo.
export function actualizarDatos(modificar) {
  const datos = leerDatos();
  const nuevos = modificar(datos);
  guardarDatos(nuevos);
  return nuevos;
}

// Generador de IDs incrementales, imitando el autoincrement de PostgreSQL.
export function proximoId() {
  const datos = leerDatos();
  const id = datos.ultimoId + 1;
  guardarDatos({ ...datos, ultimoId: id });
  return id;
}

export function borrarTodo() {
  localStorage.removeItem(CLAVE);
}

// Simula la latencia de una llamada de red para que la interfaz ejercite
// de verdad sus estados de carga.
export function demorar(ms) {
  const espera = ms ?? 300 + Math.random() * 500;
  return new Promise((resolve) => setTimeout(resolve, espera));
}
