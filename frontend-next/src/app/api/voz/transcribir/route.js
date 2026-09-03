import { transcribirAudio } from '@/lib/services';
import { respuestaError, respuestaOk } from '@/lib/auth';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return respuestaError('Audio requerido', 400);
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const texto = await transcribirAudio(buffer);
    return respuestaOk({ texto });
  } catch (error) {
    console.error('Error al transcribir:', error);
    return respuestaError(error.message || 'Error al transcribir audio', 500);
  }
}
