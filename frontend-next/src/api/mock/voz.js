// Módulo de voz mockeado para modo demostración.
// Simula transcripción de audio y generación de voz sin usar APIs reales.

// Transcribir audio: simula que lee el archivo y devuelve un texto simulado
async function transcribir(archivoAudio) {
  // Simular un pequeño delay de "procesamiento"
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Devolver un texto simulado basado en el tipo de archivo
  const respuestasSimuladas = [
    'Tengo 5 años de experiencia en desarrollo full stack con React y Node.js.',
    'Empecé mi carrera desarrollando sitios web pequeños con HTML y CSS.',
    'He liderado un equipo de 3 desarrolladores en un proyecto de e-commerce.',
    'Mi mayor fortaleza es la resolución de problemas complejos en tiempo real.',
    'He trabajado con PostgreSQL, MongoDB y también con tecnologías de caché como Redis.',
  ];

  return respuestasSimuladas[Math.floor(Math.random() * respuestasSimuladas.length)];
}

// Generar voz: simula que convierte texto a audio
// En modo demostración, devuelve un blob de audio simulado (silencio)
async function hablar(texto) {
  // Simular un pequeño delay de "procesamiento"
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Crear un audio simulado (silencio de 1 segundo)
  // En el navegador, vamos a crear un blob de un archivo WAV vacío
  // Para simplificar, devolvemos un blob pequeño que representa audio silencioso
  const muestreo = 44100; // Hz
  const duracion = Math.min(Math.ceil(texto.length / 20), 3); // 1-3 segundos según el largo del texto
  const bufferSize = muestreo * duracion * 2; // 16-bit audio

  // Crear un buffer de audio silencioso
  const audioBuffer = new ArrayBuffer(bufferSize);
  const view = new Uint8Array(audioBuffer);

  // Llenar con silencio (ceros)
  for (let i = 0; i < view.length; i++) {
    view[i] = 0;
  }

  // Crear un blob MP3 falso (en realidad va a ser datos aleatorios, pero el navegador
  // lo puede reproducir si tenemos un reproductor que sea tolerante)
  // Para una solución más realista, podríamos usar una librería como tone.js
  // Pero por ahora, simplemente devolvemos un blob vacío que el reproductor ignorará

  return new Blob([audioBuffer], { type: 'audio/mpeg' });
}

export { transcribir, hablar };
