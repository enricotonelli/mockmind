'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cv as apiCv, cvVacio } from '../../../../api';
import Tarjeta from '../../../../components/Tarjeta';
import Boton from '../../../../components/Boton';

// Elección del punto de partida del CV: importar desde LinkedIn o empezar
// desde cero.

function NuevoCv() {
  const router = useRouter();
  const entradaArchivo = useRef(null);

  const [importando, setImportando] = useState(false);
  const [error, setError] = useState('');
  const [creando, setCreando] = useState(false);

  async function empezarVacio() {
    setCreando(true);
    setError('');
    try {
      const guardado = await apiCv.guardarCv(cvVacio());
      router.push(`/cv/${guardado.id}`);
    } catch (problema) {
      setError(problema.message);
      setCreando(false);
    }
  }

  async function importar(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    setImportando(true);
    setError('');

    try {
      const datos = await apiCv.importarDesdeLinkedin(archivo);
      const guardado = await apiCv.guardarCv(datos);
      router.push(`/cv/${guardado.id}`);
    } catch (problema) {
      setError(problema.message);
      setImportando(false);
      // Se limpia para poder reintentar con el mismo archivo.
      if (entradaArchivo.current) entradaArchivo.current.value = '';
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-12">
      <button
        onClick={() => router.push('/cv')}
        className="mb-6 text-sm text-texto-suave transition hover:text-texto"
      >
        Volver
      </button>

      <h1 className="mb-1.5 text-3xl font-semibold">Crear tu CV</h1>
      <p className="mb-8 text-[15px] leading-relaxed text-texto-suave">
        Elegí por dónde empezar. En cualquiera de los dos casos vas a poder editar todo después.
      </p>

      {/* Importar desde LinkedIn */}
      <Tarjeta className="mb-4">
        <div className="mb-3">
          <h2 className="text-lg">Importar desde LinkedIn</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-texto-suave">
            Traemos tu experiencia, educación y habilidades desde tu perfil, y vos después
            corregís lo que quieras.
          </p>
        </div>

        <div className="mb-4 rounded-xl bg-superficie-alt p-3.5">
          <p className="mb-2 text-xs font-medium text-texto">Cómo exportar tu perfil</p>
          <ol className="space-y-1 text-xs leading-relaxed text-texto-suave">
            <li>1. Entrá a tu perfil de LinkedIn desde una computadora.</li>
            <li>2. Tocá el botón «Más» que está debajo de tu foto.</li>
            <li>3. Elegí «Guardar como PDF» y descargá el archivo.</li>
            <li>4. Subilo acá abajo.</li>
          </ol>
          <p className="mt-2.5 text-xs leading-relaxed text-texto-tenue">
            Se hace así porque LinkedIn no permite que otras aplicaciones lean tu perfil
            completo: el PDF que vos mismo exportás es la única vía habilitada.
          </p>
        </div>

        <input
          ref={entradaArchivo}
          type="file"
          accept=".pdf,application/pdf"
          onChange={importar}
          className="hidden"
        />

        <Boton
          onClick={() => entradaArchivo.current?.click()}
          cargando={importando}
          disabled={creando}
        >
          {importando ? 'Leyendo tu perfil…' : 'Subir el PDF de LinkedIn'}
        </Boton>

        <p className="mt-3 text-xs leading-relaxed text-texto-tenue">
          El texto se lee de verdad desde tu PDF, ahí mismo en tu navegador (no se manda a
          ningún servidor). Es un borrador: puede no separar perfecto cada dato si tu PDF tiene
          un formato distinto al habitual — revisalo antes de guardar.
        </p>
      </Tarjeta>

      {/* Empezar de cero */}
      <Tarjeta>
        <div className="mb-4">
          <h2 className="text-lg">Completarlo yo mismo</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-texto-suave">
            Cargás los datos a mano en un formulario guiado, viendo el CV armarse en vivo y
            con el análisis de compatibilidad actualizándose a medida que escribís.
          </p>
        </div>

        <Boton variante="secundario" onClick={empezarVacio} cargando={creando} disabled={importando}>
          Empezar de cero
        </Boton>
      </Tarjeta>

      {error && (
        <div className="mt-5 rounded-xl border border-acento/30 bg-acento-suave px-3.5 py-2.5">
          <p className="text-sm text-acento">{error}</p>
        </div>
      )}
    </div>
  );
}

export default NuevoCv;
