'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sesiones as apiSesiones } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { TIPOS } from '../../components/EtiquetaTipo';
import Boton from '../../components/Boton';
import Tarjeta from '../../components/Tarjeta';
import TarjetaSesion from '../../components/TarjetaSesion';
import EstadoVacio from '../../components/EstadoVacio';

function saludo() {
  const hora = new Date().getHours();
  if (hora < 13) return 'Buen día';
  if (hora < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function Metrica({ etiqueta, valor, detalle, cargando }) {
  return (
    <Tarjeta>
      <p className="mb-1 text-sm text-texto-suave">{etiqueta}</p>
      {cargando ? (
        <div className="esqueleto h-8 w-16" />
      ) : (
        <p className="font-serif text-3xl font-semibold text-texto">{valor}</p>
      )}
      {detalle && !cargando && <p className="mt-1 text-xs text-texto-tenue">{detalle}</p>}
    </Tarjeta>
  );
}

function Dashboard() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [resumen, setResumen] = useState(null);
  const [enCurso, setEnCurso] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    Promise.all([apiSesiones.obtenerResumen(), apiSesiones.listarEnCurso()])
      .then(([datos, pendientes]) => {
        if (!vigente) return;
        setResumen(datos);
        setEnCurso(pendientes);
      })
      .catch(() => {})
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, []);

  const primerNombre = (usuario?.nombre ?? '').split(' ')[0];
  // Si el pedido de resumen falló (ej: sesión inválida), resumen queda en
  // null: se trata igual que "sin sesiones" en vez de romper el render.
  const sinSesiones = !cargando && (!resumen || resumen.cantidadSesiones === 0);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-8">
        <h1 className="mb-1.5 text-3xl font-semibold">
          {saludo()}, {primerNombre}
        </h1>
        <p className="text-[15px] text-texto-suave">
          {sinSesiones
            ? 'Empecemos con tu primera entrevista de práctica.'
            : 'Listo para practicar otra entrevista.'}
        </p>
      </header>

      {/* Entrevistas empezadas y no terminadas */}
      {enCurso.length > 0 && (
        <section className="mb-8">
          {enCurso.map((sesion) => (
            <Tarjeta key={sesion.id} className="mb-3 border-alerta/40 bg-alerta/5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="mb-0.5 text-sm font-medium text-texto">
                    Tenés una entrevista sin terminar
                  </p>
                  <p className="truncate text-sm text-texto-suave">
                    {sesion.puestoAplicado}
                  </p>
                  <p className="mt-0.5 text-xs text-texto-tenue">
                    {sesion.respondidas === 0
                      ? 'Todavía no respondiste ninguna pregunta'
                      : `Respondiste ${sesion.respondidas} ${
                          sesion.respondidas === 1 ? 'pregunta' : 'preguntas'
                        }`}
                  </p>
                </div>
                <Boton
                  variante="secundario"
                  onClick={() => router.push(`/entrevista/${sesion.id}`)}
                  className="shrink-0"
                >
                  Retomar
                </Boton>
              </div>
            </Tarjeta>
          ))}
        </section>
      )}

      {/* Acción principal */}
      <Tarjeta className="mb-8 border-acento/25 bg-gradient-to-br from-acento-suave/60 to-transparent">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mb-1 text-xl">Nueva entrevista</h2>
            <p className="max-w-md text-sm leading-relaxed text-texto-suave">
              Cargá la descripción del puesto, elegí el tipo de entrevista y empezá a practicar.
            </p>
          </div>
          <Boton tamano="grande" onClick={() => router.push('/entrevista/nueva')} className="shrink-0">
            Empezar
          </Boton>
        </div>
      </Tarjeta>

      {/* Métricas */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Metrica
          etiqueta="Entrevistas completadas"
          valor={resumen?.cantidadSesiones ?? 0}
          cargando={cargando}
        />
        <Metrica
          etiqueta="Puntaje promedio"
          valor={resumen?.puntajePromedio ?? '—'}
          detalle={
            resumen?.evolucion != null
              ? `${resumen.evolucion >= 0 ? '+' : ''}${resumen.evolucion} desde la primera`
              : null
          }
          cargando={cargando}
        />
        <Metrica
          etiqueta="Tu punto más fuerte"
          valor={resumen?.mejorDimension ? resumen.mejorDimension.puntaje : '—'}
          detalle={resumen?.mejorDimension?.nombre}
          cargando={cargando}
        />
      </div>

      {/* Últimas sesiones */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl">Últimas entrevistas</h2>
          {!sinSesiones && (
            <button
              onClick={() => router.push('/historial')}
              className="text-sm font-medium text-acento hover:underline"
            >
              Ver historial
            </button>
          )}
        </div>

        {cargando ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="esqueleto h-[74px]" />
            ))}
          </div>
        ) : sinSesiones ? (
          <EstadoVacio
            titulo="Todavía no hiciste ninguna entrevista"
            descripcion="Cuando termines la primera, vas a ver acá tu reporte con puntajes y sugerencias de mejora."
          >
            <Boton onClick={() => router.push('/entrevista/nueva')}>Hacer mi primera entrevista</Boton>
          </EstadoVacio>
        ) : (
          <div className="space-y-3">
            {resumen.ultimas.map((sesion) => (
              <TarjetaSesion key={sesion.id} sesion={sesion} />
            ))}
          </div>
        )}
      </section>

      {/* Tipos de entrevista disponibles */}
      {!sinSesiones && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl">Tipos de entrevista</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(TIPOS).map(([clave, datos]) => (
              <Tarjeta key={clave} className="p-4">
                <p className="text-sm font-medium text-texto">{datos.nombre}</p>
                <p className="mt-1 text-xs leading-relaxed text-texto-suave">{datos.descripcion}</p>
              </Tarjeta>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;
