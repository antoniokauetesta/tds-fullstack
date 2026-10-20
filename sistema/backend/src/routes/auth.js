// Funcionalidade de LOGIN: /api/auth  (login, registro, logout, me)
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { pool } from '../db.js';
import { wrap, HttpError } from '../utils/http.js';
import { emailValido, senhaForte } from '../utils/validators.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

// Proteção contra força bruta: 10 tentativas / 15 min por IP
const limitador = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

const cookieOpts = () => ({
  httpOnly: true,                       // JS do navegador não lê o cookie (anti-XSS)
  sameSite: 'strict',                   // anti-CSRF
  secure: process.env.NODE_ENV === 'production',
  maxAge: 8 * 60 * 60 * 1000,
});

// hash fictício para manter o tempo de resposta igual quando o e-mail não existe
const HASH_FALSO = bcrypt.hashSync('nao-existe', 10);

router.post('/login', limitador, wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');
  const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
  const u = rows[0];
  const ok = await bcrypt.compare(senha, u?.senha_hash || HASH_FALSO);
  if (!u || !ok) throw new HttpError(401, 'E-mail ou senha inválidos.');

  const token = jwt.sign({ id: u.id, nome: u.nome, perfil: u.perfil }, process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  res.cookie('token', token, cookieOpts());
  res.json({ id: u.id, nome: u.nome, email: u.email, perfil: u.perfil });
}));

router.post('/registro', limitador, wrap(async (req, res) => {
  const nome = String(req.body.nome || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');
  if (!nome || !emailValido(email)) throw new HttpError(400, 'Informe nome e e-mail válidos.');
  if (!senhaForte(senha)) throw new HttpError(400, 'Senha: mínimo 8 caracteres, com letras e números.');
  const hash = await bcrypt.hash(senha, 10);
  await pool.execute('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?,?,?)', [nome, email, hash]);
  res.status(201).json({ mensagem: 'Conta criada.' });
}));

router.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.json({ mensagem: 'Sessão encerrada.' });
});

router.get('/me', autenticar, (req, res) => res.json(req.user));

export default router;
