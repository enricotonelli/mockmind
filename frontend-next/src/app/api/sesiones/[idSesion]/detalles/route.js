import prisma from '@/lib/prisma';
import { middleware401, respuestaError, respuestaOk } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const auth = await middleware401(request);
    if (auth.error) return auth;

    const { idSesion } = params;

    const sesion = await prisma.sesion.findUnique({
      where: { id: idSesion },
      include: { mensajes: { orderBy: { timestamp: 'asc' } } },
    });

    if (!sesion) {
      return respuestaError('Sesión no encontrada', 404);
    }

    if (sesion.idUsuario !== auth.usuario.id) {
      return respuestaError('No autorizado', 403);
    }

    // Separar sesión de mensajes para que coincida con el contrato del mock
    const { mensajes, ...datosSesion } = sesion;
    return respuestaOk({ sesion: datosSesion, mensajes });
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return respuestaError(error.message || 'Error al obtener sesión', 500);
  }
}
