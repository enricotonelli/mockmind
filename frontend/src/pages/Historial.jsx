import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sesiones as apiSesiones } from '../api';
import { TIPOS } from '../components/EtiquetaTipo';
import GraficoEvolucion from '../components/GraficoEvolucion';
import TarjetaSesion from '../components/TarjetaSesion';
import Tarjeta from '../components/Tarjeta';
import EstadoVacio from '../components/EstadoVacio';
import Boton from '../components/Boton';

const FILTROS = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'RRHH', etiqueta: TIPOS.RRHH.nombre },
  { valor: 'Tecnica', etiqueta: TIPOS.Tecnica.nombre },
  { valor: 'Estres', etiqueta: TIPOS.Estres.nombre },
];

function Historial() {
  const navegar = useNavigate();
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    apiSesiones
      .listarSesiones()
      .then((datos) => {
        if (vigente) setLista(datos);
      })
      .catch(() => {})
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, []);

  const filtradas = useMemo(
    () => (filtro === 'todas' ? lista : lista.filter((s) => s.tipoEntrevista === filtro)),
    [lista, filtro]
  );

  const evolucion = useMemo(() => {
    if (lista.length < 2) return null;
    const ordenadas = [...lista].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    return ordenadas[ordenadas.length - 1].puntajeGeneral - ordenadas[0].puntajeGeneral;
  }, [lista]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 px-5 py-10 sm:px-8">
        <div className="esqueleto h-8 w-40" />
        <div className="esqueleto h-64 w-full" />
        <div className="esqueleto h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-8">
        <h1 className="mb-1.5 text-3xl font-semibold">Historial</h1>
        <p className="text-[15px] text-texto-suave">
          {lista.length === 0
            ? 'Acá vas a ver todas tus entrevistas y cómo mejorás con la práctica.'
            : `${lista.length} entrevistas completadas.`}
        </p>
      </header>

      {lista.length === 0 ? (
        <EstadoVacio
          icono="📈"
          titulo="Todavía no hay nada para mostrar"
          descripcion="Completá tu primera entrevista y vas a poder seguir tu evolución sesión a sesión."
        >
          <Boton onClick={() => navegar('/entrevista/nueva')}>Hacer una entrevista</Boton>
        </EstadoVacio>
      ) : (
        <>
          {/* Gráfico de evolución */}
          <Tarjeta className="mb-8">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl">Evolución de tu puntaje</h2>
              {evolucion != null && (
                <span
                  className={`text-sm font-medium ${
                    evolucion >= 0 ? 'text-exito' : 'text-acento'
                  }`}
                >
                  {evolucion >= 0 ? '+' : ''}
                  {evolucion} puntos desde tu primera entrevista
                </span>
              )}
            </div>
            <GraficoEvolucion sesiones={lista} />
          </Tarjeta>

          {/* Filtros por tipo */}
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTROS.map((opcion) => {
              const activo = filtro === opcion.valor;
              return (
                <button
                  key={opcion.valor}
                  onClick={() => setFiltro(opcion.valor)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    activo
                      ? 'bg-acento text-acento-texto'
                      : 'border border-borde bg-superficie text-texto-suave hover:border-borde-fuerte hover:text-texto'
                  }`}
                >
                  {opcion.etiqueta}
                </button>
              );
            })}
          </div>

          {/* Lista de sesiones */}
          {filtradas.length === 0 ? (
            <EstadoVacio
              icono="🔍"
              titulo="No hay entrevistas de este tipo"
              descripcion="Probá con otro filtro o practicá una entrevista de este tipo."
            >
              <Boton variante="secundario" onClick={() => navegar('/entrevista/nueva')}>
                Practicar este tipo
              </Boton>
            </EstadoVacio>
          ) : (
            <div className="space-y-3">
              {filtradas.map((sesion) => (
                <TarjetaSesion key={sesion.id} sesion={sesion} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Historial;
