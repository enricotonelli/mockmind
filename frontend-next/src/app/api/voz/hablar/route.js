import { generarAudioDesdeTexto } from '@/lib/services';
import { respuestaError } from '@/lib/auth';

export async function POST(request) {
  try {
    const { texto } = await request.json();

    if (!texto) {
      return respuestaError('Texto requerido', 400);
    }

    const audioBuffer = await generarAudioDesdeTexto(texto);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="audio.mp3"',
      },
    });
  } catch (error) {
    console.error('Error al generar audio:', error);
    return respuestaError(error.message || 'Error al generar audio', 500);
  }
}
