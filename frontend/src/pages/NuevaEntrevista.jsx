import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sesiones as apiSesiones } from '../api';
import { TIPOS } from '../components/EtiquetaTipo';
import Boton from '../components/Boton';
import Campo from '../components/Campo';

// Descripciones listas para usar, así se puede probar la app sin tener que
// escribir un aviso completo a mano.
const EJEMPLOS = [
  {
    titulo: 'Desarrollador Full Stack',
    texto:
      'Buscamos Desarrollador Full Stack Semi Senior para sumarse a nuestro equipo de producto. ' +
      'Requisitos: 3+ años de experiencia con JavaScript, React y Node.js, manejo de bases de datos ' +
      'relacionales (PostgreSQL) y control de versiones con Git. Valoramos experiencia trabajando en ' +
      'equipos ágiles y capacidad de comunicar decisiones técnicas. Tareas: desarrollo de nuevas ' +
      'funcionalidades, mantenimiento de la plataforma y participación en las definiciones de producto.',
  },
  {
    titulo: 'Analista de Datos',
    texto:
      'Analista de Datos Junior para el área de Inteligencia de Negocios. Buscamos una persona con ' +
      'conocimientos de SQL, Excel avanzado y alguna herramienta de visualización (Power BI o Tableau). ' +
      'Se valoran conocimientos de Python para análisis. Responsabilidades: generar reportes periódicos, ' +
      'detectar oportunidades de mejora en los procesos y presentar hallazgos a las áreas de negocio.',
  },
  {
    titulo: 'Atención al Cliente',
    texto:
      'Representante de Atención al Cliente para nuestro canal digital. Buscamos una persona con muy ' +
      'buena comunicación escrita y oral, paciencia y orientación a la resolución de problemas. ' +
      'Se valora experiencia previa en atención al público o call center. Tareas: responder consultas ' +
      'por chat y correo, gestionar reclamos y derivar casos complejos al área correspondiente.',
  },
];

const MINIMO_CARACTERES = 20;

function NuevaEntrevista() {
  const navegar = useNavigate();

  const [paso, setPaso] = useState(1);
  const [puesto, setPuesto] = useState('');
  const [tipo, setTipo] = useState('RRHH');
  const [error, setError] = useState('');
  const [creando, setCreando] = useState(false);

  const puestoValido = puesto.trim().length >= MINIMO_CARACTERES;

  async function comenzar() {
    setError('');
    setCreando(true);

    try {
      const sesion = await apiSesiones.crearSesion({
        puestoAplicado: puesto,
        tipoEntrevista: tipo,
      });
      navegar(`/entrevista/${sesion.id}`);
    } catch (problema) {
      setError(problema.message);
      setCreando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-12">
      {/* Indicador de pasos */}
      <div className="mb-8 flex items-center gap-3">
        {[1, 2].map((numero) => (
          <div key={numero} className="flex flex-1 items-center gap-3">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                paso >= numero
                  ? 'bg-acento text-acento-texto'
                  : 'bg-superficie-alt text-texto-tenue'
              }`}
            >
              {numero}
            </div>
            <span
              className={`text-sm transition ${
                paso >= numero ? 'font-medium text-texto' : 'text-texto-tenue'
              }`}
            >
              {numero === 1 ? 'El puesto' : 'Tipo de entrevista'}
            </span>
            {numero === 1 && <span className="h-px flex-1 bg-borde" />}
          </div>
        ))}
      </div>

      {paso === 1 && (
        <div className="animar-subir">
          <h1 className="mb-1.5 text-2xl font-semibold">¿A qué puesto querés aplicar?</h1>
          <p className="mb-6 text-[15px] leading-relaxed text-texto-suave">
            Pegá la descripción del aviso o contá con tus palabras de qué se trata el trabajo.
            Cuanto más detalle des, más específicas van a ser las preguntas.
          </p>

          <Campo
            id="puesto"
            multilinea
            rows={9}
            placeholder="Ej: Buscamos Desarrollador Full Stack Semi Senior con experiencia en React y Node.js…"
            value={puesto}
            onChange={(e) => setPuesto(e.target.value)}
            ayuda={
              puestoValido
                ? `${puesto.trim().length} caracteres`
                : `Escribí al menos ${MINIMO_CARACTERES} caracteres (llevás ${puesto.trim().length})`
            }
          />

          <div className="mt-6">
            <p className="mb-2.5 text-sm text-texto-suave">
              ¿No tenés un aviso a mano? Usá uno de ejemplo:
            </p>
            <div className="flex flex-wrap gap-2">
              {EJEMPLOS.map((ejemplo) => (
                <button
                  key={ejemplo.titulo}
                  onClick={() => setPuesto(ejemplo.texto)}
                  className="rounded-lg border border-borde bg-superficie px-3 py-1.5 text-sm text-texto-suave transition hover:border-borde-fuerte hover:text-texto"
                >
                  {ejemplo.titulo}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Boton tamano="grande" disabled={!puestoValido} onClick={() => setPaso(2)}>
              Continuar
            </Boton>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="animar-subir">
          <h1 className="mb-1.5 text-2xl font-semibold">¿Qué tipo de entrevista querés practicar?</h1>
          <p className="mb-6 text-[15px] leading-relaxed text-texto-suave">
            Cada tipo cambia el estilo del entrevistador y las preguntas que te va a hacer.
          </p>

          <div className="space-y-3">
            {Object.entries(TIPOS).map(([clave, datos]) => {
              const elegido = tipo === clave;
              return (
                <button
                  key={clave}
                  onClick={() => setTipo(clave)}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                    elegido
                      ? 'border-acento bg-acento-suave/40 shadow-suave'
                      : 'border-borde bg-superficie hover:border-borde-fuerte'
                  }`}
                >
                  <span className="mt-0.5 text-2xl" aria-hidden="true">
                    {datos.icono}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-texto">{datos.nombre}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-texto-suave">
                      {datos.descripcion}
                    </p>
                  </div>
                  <span
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      elegido ? 'border-acento bg-acento' : 'border-borde-fuerte'
                    }`}
                  >
                    {elegido && <span className="h-1.5 w-1.5 rounded-full bg-acento-texto" />}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-acento/30 bg-acento-suave px-3.5 py-2.5">
              <p className="text-sm text-acento">{error}</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Boton variante="fantasma" onClick={() => setPaso(1)} disabled={creando}>
              ← Volver
            </Boton>
            <Boton tamano="grande" onClick={comenzar} cargando={creando}>
              {creando ? 'Preparando la entrevista…' : 'Comenzar entrevista'}
            </Boton>
          </div>
        </div>
      )}
    </div>
  );
}

export default NuevaEntrevista;
