'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cv as apiCv, analizarCv, PLANTILLAS } from '../../../api';
import Tarjeta from '../../../components/Tarjeta';
import Boton from '../../../components/Boton';
import EstadoVacio from '../../../components/EstadoVacio';
import DialogoConfirmar from '../../../components/DialogoConfirmar';

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function MisCvs() {
  const router = useRouter();
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [porEliminar, setPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    let vigente = true;
    apiCv
      .listarCvs()
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

  async function confirmarEliminar() {
    setEliminando(true);
    try {
      await apiCv.eliminarCv(porEliminar.id);
      setLista((previos) => previos.filter((c) => c.id !== porEliminar.id));
      setPorEliminar(null);
    } finally {
      setEliminando(false);
    }
  }

  if (cargando) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-5 py-10 sm:px-8">
        <div className="esqueleto h-8 w-40" />
        <div className="esqueleto h-24 w-full" />
        <div className="esqueleto h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1.5 text-3xl font-semibold">Mis CVs</h1>
          <p className="text-[15px] text-texto-suave">
            Creá tu currículum y verificá que pase los filtros automáticos de selección.
          </p>
        </div>
        {lista.length > 0 && (
          <Boton onClick={() => router.push('/cv/nuevo')}>+ Nuevo CV</Boton>
        )}
      </header>

      {lista.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no creaste ningún CV"
          descripcion="Podés importar tu perfil de LinkedIn o completarlo a mano. En los dos casos te mostramos qué tan preparado está para los sistemas automáticos de selección."
        >
          <Boton onClick={() => router.push('/cv/nuevo')}>Crear mi primer CV</Boton>
        </EstadoVacio>
      ) : (
        <div className="space-y-3">
          {lista.map((item) => {
            const analisis = analizarCv(item);
            const plantilla = PLANTILLAS.find((p) => p.id === item.plantilla);

            return (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-2xl border border-borde bg-superficie pr-3 transition hover:border-borde-fuerte hover:shadow-suave"
              >
                <button
                  onClick={() => router.push(`/cv/${item.id}`)}
                  className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-texto">
                      {item.nombre || 'CV sin nombre'}
                      {item.titular && (
                        <span className="font-normal text-texto-suave"> · {item.titular}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-texto-tenue">
                      {plantilla?.nombre} · actualizado el {formatearFecha(item.fechaActualizacion)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={`font-serif text-2xl font-semibold ${
                        analisis.puntajeGeneral >= 75
                          ? 'text-exito'
                          : analisis.puntajeGeneral >= 50
                            ? 'text-alerta'
                            : 'text-acento'
                      }`}
                    >
                      {analisis.puntajeGeneral}
                    </p>
                    <p className="text-xs text-texto-tenue">ATS</p>
                  </div>
                </button>

                <button
                  onClick={() => setPorEliminar(item)}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-texto-tenue transition hover:bg-superficie-alt hover:text-acento"
                >
                  Eliminar
                </button>
              </div>
            );
          })}
        </div>
      )}

      <DialogoConfirmar
        abierto={Boolean(porEliminar)}
        titulo="¿Eliminar este CV?"
        descripcion="Se va a borrar todo su contenido y no se puede deshacer."
        textoConfirmar="Eliminar"
        procesando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </div>
  );
}

export default MisCvs;
