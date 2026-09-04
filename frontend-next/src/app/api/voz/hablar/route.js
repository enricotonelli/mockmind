import { generarAudioDesdeTexto } from '@/lib/services';
import { middleware401, respuestaError } from '@/lib/auth';

export const maxDuration = 30;

export async function POST(request) {
  try {
    const auth = await middleware401(request);
    if (auth.error) return auth;

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
