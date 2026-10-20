import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [erro, setErro] = useState('');
  useEffect(() => { api.get('/agendamentos/resumo').then(setD).catch((e) => setErro(e.message)); }, []);
  if (erro) return <div className="msg erro">{erro}</div>;
  if (!d) return <p>Carregando...</p>;
  return (
    <>
      <h2>Painel</h2>
      <div className="grid">
        <div className="card"><div className="num">{d.clientes}</div>Clientes</div>
        <div className="card"><div className="num">{d.veiculos}</div>Veículos</div>
        <div className="card"><div className="num">{d.abertos}</div>Agendamentos em aberto</div>
      </div>
      <div className="card">
        <h3>Próximos serviços</h3>
        <table>
          <thead><tr><th>Data/Hora</th><th>Placa</th><th>Cliente</th><th>Serviço</th><th>Status</th></tr></thead>
          <tbody>
            {d.proximos.map((p) => (
              <tr key={p.id}><td>{p.data_hora.slice(0, 16).replace('T', ' ')}</td><td>{p.placa}</td>
                <td>{p.cliente}</td><td>{p.servico}</td><td>{p.status}</td></tr>
            ))}
            {!d.proximos.length && <tr><td colSpan="5">Nenhum agendamento em aberto.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
