'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sesiones as apiSesiones } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { useModoDemostracion } from '../../../hooks/useModoDemostracion';
import Tarjeta from '../../../components/Tarjeta';
import Boton from '../../../components/Boton';

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function Dato({ etiqueta, valor }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-borde py-3 last:border-0">
      <span className="text-sm text-texto-suave">{etiqueta}</span>
      <span className="text-sm font-medium text-texto">{valor}</span>
    </div>
  );
}

function Perfil() {
  const { usuario, reiniciarDemostracion } = useAuth();
  const modoDemostracion = useModoDemostracion();
  const router = useRouter();
  const [resumen, setResumen] = useState(null);
  const [reiniciando, setReiniciando] = useState(false);

  useEffect(() => {
    apiSesiones.obtenerResumen().then(setResumen).catch(() => {});
  }, []);

  async function reiniciar() {
    setReiniciando(true);
    await reiniciarDemostracion();
    router.push('/login');
  }

  const iniciales = (usuario?.nombre ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-12">
      <h1 className="mb-8 text-3xl font-semibold">Perfil</h1>

      <Tarjeta className="mb-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-acento text-lg font-semibold text-acento-texto">
            {iniciales}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-medium text-texto">{usuario?.nombre}</p>
            <p className="truncate text-sm text-texto-suave">{usuario?.email}</p>
          </div>
        </div>

        <Dato
          etiqueta="Miembro desde"
          valor={usuario?.fechaRegistro ? formatearFecha(usuario.fechaRegistro) : '—'}
        />
        <Dato etiqueta="Entrevistas completadas" valor={resumen?.cantidadSesiones ?? '—'} />
        <Dato etiqueta="Puntaje promedio" valor={resumen?.puntajePromedio ?? '—'} />
        <Dato
          etiqueta="Punto más fuerte"
          valor={resumen?.mejorDimension?.nombre ?? '—'}
        />
      </Tarjeta>

      {modoDemostracion && (
        <Tarjeta>
          <h2 className="mb-1.5 text-lg">Modo demostración</h2>
          <p className="mb-4 text-sm leading-relaxed text-texto-suave">
            La aplicación está funcionando sin servidor: el entrevistador y los datos son
            simulados, y todo se guarda en este navegador. Podés borrar todo y volver a empezar
            de cero.
          </p>
          <Boton variante="secundario" onClick={reiniciar} cargando={reiniciando}>
            Borrar todos mis datos
          </Boton>
        </Tarjeta>
      )}
    </div>
  );
}

export default Perfil;
