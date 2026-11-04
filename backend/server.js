import { env } from './config/env.js'; // carrega o .env primeiro
import mongoose from 'mongoose';
import app from './app.js';
import Agendamento from './models/Agendamento.js';
import { iniciarMonitoramento, pararMonitoramento, alertar } from './services/monitorService.js';
import { verificarSmtp } from './services/emailService.js';

iniciarMonitoramento(); // handlers globais já ativos, mesmo se o banco falhar na subida

async function iniciar() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10_000, maxPoolSize: env.mongoPool });
    console.log('✅ Conectado ao MongoDB com sucesso');
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    await alertar('db_boot', 'Servidor não conseguiu iniciar (MongoDB)', err.message, { forcar: true });
    process.exit(1);
  }

  // Recria o índice único parcial (substitui o antigo, que travava horários cancelados).
  try {
    await Agendamento.syncIndexes();
  } catch (err) {
    console.warn('⚠️  Não foi possível sincronizar índices de Agendamento:', err.message);
  }

  const smtp = await verificarSmtp();
  if (!smtp.configurado) console.warn('⚠️  SMTP não configurado: e-mails serão apenas simulados no console.');
  else if (!smtp.ok) console.warn('⚠️  SMTP configurado, mas a verificação falhou:', smtp.erro);
  else console.log('📧 SMTP verificado');

  const server = app.listen(env.port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${env.port}`);
    console.log(`🩺 Health check em http://localhost:${env.port}/health`);
  });

  // Timeouts contra conexões lentas/penduradas (ataque "slowloris") e para o balanceador não cortar conexões antes da API.
  server.requestTimeout = 30_000;
  server.headersTimeout = 35_000;
  server.keepAliveTimeout = 65_000;

  // Encerramento limpo (deploys / Ctrl+C)
  const encerrar = (sinal) => {
    console.log(`\n${sinal} recebido. Encerrando...`);
    pararMonitoramento();
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => encerrar('SIGTERM'));
  process.on('SIGINT', () => encerrar('SIGINT'));
}

iniciar();
