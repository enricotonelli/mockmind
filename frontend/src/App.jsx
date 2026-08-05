import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProveedorAuth, useAuth } from './context/AuthContext';
import { ProveedorTema } from './context/TemaContext';
import LayoutApp from './layouts/LayoutApp';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import NuevaEntrevista from './pages/NuevaEntrevista';
import Entrevista from './pages/Entrevista';
import Reporte from './pages/Reporte';
import Historial from './pages/Historial';
import Perfil from './pages/Perfil';

// Deja pasar solo si hay una sesión activa.
function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fondo">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-acento border-t-transparent" />
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

// Si ya hay sesión, no tiene sentido mostrar login o registro.
function RutaPublica({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;
  if (usuario) return <Navigate to="/" replace />;
  return children;
}

function Rutas() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RutaPublica>
            <Login />
          </RutaPublica>
        }
      />
      <Route
        path="/registro"
        element={
          <RutaPublica>
            <Registro />
          </RutaPublica>
        }
      />

      <Route
        element={
          <RutaProtegida>
            <LayoutApp />
          </RutaProtegida>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/entrevista/nueva" element={<NuevaEntrevista />} />
        <Route path="/entrevista/:id" element={<Entrevista />} />
        <Route path="/reporte/:id" element={<Reporte />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ProveedorTema>
      <ProveedorAuth>
        <BrowserRouter>
          <Rutas />
        </BrowserRouter>
      </ProveedorAuth>
    </ProveedorTema>
  );
}

export default App;
