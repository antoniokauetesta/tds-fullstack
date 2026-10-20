// Funcionalidade PRINCIPAL: servidor Express, segurança global e montagem das rotas
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { autenticar } from './middleware/auth.js';
import { errorHandler } from './utils/http.js';
import authRoutes from './routes/auth.js';
import clientesRoutes from './routes/clientes.js';
import veiculosRoutes from './routes/veiculos.js';
import agendamentosRoutes, { servicos } from './routes/agendamentos.js';

for (const v of ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET']) {
  if (!process.env[v]) { console.error(`Variável ${v} ausente no .env`); process.exit(1); }
}
if (process.env.JWT_SECRET.length < 32) { console.error('JWT_SECRET deve ter ao menos 32 caracteres.'); process.exit(1); }

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/saude', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);                          // pública
app.use('/api/clientes', autenticar, clientesRoutes);      // protegidas por JWT
app.use('/api/veiculos', autenticar, veiculosRoutes);
app.use('/api/servicos', autenticar, servicos);
app.use('/api/agendamentos', autenticar, agendamentosRoutes);
app.use('/api', (_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use(errorHandler);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
