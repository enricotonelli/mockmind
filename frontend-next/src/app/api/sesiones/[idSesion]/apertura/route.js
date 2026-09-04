import prisma from '@/lib/prisma';
import { middleware401, respuestaError, respuestaOk } from '@/lib/auth';
import { generarApertura } from '@/lib/services';

export const maxDuration = 60;

export async function POST(request, { params }) {
  try {
    const auth = await middleware401(request);
    if (auth.error) return auth;

    const { idSesion } = params;

    const sesion = await prisma.sesion.findUnique({
      where: { id: idSesion },
    });

    if (!sesion) {
      return respuestaError('Sesión no encontrada', 404);
    }

    if (sesion.idUsuario !== auth.usuario.id) {
      return respuestaError('No autorizado', 403);
    }

    // Generar apertura
    const resultado = await generarApertura({
      tipo: sesion.tipoEntrevista,
      puesto: sesion.puestoAplicado,
      cantidadPreguntas: sesion.cantidadPreguntas,
    });

    // Guardar mensaje de apertura
    const mensaje = await prisma.mensaje.create({
      data: {
        idSesion,
        rol: 'entrevistador',
        contenido: resultado.texto,
      },
    });

    return respuestaOk({ mensaje: resultado.texto });
  } catch (error) {
    console.error('Error al generar apertura:', error);
    return respuestaError(error.message || 'Error al generar apertura', 500);
  }
}
