// Envolve handlers async para que erros caiam no middleware de erro
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Converte erros do MySQL em respostas amigáveis
export function errorHandler(err, _req, res, _next) {
  if (err.status) return res.status(err.status).json({ erro: err.message });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Registro duplicado (valor único já existe).' });
  if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ erro: 'Não é possível excluir: existem registros vinculados.' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ erro: 'Referência inválida (registro relacionado não existe).' });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}
