// Gerenciamento de CLIENTES: /api/clientes
import { Router } from 'express';
import { pool } from '../db.js';
import { wrap, HttpError } from '../utils/http.js';
import { cpfValido, emailValido } from '../utils/validators.js';

const router = Router();

function ler(body) {
  const d = {
    nome: String(body.nome || '').trim(),
    cpf: String(body.cpf || '').trim(),
    telefone: String(body.telefone || '').trim() || null,
    email: String(body.email || '').trim() || null,
    endereco: String(body.endereco || '').trim() || null,
  };
  if (!d.nome) throw new HttpError(400, 'O nome é obrigatório.');
  if (!cpfValido(d.cpf)) throw new HttpError(400, 'CPF inválido.');
  if (d.email && !emailValido(d.email)) throw new HttpError(400, 'E-mail inválido.');
  return d;
}

router.get('/', wrap(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM clientes ORDER BY nome');
  res.json(rows);
}));

router.post('/', wrap(async (req, res) => {
  const d = ler(req.body);
  const [r] = await pool.execute(
    'INSERT INTO clientes (nome, cpf, telefone, email, endereco) VALUES (?,?,?,?,?)',
    [d.nome, d.cpf, d.telefone, d.email, d.endereco]);
  res.status(201).json({ id: r.insertId, ...d });
}));

router.put('/:id', wrap(async (req, res) => {
  const d = ler(req.body);
  const [r] = await pool.execute(
    'UPDATE clientes SET nome=?, cpf=?, telefone=?, email=?, endereco=? WHERE id=?',
    [d.nome, d.cpf, d.telefone, d.email, d.endereco, req.params.id]);
  if (!r.affectedRows) throw new HttpError(404, 'Cliente não encontrado.');
  res.json({ id: Number(req.params.id), ...d });
}));

router.delete('/:id', wrap(async (req, res) => {
  const [r] = await pool.execute('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) throw new HttpError(404, 'Cliente não encontrado.');
  res.status(204).end();
}));

export default router;
