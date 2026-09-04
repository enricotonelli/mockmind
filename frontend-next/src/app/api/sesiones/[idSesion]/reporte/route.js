import prisma from '@/lib/prisma';
import { middleware401, respuestaError, respuestaOk } from '@/lib/auth';
import { generarReporte, calcularPuntajeGeneral } from '@/lib/services';

export const maxDuration = 60;

export async function GET(request, { params }) {
  try {
    const auth = await middleware401(request);
    if (auth.error) return auth;

    const { idSesion } = params;

    const sesion = await prisma.sesion.findUnique({ where: { id: idSesion } });

    if (!sesion) {
      return respuestaError('Sesión no encontrada', 404);
    }

    if (sesion.idUsuario !== auth.usuario.id) {
      return respuestaError('No autorizado', 403);
    }

    const reporte = await prisma.reporteEntrevista.findUnique({ where: { idSesion } });

    if (!reporte) {
      return respuestaError('Todavía no se generó el reporte de esta sesión', 404);
    }

    return respuestaOk({ reporte, sesion });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    return respuestaError(error.message || 'Error al obtener reporte', 500);
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await middleware401(request);
    if (auth.error) return auth;

    const { idSesion } = params;

    const sesion = await prisma.sesion.findUnique({
      where: { id: idSesion },
      include: { mensajes: true },
    });

    if (!sesion) {
      return respuestaError('Sesión no encontrada', 404);
    }

    if (sesion.idUsuario !== auth.usuario.id) {
      return respuestaError('No autorizado', 403);
    }

    // Contar repreguntas
    const cantidadRepreguntas = sesion.mensajes.filter((m) => m.esRepregunta).length;

    // Generar reporte
    const datosReporte = await generarReporte({
      tipo: sesion.tipoEntrevista,
      puesto: sesion.puestoAplicado,
      cantidadRepreguntas,
      mensajes: sesion.mensajes,
    });

    // Calcular puntaje general
    const puntajeGeneral = calcularPuntajeGeneral({
      puntajeClaridad: datosReporte.puntajeClaridad,
      puntajeStar: datosReporte.puntajeStar,
      puntajeEjemplos: datosReporte.puntajeEjemplos,
      puntajeCoherencia: datosReporte.puntajeCoherencia,
    });

    // Guardar reporte en BD
    const reporte = await prisma.reporteEntrevista.create({
      data: {
        idSesion,
        puntajeClaridad: datosReporte.puntajeClaridad,
        puntajeStar: datosReporte.puntajeStar,
        puntajeEjemplos: datosReporte.puntajeEjemplos,
        puntajeCoherencia: datosReporte.puntajeCoherencia,
        puntajeGeneral,
        cantidadRepreguntas,
        feedbackTexto: datosReporte.feedbackTexto,
        sugerencias: datosReporte.sugerencias,
      },
    });

    // Actualizar sesión con puntaje general y marcar como finalizada
    await prisma.sesion.update({
      where: { id: idSesion },
      data: { puntajeGeneral, finalizada: true },
    });

    return respuestaOk({ reporte });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    return respuestaError(error.message || 'Error al generar reporte', 500);
  }
}
