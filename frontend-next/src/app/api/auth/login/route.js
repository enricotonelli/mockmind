import { loginUsuario } from '@/lib/services';
import { respuestaError, respuestaOk } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return respuestaError('Email y contraseña son requeridos', 400);
    }

    const resultado = await loginUsuario(email, password);
    return respuestaOk(resultado);
  } catch (error) {
    console.error('Error en login:', error);
    return respuestaError(error.message || 'Error al iniciar sesión', 500);
  }
}
