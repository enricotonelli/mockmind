import prisma from '@/lib/prisma';
import { middleware401, respuestaError, respuestaOk } from '@/lib/auth';

export async function POST(request) {
  try {
    const auth = await middleware401(request);
    if (auth.error) return auth;

    const { puesto, tipoEntrevista, cantidadPreguntas } = await request.json();

    if (!puesto || !tipoEntrevista) {
      return respuestaError('Puesto y tipo de entrevista son requeridos', 400);
    }

    const sesion = await prisma.sesion.create({
      data: {
        idUsuario: auth.usuario.id,
        puestoAplicado: puesto,
        tipoEntrevista,
        cantidadPreguntas: cantidadPreguntas || 5,
        fecha: new Date(),
      },
    });

    return respuestaOk({ sesion }, 201);
  } catch (error) {
    console.error('Error al crear sesión:', error);
    return respuestaError(error.message || 'Error al crear sesión', 500);
  }
}
