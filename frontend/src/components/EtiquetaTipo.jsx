// Etiqueta de color según el tipo de entrevista, usada en historial y reportes.

export const TIPOS = {
  RRHH: {
    nombre: 'Recursos Humanos',
    corto: 'RRHH',
    descripcion: 'Competencias blandas, trayectoria y motivaciones',
    icono: '👥',
    clases: 'bg-acento-suave text-acento',
  },
  Tecnica: {
    nombre: 'Técnica',
    corto: 'Técnica',
    descripcion: 'Conocimientos específicos del área del puesto',
    icono: '⚙️',
    clases: 'bg-superficie-alt text-texto-suave',
  },
  Estres: {
    nombre: 'Estrés',
    corto: 'Estrés',
    descripcion: 'Comportamiento del candidato bajo presión',
    icono: '🔥',
    clases: 'bg-superficie-alt text-texto-suave',
  },
};

function EtiquetaTipo({ tipo }) {
  const datos = TIPOS[tipo] ?? TIPOS.RRHH;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${datos.clases}`}
    >
      {datos.corto}
    </span>
  );
}

export default EtiquetaTipo;
