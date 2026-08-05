import AnilloPuntaje from '../AnilloPuntaje';
import BarraDimension from '../BarraDimension';

// Muestra qué tan preparado está el CV para pasar los sistemas automáticos
// de selección de candidatos.

const DIMENSIONES = [
  { campo: 'contacto', nombre: 'Datos de contacto', descripcion: 'Lo que el sistema necesita para fichar tu perfil' },
  { campo: 'completitud', nombre: 'Completitud', descripcion: 'Si están todas las secciones esperadas' },
  { campo: 'calidad', nombre: 'Calidad del contenido', descripcion: 'Verbos de acción y logros con números' },
  { campo: 'formato', nombre: 'Formato legible', descripcion: 'Que una máquina pueda leerlo sin perderse' },
];

function PanelAts({ analisis }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="shrink-0">
          <AnilloPuntaje
            puntaje={analisis.puntajeGeneral}
            tamano={130}
            etiqueta="Compatibilidad ATS"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-lg">{analisis.veredicto.titulo}</h3>
          <p className="text-sm leading-relaxed text-texto-suave">{analisis.veredicto.texto}</p>
        </div>
      </div>

      <div className="space-y-4">
        {DIMENSIONES.map((dimension) => (
          <BarraDimension
            key={dimension.campo}
            nombre={dimension.nombre}
            descripcion={dimension.descripcion}
            puntaje={analisis[dimension.campo]}
          />
        ))}
      </div>

      {analisis.problemas.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-texto">Qué te conviene corregir</h4>
          <ul className="space-y-2.5">
            {analisis.problemas.map((problema, indice) => (
              <li key={indice} className="flex gap-2.5">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    problema.grave ? 'bg-acento' : 'bg-alerta'
                  }`}
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed text-texto-suave">
                  {problema.texto}
                  {problema.grave && (
                    <span className="ml-1.5 text-xs font-medium text-acento">(importante)</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analisis.aciertos.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-texto">Lo que ya está bien</h4>
          <ul className="space-y-2.5">
            {analisis.aciertos.map((acierto, indice) => (
              <li key={indice} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-exito" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-texto-suave">{acierto}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PanelAts;
