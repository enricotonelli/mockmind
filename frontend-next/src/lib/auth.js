import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-de-desarrollo-cambiar-en-produccion';

export function crearToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verificarToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function extraerToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function respuestaError(mensaje, status = 400) {
  return NextResponse.json({ error: mensaje }, { status });
}

export function respuestaOk(datos = {}, status = 200) {
  return NextResponse.json(datos, { status });
}

// Middleware para proteger rutas.
//
// Los callers hacen `if (auth.error) return auth;` esperando que, en caso de
// falla, `auth` sea a la vez una respuesta válida para el route handler (un
// NextResponse) Y tenga `.error` en truthy para que el chequeo la detecte.
// NextResponse no expone `.error` por sí solo, así que se lo agregamos acá
// antes de devolverlo (si no, el chequeo nunca dispara con un token
// inválido/vencido y el caller sigue de largo leyendo auth.usuario.id sobre
// undefined).
export async function middleware401(request) {
  const token = extraerToken(request);
  if (!token) {
    const respuesta = respuestaError('Token no proporcionado', 401);
    respuesta.error = true;
    return respuesta;
  }

  const payload = verificarToken(token);
  if (!payload) {
    const respuesta = respuestaError('Token inválido o expirado', 401);
    respuesta.error = true;
    return respuesta;
  }

  return { usuario: payload };
}
