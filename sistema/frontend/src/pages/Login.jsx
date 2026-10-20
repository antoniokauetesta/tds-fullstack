// Tela de LOGIN e criação de conta
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { user, entrar, registrar } = useAuth();
  const [modo, setModo] = useState('login');
  const [f, setF] = useState({ nome: '', email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro(''); setOk(''); setEnviando(true);
    try {
      if (modo === 'login') await entrar(f.email, f.senha);
      else {
        await registrar(f.nome, f.email, f.senha);
        setOk('Conta criada! Faça login.');
        setModo('login');
      }
    } catch (err) { setErro(err.message); }
    finally { setEnviando(false); }
  }

  return (
    <div className="card login">
      <h2>{modo === 'login' ? 'Entrar' : 'Criar conta'}</h2>
      {erro && <div className="msg erro">{erro}</div>}
      {ok && <div className="msg ok">{ok}</div>}
      <form onSubmit={enviar}>
        {modo === 'registro' && (<><label>Nome</label><input value={f.nome} onChange={set('nome')} required /></>)}
        <label>E-mail</label>
        <input type="email" value={f.email} onChange={set('email')} required autoFocus />
        <label>Senha</label>
        <input type="password" value={f.senha} onChange={set('senha')} required minLength={modo === 'registro' ? 8 : undefined} />
        <div className="acoes">
          <button className="btn" disabled={enviando}>{modo === 'login' ? 'Entrar' : 'Cadastrar'}</button>
          <button type="button" className="link" onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setErro(''); }}>
            {modo === 'login' ? 'Criar conta' : 'Voltar ao login'}
          </button>
        </div>
      </form>
    </div>
  );
}
