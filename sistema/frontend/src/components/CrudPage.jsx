// Componente reutilizável de CRUD: listagem, busca, formulário (criar/editar) e exclusão
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

export default function CrudPage({ titulo, endpoint, colunas, campos, inicial = {}, paraForm = (r) => r, statusOpcoes }) {
  const [linhas, setLinhas] = useState([]);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('');
  const [opcoes, setOpcoes] = useState({});
  const [form, setForm] = useState(null);       // null = formulário fechado
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [erroForm, setErroForm] = useState('');

  const carregar = useCallback(async () => {
    try {
      setLinhas(await api.get(endpoint + (status ? `?status=${encodeURIComponent(status)}` : '')));
    } catch (e) { setMsg({ tipo: 'erro', texto: e.message }); }
  }, [endpoint, status]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {   // carrega as listas dos <select> que dependem de outras tabelas
    campos.filter((c) => c.optionsFrom).forEach(async (c) => {
      const dados = await api.get(c.optionsFrom.endpoint);
      setOpcoes((o) => ({ ...o, [c.name]: dados.map((d) => ({ value: d.id, label: c.optionsFrom.label(d) })) }));
    });
  }, [campos]);

  const abrirNovo = () => { setEditId(null); setForm({ ...inicial }); setErroForm(''); };
  const abrirEditar = (r) => { setEditId(r.id); setForm(paraForm(r)); setErroForm(''); };
  const fechar = () => setForm(null);

  async function salvar(e) {
    e.preventDefault();
    try {
      if (editId) await api.put(`${endpoint}/${editId}`, form);
      else await api.post(endpoint, form);
      fechar();
      setMsg({ tipo: 'ok', texto: editId ? 'Registro atualizado.' : 'Registro criado.' });
      carregar();
    } catch (err) { setErroForm(err.message); }
  }

  async function excluir(r) {
    if (!window.confirm('Confirma a exclusão?')) return;
    try {
      await api.del(`${endpoint}/${r.id}`);
      setMsg({ tipo: 'ok', texto: 'Registro excluído.' });
      carregar();
    } catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  }

  const termo = busca.trim().toLowerCase();
  const visiveis = termo ? linhas.filter((l) => Object.values(l).join(' ').toLowerCase().includes(termo)) : linhas;

  return (
    <div className="card">
      <h2>{titulo}</h2>
      {msg && <div className={`msg ${msg.tipo}`}>{msg.texto}</div>}
      <div className="bar">
        <input placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        {statusOpcoes && (
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {statusOpcoes.map((s) => <option key={s}>{s}</option>)}
          </select>
        )}
        <button className="btn" onClick={abrirNovo}>+ Novo</button>
      </div>

      {form && (
        <form className="formbox" onSubmit={salvar}>
          <h3>{editId ? 'Editar' : 'Novo'}</h3>
          {erroForm && <div className="msg erro">{erroForm}</div>}
          {campos.map((c) => {
            const lista = c.options ? c.options.map((o) => ({ value: o, label: o })) : opcoes[c.name] || [];
            return (
              <div key={c.name}>
                <label>{c.label}</label>
                {c.type === 'select' ? (
                  <select value={form[c.name] ?? ''} required={c.required}
                    onChange={(e) => setForm({ ...form, [c.name]: e.target.value })}>
                    <option value="">Selecione...</option>
                    {lista.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input type={c.type || 'text'} value={form[c.name] ?? ''} required={c.required}
                    onChange={(e) => setForm({ ...form, [c.name]: e.target.value })} />
                )}
              </div>
            );
          })}
          <div className="acoes">
            <button className="btn">Salvar</button>
            <button type="button" className="btn sec" onClick={fechar}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="rolagem">
        <table>
          <thead><tr>{colunas.map((c) => <th key={c.key}>{c.label}</th>)}<th /></tr></thead>
          <tbody>
            {visiveis.map((r) => (
              <tr key={r.id}>
                {colunas.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}
                <td className="nowrap">
                  <button className="btn sec" onClick={() => abrirEditar(r)}>Editar</button>{' '}
                  <button className="btn del" onClick={() => excluir(r)}>Excluir</button>
                </td>
              </tr>
            ))}
            {!visiveis.length && <tr><td colSpan={colunas.length + 1}>Nenhum registro.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
