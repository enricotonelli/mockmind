import { registroUsuario } from '@/lib/services';
import { respuestaError, respuestaOk } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, nombre } = await request.json();

    if (!email || !password || !nombre) {
      return respuestaError('Email, contraseña y nombre son requeridos', 400);
    }

    const resultado = await registroUsuario(email, password, nombre);
    return respuestaOk(resultado, 201);
  } catch (error) {
    console.error('Error en registro:', error);
    return respuestaError(error.message || 'Error al registrarse', 500);
  }
}
