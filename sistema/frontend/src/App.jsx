// Funcionalidade PRINCIPAL: rotas, layout e proteção de páginas
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clientes from './pages/Clientes.jsx';
import Veiculos from './pages/Veiculos.jsx';
import Agendamentos from './pages/Agendamentos.jsx';

function Protegida({ children }) {
  const { user, carregando } = useAuth();
  if (carregando) return <p className="centro">Carregando...</p>;
  return user ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  const { user, sair } = useAuth();
  return (
    <>
      <nav>
        <strong>🔧 Oficina</strong>
        <NavLink to="/" end>Início</NavLink>
        <NavLink to="/clientes">Clientes</NavLink>
        <NavLink to="/veiculos">Veículos</NavLink>
        <NavLink to="/agendamentos">Agendamentos</NavLink>
        <span className="sp" />
        <span>{user?.nome}</span>
        <button onClick={sair}>Sair</button>
      </nav>
      <main>{children}</main>
    </>
  );
}

const privada = (el) => <Protegida><Layout>{el}</Layout></Protegida>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={privada(<Dashboard />)} />
      <Route path="/clientes" element={privada(<Clientes />)} />
      <Route path="/veiculos" element={privada(<Veiculos />)} />
      <Route path="/agendamentos" element={privada(<Agendamentos />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
