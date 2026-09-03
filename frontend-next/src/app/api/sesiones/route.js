import prisma from '@/lib/prisma';
import { middleware401, respuestaError, respuestaOk } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await middleware401(request);
    if (auth.error) return auth;

    const sesiones = await prisma.sesion.findMany({
      where: { idUsuario: auth.usuario.id },
      orderBy: { fecha: 'desc' },
    });

    return respuestaOk({ sesiones });
  } catch (error) {
    console.error('Error al listar sesiones:', error);
    return respuestaError(error.message || 'Error al listar sesiones', 500);
  }
}
