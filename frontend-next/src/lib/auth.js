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

// Middleware para proteger rutas
export async function middleware401(request) {
  const token = extraerToken(request);
  if (!token) {
    return respuestaError('Token no proporcionado', 401);
  }

  const payload = verificarToken(token);
  if (!payload) {
    return respuestaError('Token inválido o expirado', 401);
  }

  return { usuario: payload };
}
