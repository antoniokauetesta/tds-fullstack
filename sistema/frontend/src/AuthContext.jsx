// Estado de autenticação (login / logout / sessão) compartilhado pela aplicação
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setCarregando(false));
    const expirou = () => setUser(null);
    window.addEventListener('sessao-expirada', expirou);
    return () => window.removeEventListener('sessao-expirada', expirou);
  }, []);

  const entrar = async (email, senha) => setUser(await api.post('/auth/login', { email, senha }));
  const registrar = (nome, email, senha) => api.post('/auth/registro', { nome, email, senha });
  const sair = async () => { await api.post('/auth/logout'); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, carregando, entrar, registrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}
