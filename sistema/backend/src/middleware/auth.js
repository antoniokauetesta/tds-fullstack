// Autenticação: valida o JWT guardado em cookie httpOnly
import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ erro: 'Não autenticado.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
  }
}

export const apenasAdmin = (req, res, next) =>
  req.user?.perfil === 'admin' ? next() : res.status(403).json({ erro: 'Acesso restrito ao administrador.' });
