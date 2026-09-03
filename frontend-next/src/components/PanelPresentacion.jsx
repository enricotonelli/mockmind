'use client';

import { MODO_DEMOSTRACION } from '../api';

// Columna izquierda de las pantallas de login y registro: explica de qué se
// trata la aplicación antes de que el usuario se registre.

const PUNTOS = [
  {
    titulo: 'Entrevistas que se adaptan',
    texto: 'Cargás la descripción del puesto y las preguntas se generan para ese trabajo puntual.',
  },
  {
    titulo: 'Repregunta como un entrevistador real',
    texto: 'Si tu respuesta es vaga o no da ejemplos, insiste hasta que la completes.',
  },
  {
    titulo: 'Feedback con puntajes concretos',
    texto: 'Al terminar recibís un reporte con tus puntos débiles y cómo mejorarlos.',
  },
];

function PanelPresentacion() {
  return (
    <div className="flex h-full flex-col justify-between bg-fondo-alt p-8 lg:p-12">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-acento text-base font-semibold text-acento-texto">
          M
        </div>
        <span className="font-serif text-xl font-semibold text-texto">MockMind</span>
      </div>

      <div className="my-10 max-w-md">
        <h1 className="mb-3 text-3xl font-semibold leading-tight lg:text-4xl">
          Practicá tu entrevista antes de la entrevista.
        </h1>
        <p className="mb-9 text-[15px] leading-relaxed text-texto-suave">
          Un entrevistador con inteligencia artificial que te repregunta, te exige ejemplos
          concretos y te dice exactamente qué mejorar.
        </p>

        <ul className="space-y-5">
          {PUNTOS.map((punto) => (
            <li key={punto.titulo} className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-acento" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-texto">{punto.titulo}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-texto-suave">{punto.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-texto-tenue">
        {MODO_DEMOSTRACION
          ? 'Modo demostración · funciona sin conexión, con datos simulados'
          : 'Proyecto Final de Ingeniería en Informática · USAL'}
      </p>
    </div>
  );
}

export default PanelPresentacion;