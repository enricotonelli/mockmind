import prisma from '@/lib/prisma';
import { middleware401, respuestaError, respuestaOk } from '@/lib/auth';

export async function DELETE(request, { params }) {
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

    // Eliminar mensajes asociados
    await prisma.mensaje.deleteMany({
      where: { idSesion },
    });

    // Eliminar reporte asociado
    await prisma.reporteEntrevista.deleteMany({
      where: { idSesion },
    });

    // Eliminar sesión
    await prisma.sesion.delete({
      where: { id: idSesion },
    });

    return respuestaOk({ mensaje: 'Sesión eliminada' });
  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    return respuestaError(error.message || 'Error al eliminar sesión', 500);
  }
}
