import './globals.css';
import { ProveedorTema } from '../context/TemaContext';
import { ProveedorAuth } from '../context/AuthContext';

export const metadata = {
  title: 'MockMind',
  description: 'Entrenador de entrevistas laborales con IA',
};

// Antes de que React hidrate nada, aplica el tema guardado (o el del
// sistema operativo) para que no haya un flash de tema claro seguido de un
// salto a oscuro en cada carga — algo que la SPA con Vite no sufría porque
// no había un primer render del lado del servidor.
const scriptAntiFlash = `
(function () {
  try {
    var guardado = localStorage.getItem('mockmind_tema');
    var oscuro = guardado ? guardado === 'oscuro' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (oscuro) document.documentElement.classList.add('oscuro');
  } catch (error) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptAntiFlash }} />
      </head>
      <body className="antialiased">
        <ProveedorTema>
          <ProveedorAuth>{children}</ProveedorAuth>
        </ProveedorTema>
      </body>
    </html>
  );
}
