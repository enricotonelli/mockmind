import prisma from '@/lib/prisma';
import { middleware401, respuestaError, respuestaOk } from '@/lib/auth';
import { generarApertura } from '@/lib/services';

export async function POST(request) {
  try {
    const auth = await middleware401(request);
    if (auth.error) return auth;

    const { puesto, tipoEntrevista, cantidadPreguntas } = await request.json();

    if (!puesto || !tipoEntrevista) {
      return respuestaError('Puesto y tipo de entrevista son requeridos', 400);
    }

    if (puesto.trim().length < 20) {
      return respuestaError('Describí el puesto con un poco más de detalle (al menos 20 caracteres).', 400);
    }

    const sesion = await prisma.sesion.create({
      data: {
        idUsuario: auth.usuario.id,
        puestoAplicado: puesto.trim(),
        tipoEntrevista,
        cantidadPreguntas: cantidadPreguntas || 5,
        fecha: new Date(),
      },
    });

    // Generar automáticamente el primer mensaje del entrevistador
    const resultadoApertura = await generarApertura({
      tipo: tipoEntrevista,
      puesto: puesto.trim(),
      cantidadPreguntas: cantidadPreguntas || 5,
    });

    // Guardar mensaje de apertura
    await prisma.mensaje.create({
      data: {
        idSesion: sesion.id,
        rol: 'entrevistador',
        contenido: resultadoApertura.texto,
      },
    });

    return respuestaOk({ sesion }, 201);
  } catch (error) {
    console.error('Error al crear sesión:', error);
    return respuestaError(error.message || 'Error al crear sesión', 500);
  }
}
