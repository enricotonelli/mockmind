import prisma from '@/lib/prisma';
import { middleware401, respuestaError, respuestaOk } from '@/lib/auth';
import { decidirTurno } from '@/lib/services';

export async function POST(request, { params }) {
  try {
    const auth = await middleware401(request);
    if (auth.error) return auth;

    const { idSesion } = params;
    const { respuesta } = await request.json();

    if (!respuesta) {
      return respuestaError('Respuesta requerida', 400);
    }

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

    // Guardar respuesta del usuario
    await prisma.mensaje.create({
      data: {
        idSesion,
        rol: 'usuario',
        contenido: respuesta,
      },
    });

    // Contar repreguntas seguidas
    const ultimosMensajes = sesion.mensajes.slice(-2);
    let repreguntasSeguidas = 0;
    for (let i = ultimosMensajes.length - 1; i >= 0; i--) {
      if (ultimosMensajes[i].rol === 'entrevistador' && ultimosMensajes[i].esRepregunta) {
        repreguntasSeguidas++;
      } else {
        break;
      }
    }

    // Decidir próximo turno
    const resultado = await decidirTurno({
      tipo: sesion.tipoEntrevista,
      puesto: sesion.puestoAplicado,
      cantidadPreguntas: sesion.cantidadPreguntas,
      indicePregunta: sesion.indicePregunta || 0,
      repreguntasSeguidas,
      mensajesPrevios: sesion.mensajes,
      respuesta,
    });

    // Guardar respuesta del entrevistador
    const nuevoMensaje = await prisma.mensaje.create({
      data: {
        idSesion,
        rol: 'entrevistador',
        contenido: resultado.texto,
        esRepregunta: resultado.esRepregunta,
      },
    });

    // Actualizar índice de pregunta si avanzó
    if (!resultado.esRepregunta) {
      await prisma.sesion.update({
        where: { id: idSesion },
        data: { indicePregunta: resultado.indicePregunta },
      });
    }

    return respuestaOk({
      mensaje: resultado.texto,
      esRepregunta: resultado.esRepregunta,
      finalizada: resultado.finalizada,
    });
  } catch (error) {
    console.error('Error en turno:', error);
    return respuestaError(error.message || 'Error al procesar turno', 500);
  }
}
