import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PanelPresentacion from '../components/PanelPresentacion';
import Boton from '../components/Boton';
import Campo from '../components/Campo';

// Evalúa la contraseña para mostrar el indicador de fuerza.
function fuerzaContrasena(password) {
  if (!password) return { nivel: 0, texto: '', clase: '' };

  let puntos = 0;
  if (password.length >= 6) puntos += 1;
  if (password.length >= 10) puntos += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) puntos += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) puntos += 1;

  if (puntos <= 1) return { nivel: 1, texto: 'Débil', clase: 'bg-acento' };
  if (puntos <= 2) return { nivel: 2, texto: 'Aceptable', clase: 'bg-alerta' };
  if (puntos === 3) return { nivel: 3, texto: 'Buena', clase: 'bg-alerta' };
  return { nivel: 4, texto: 'Muy buena', clase: 'bg-exito' };
}

function Registro() {
  const { registrar } = useAuth();
  const navegar = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const fuerza = fuerzaContrasena(password);
  const emailValido = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function enviar(evento) {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      await registrar({ nombre, email, password });
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

          <h2 className="mb-1.5 text-2xl font-semibold">Creá tu cuenta</h2>
          <p className="mb-7 text-sm text-texto-suave">
            Empezá a practicar en menos de un minuto.
          </p>

          <form onSubmit={enviar} className="space-y-4">
            <Campo
              id="nombre"
              etiqueta="Nombre"
              type="text"
              autoComplete="name"
              placeholder="Cómo querés que te llame el entrevistador"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />

            <Campo
              id="email"
              etiqueta="Email"
              type="email"
              autoComplete="email"
              placeholder="tunombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!emailValido ? 'Revisá el formato del email.' : ''}
              required
            />

            <div>
              <Campo
                id="password"
                etiqueta="Contraseña"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((nivel) => (
                      <span
                        key={nivel}
                        className={`h-1 flex-1 rounded-full transition ${
                          nivel <= fuerza.nivel ? fuerza.clase : 'bg-borde'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="w-20 text-right text-xs text-texto-tenue">{fuerza.texto}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-acento/30 bg-acento-suave px-3.5 py-2.5">
                <p className="text-sm text-acento">{error}</p>
              </div>
            )}

            <Boton type="submit" tamano="grande" cargando={cargando} className="w-full">
              Crear cuenta
            </Boton>
          </form>

          <p className="mt-7 text-center text-sm text-texto-suave">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="font-medium text-acento hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registro;
