import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MODO_DEMOSTRACION } from '../api';
import PanelPresentacion from '../components/PanelPresentacion';
import Boton from '../components/Boton';
import Campo from '../components/Campo';

function Login() {
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      await iniciarSesion({ email, password });
      navegar('/');
    } catch (problema) {
      setError(problema.message);
    } finally {
      setCargando(false);
    }
  }

  // Atajo de la demostración: entra sin escribir nada.
  async function entrarComoInvitado() {
    setError('');
    setCargando(true);
    try {
      await iniciarSesion({ email: 'invitado@mockmind.app', password: 'demostracion' });
      navegar('/');
    } catch (problema) {
      setError(problema.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-fondo lg:grid lg:grid-cols-2">
      <div className="hidden lg:block">
        <PanelPresentacion />
      </div>

      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="animar-subir w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-acento text-base font-semibold text-acento-texto">
              M
            </div>
          </div>

          <h2 className="mb-1.5 text-2xl font-semibold">Iniciá sesión</h2>
          <p className="mb-7 text-sm text-texto-suave">
            Entrá para seguir practicando tus entrevistas.
          </p>

          <form onSubmit={enviar} className="space-y-4">
            <Campo
              id="email"
              etiqueta="Email"
              type="email"
              autoComplete="email"
              placeholder="tunombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Campo
              id="password"
              etiqueta="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="rounded-xl border border-acento/30 bg-acento-suave px-3.5 py-2.5">
                <p className="text-sm text-acento">{error}</p>
              </div>
            )}

            <Boton type="submit" tamano="grande" cargando={cargando} className="w-full">
              Entrar
            </Boton>
          </form>

          {MODO_DEMOSTRACION && (
            <>
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-borde" />
                <span className="text-xs text-texto-tenue">o</span>
                <span className="h-px flex-1 bg-borde" />
              </div>

              <Boton
                variante="secundario"
                tamano="grande"
                onClick={entrarComoInvitado}
                disabled={cargando}
                className="w-full"
              >
                Probar sin registrarme
              </Boton>
            </>
          )}

          <p className="mt-7 text-center text-sm text-texto-suave">
            ¿Todavía no tenés cuenta?{' '}
            <Link to="/registro" className="font-medium text-acento hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
