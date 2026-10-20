// Gerenciamento de AGENDAMENTOS: /api/agendamentos  (e catálogo /api/servicos)
import { Router } from 'express';
import { pool } from '../db.js';
import { wrap, HttpError } from '../utils/http.js';
import { dataHoraSql } from '../utils/validators.js';

export const servicos = Router();
const router = Router();
const STATUS = ['Agendado', 'Em andamento', 'Concluído', 'Cancelado'];

servicos.get('/', wrap(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM servicos ORDER BY descricao');
  res.json(rows);
}));

async function ler(body, idAtual = 0) {
  const d = {
    veiculo_id: Number(body.veiculo_id),
    servico_id: Number(body.servico_id),
    data_hora: dataHoraSql(body.data_hora),
    status: body.status || 'Agendado',
    observacoes: String(body.observacoes || '').trim() || null,
  };
  if (!d.veiculo_id || !d.servico_id) throw new HttpError(400, 'Selecione veículo e serviço.');
  if (!d.data_hora) throw new HttpError(400, 'Data/hora inválida.');
  if (!STATUS.includes(d.status)) throw new HttpError(400, 'Status inválido.');
  if (d.status !== 'Cancelado') {
    const [c] = await pool.execute(
      `SELECT 1 FROM agendamentos WHERE veiculo_id=? AND data_hora=? AND status<>'Cancelado' AND id<>?`,
      [d.veiculo_id, d.data_hora, idAtual]);
    if (c.length) throw new HttpError(409, 'Já existe agendamento para este veículo neste horário.');
  }
  return d;
}

const SELECT = `SELECT a.*, v.placa, v.modelo, c.nome AS cliente, s.descricao AS servico, s.valor
  FROM agendamentos a
  JOIN veiculos v ON v.id = a.veiculo_id
  JOIN clientes c ON c.id = v.cliente_id
  JOIN servicos s ON s.id = a.servico_id`;

router.get('/', wrap(async (req, res) => {
  const { status } = req.query;
  const [rows] = STATUS.includes(status)
    ? await pool.execute(`${SELECT} WHERE a.status = ? ORDER BY a.data_hora`, [status])
    : await pool.query(`${SELECT} ORDER BY a.data_hora`);
  res.json(rows);
}));

router.get('/resumo', wrap(async (_req, res) => {
  const [[t]] = await pool.query(`SELECT
    (SELECT COUNT(*) FROM clientes) AS clientes,
    (SELECT COUNT(*) FROM veiculos) AS veiculos,
    (SELECT COUNT(*) FROM agendamentos WHERE status IN ('Agendado','Em andamento')) AS abertos`);
  const [proximos] = await pool.query(
    `${SELECT} WHERE a.status IN ('Agendado','Em andamento') ORDER BY a.data_hora LIMIT 5`);
  res.json({ ...t, proximos });
}));

router.post('/', wrap(async (req, res) => {
  const d = await ler(req.body);
  const [r] = await pool.execute(
    'INSERT INTO agendamentos (veiculo_id, servico_id, usuario_id, data_hora, status, observacoes) VALUES (?,?,?,?,?,?)',
    [d.veiculo_id, d.servico_id, req.user.id, d.data_hora, d.status, d.observacoes]);
  res.status(201).json({ id: r.insertId, ...d });
}));

router.put('/:id', wrap(async (req, res) => {
  const d = await ler(req.body, Number(req.params.id));
  const [r] = await pool.execute(
    'UPDATE agendamentos SET veiculo_id=?, servico_id=?, data_hora=?, status=?, observacoes=? WHERE id=?',
    [d.veiculo_id, d.servico_id, d.data_hora, d.status, d.observacoes, req.params.id]);
  if (!r.affectedRows) throw new HttpError(404, 'Agendamento não encontrado.');
  res.json({ id: Number(req.params.id), ...d });
}));

router.delete('/:id', wrap(async (req, res) => {
  const [r] = await pool.execute('DELETE FROM agendamentos WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) throw new HttpError(404, 'Agendamento não encontrado.');
  res.status(204).end();
}));

export default router;
