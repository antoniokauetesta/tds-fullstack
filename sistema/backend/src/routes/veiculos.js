// Gerenciamento de VEÍCULOS: /api/veiculos
import { Router } from 'express';
import { pool } from '../db.js';
import { wrap, HttpError } from '../utils/http.js';
import { placaValida } from '../utils/validators.js';

const router = Router();

function ler(body) {
  const d = {
    placa: String(body.placa || '').toUpperCase().replace(/[^A-Z0-9]/g, ''),
    marca: String(body.marca || '').trim(),
    modelo: String(body.modelo || '').trim(),
    ano: body.ano === '' || body.ano == null ? null : Number(body.ano),
    cor: String(body.cor || '').trim() || null,
    cliente_id: Number(body.cliente_id),
  };
  if (!placaValida(d.placa)) throw new HttpError(400, 'Placa inválida (ex.: ABC1D23).');
  if (!d.marca || !d.modelo) throw new HttpError(400, 'Marca e modelo são obrigatórios.');
  if (d.ano !== null && !(Number.isInteger(d.ano) && d.ano >= 1900 && d.ano <= 2100)) throw new HttpError(400, 'Ano inválido.');
  if (!Number.isInteger(d.cliente_id) || d.cliente_id < 1) throw new HttpError(400, 'Selecione o proprietário.');
  return d;
}

const SELECT = `SELECT v.*, c.nome AS proprietario FROM veiculos v
                JOIN clientes c ON c.id = v.cliente_id`;

router.get('/', wrap(async (_req, res) => {
  const [rows] = await pool.query(`${SELECT} ORDER BY v.placa`);
  res.json(rows);
}));

router.post('/', wrap(async (req, res) => {
  const d = ler(req.body);
  const [r] = await pool.execute(
    'INSERT INTO veiculos (placa, marca, modelo, ano, cor, cliente_id) VALUES (?,?,?,?,?,?)',
    [d.placa, d.marca, d.modelo, d.ano, d.cor, d.cliente_id]);
  res.status(201).json({ id: r.insertId, ...d });
}));

router.put('/:id', wrap(async (req, res) => {
  const d = ler(req.body);
  const [r] = await pool.execute(
    'UPDATE veiculos SET placa=?, marca=?, modelo=?, ano=?, cor=?, cliente_id=? WHERE id=?',
    [d.placa, d.marca, d.modelo, d.ano, d.cor, d.cliente_id, req.params.id]);
  if (!r.affectedRows) throw new HttpError(404, 'Veículo não encontrado.');
  res.json({ id: Number(req.params.id), ...d });
}));

router.delete('/:id', wrap(async (req, res) => {
  const [r] = await pool.execute('DELETE FROM veiculos WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) throw new HttpError(404, 'Veículo não encontrado.');
  res.status(204).end();
}));

export default router;
