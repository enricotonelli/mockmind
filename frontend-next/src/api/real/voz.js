import axios from 'axios';
import { client } from '../client';

// POST /api/voz/transcribir
// Envía un archivo de audio y recibe la transcripción en texto
async function transcribir(archivoAudio) {
  const formData = new FormData();
  formData.append('audio', archivoAudio);

  const { data } = await client.post('/voz/transcribir', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data.texto;
}

// POST /api/voz/hablar
// Envía texto y recibe un archivo de audio en formato MP3
async function hablar(texto) {
  const { data } = await client.post(
    '/voz/hablar',
    { texto },
    {
      responseType: 'blob', // Esperar un archivo binario de audio
    }
  );

  // Retornar el blob de audio
  return data;
}

export { transcribir, hablar };
