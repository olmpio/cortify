import express from 'express';
import cors from 'cors';
import barbeariaRoutes from './routes/barbeariaRoutes.js';
import servicoRoutes from './routes/servicoRoutes.js';
import barbeiroRoutes from './routes/barbeiroRoutes.js';
import agendamentoRoutes from './routes/agendamentoRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({
    nome: 'BarberSync API',
    versao: '1.0.0',
    descricao: 'Sistema SaaS multi-barbearias para agendamento de horários',
    endpoints: {
      barbearias: '/api/barbearias',
      servicos: '/api/servicos',
      barbeiros: '/api/barbeiros',
      agendamentos: '/api/agendamentos',
      auth: '/api/auth',
    },
  });
});

app.use('/api/barbearias', barbeariaRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/barbeiros', barbeiroRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor', detalhe: err.message });
});

export default app;
