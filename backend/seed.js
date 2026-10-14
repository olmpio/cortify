import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Barbearia from './models/Barbearia.js';
import UsuarioAdmin from './models/UsuarioAdmin.js';
import Barbeiro from './models/Barbeiro.js';
import Servico from './models/Servico.js';
import Agendamento from './models/Agendamento.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barbersync';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    await Promise.all([
      Barbearia.deleteMany({}),
      UsuarioAdmin.deleteMany({}),
      Barbeiro.deleteMany({}),
      Servico.deleteMany({}),
      Agendamento.deleteMany({}),
    ]);
    console.log('🧹 Base limpa');

    const barbearias = await Barbearia.insertMany([
      {
        nome: 'Barbearia Navalha de Prata ',
        endereco: 'Rua das Flores, 123 - Centro, São Paulo/SP',
        telefone: '(11) 3456-7890',
        email: 'contato@navalhadeouro.com',
        horarioAbertura: '09:00',
        horarioFechamento: '20:00',
        diasFuncionamento: [1, 2, 3, 4, 5, 6],
        descricao: 'Barbearia clássica com ambiente sofisticado e profissionais experientes.',
        imagemUrl: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        nome: 'Studio Cut Premium',
        endereco: 'Av. Paulista, 2000 - Bela Vista, São Paulo/SP',
        telefone: '(11) 2345-6789',
        email: 'contato@studiocut.com',
        horarioAbertura: '08:00',
        horarioFechamento: '21:00',
        diasFuncionamento: [1, 2, 3, 4, 5, 6],
        descricao: 'Estúdio moderno com tecnologia de ponta e atendimento premium.',
        imagemUrl: 'https://images.pexels.com/photos/3992856/pexels-photo-3992856.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        nome: 'Barbearia Irmãos Steel',
        endereco: 'Rua Augusta, 1500 - Consolação, São Paulo/SP',
        telefone: '(11) 4567-8901',
        email: 'contato@irmaossteel.com',
        horarioAbertura: '09:00',
        horarioFechamento: '19:00',
        diasFuncionamento: [1, 2, 3, 4, 5],
        descricao: 'Atmosfera urbana e industrial. Cortes modernos em um ambiente único.',
        imagemUrl: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
    ]);

    const admins = await UsuarioAdmin.insertMany([
      { nome: 'Carlos Silva', email: 'admin@navalhadeouro.com', senha: '123456', barbeariaId: barbearias[0]._id },
      { nome: 'Roberto Alves', email: 'admin@studiocut.com', senha: '123456', barbeariaId: barbearias[1]._id },
      { nome: 'Diego Steel', email: 'admin@irmaossteel.com', senha: '123456', barbeariaId: barbearias[2]._id },
    ]);

    const barbeiros = await Barbeiro.insertMany([
      { nome: 'João Mendes', barbeariaId: barbearias[0]._id, especialidades: ['Corte Clássico', 'Barba', 'Degradê'], horarioInicio: '09:00', horarioFim: '20:00', diasFolga: [0], ativo: true },
      { nome: 'Pedro Santos', barbeariaId: barbearias[0]._id, especialidades: ['Corte Clássico', 'Sobrancelha'], horarioInicio: '09:00', horarioFim: '18:00', diasFolga: [6], ativo: true },
      { nome: 'Rafael Costa', barbeariaId: barbearias[0]._id, especialidades: ['Degradê', 'Barba', 'Pezinho'], horarioInicio: '10:00', horarioFim: '20:00', diasFolga: [0, 6], ativo: true },
      { nome: 'Lucas Ferreira', barbeariaId: barbearias[1]._id, especialidades: ['Fade', 'Undercut', 'Barba'], horarioInicio: '08:00', horarioFim: '21:00', diasFolga: [0], ativo: true },
      { nome: 'André Oliveira', barbeariaId: barbearias[1]._id, especialidades: ['Corte Masculino', 'Coloração'], horarioInicio: '08:00', horarioFim: '17:00', diasFolga: [6], ativo: true },
      { nome: 'Diego Steel Jr.', barbeariaId: barbearias[2]._id, especialidades: ['Undercut', 'Degradê', 'Barba'], horarioInicio: '09:00', horarioFim: '19:00', diasFolga: [0], ativo: true },
      { nome: 'Bruno Steel', barbeariaId: barbearias[2]._id, especialidades: ['Fade', 'Corte Moderno'], horarioInicio: '09:00', horarioFim: '19:00', diasFolga: [5], ativo: true },
    ]);

    const servicos = await Servico.insertMany([
      { nome: 'Corte Clássico', descricao: 'Corte tradicional com tesoura e máquina.', preco: 45, duracaoMinutos: 40, barbeariaId: barbearias[0]._id, categoria: 'Corte' },
      { nome: 'Corte + Barba', descricao: 'Corte completo com aparagem de barba.', preco: 65, duracaoMinutos: 60, barbeariaId: barbearias[0]._id, categoria: 'Combo' },
      { nome: 'Degradê', descricao: 'Corte degradê navalhado com precisão.', preco: 50, duracaoMinutos: 45, barbeariaId: barbearias[0]._id, categoria: 'Corte' },
      { nome: 'Pezinho', descricao: 'Aparagem do contorno com navalha.', preco: 20, duracaoMinutos: 20, barbeariaId: barbearias[0]._id, categoria: 'Adicional' },
      { nome: 'Fade Premium', descricao: 'Corte fade com transição suave.', preco: 60, duracaoMinutos: 50, barbeariaId: barbearias[1]._id, categoria: 'Corte' },
      { nome: 'Undercut', descricao: 'Corte undercut moderno.', preco: 55, duracaoMinutos: 45, barbeariaId: barbearias[1]._id, categoria: 'Corte' },
      { nome: 'Corte + Barba Premium', descricao: 'Combo completo com toalha quente.', preco: 80, duracaoMinutos: 70, barbeariaId: barbearias[1]._id, categoria: 'Combo' },
      { nome: 'Undercut Urbano', descricao: 'Undercut com raspar lateral.', preco: 50, duracaoMinutos: 45, barbeariaId: barbearias[2]._id, categoria: 'Corte' },
      { nome: 'Degradê Steel', descricao: 'Degradê marcante navalhado.', preco: 55, duracaoMinutos: 50, barbeariaId: barbearias[2]._id, categoria: 'Corte' },
      { nome: 'Corte + Barba Steel', descricao: 'Combo completo.', preco: 70, duracaoMinutos: 65, barbeariaId: barbearias[2]._id, categoria: 'Combo' },
    ]);

    const hoje = new Date().toISOString().split('T')[0];
    const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    await Agendamento.insertMany([
      { barbeariaId: barbearias[0]._id, barbeiroId: barbeiros[0]._id, servicoId: servicos[0]._id, clienteNome: 'Marcos Lima', clienteTelefone: '(11) 98765-4321', data: hoje, horario: '10:00', status: 'confirmado' },
      { barbeariaId: barbearias[0]._id, barbeiroId: barbeiros[0]._id, servicoId: servicos[1]._id, clienteNome: 'Paulo Souza', clienteTelefone: '(11) 91234-5678', data: hoje, horario: '14:00', status: 'confirmado' },
      { barbeariaId: barbearias[1]._id, barbeiroId: barbeiros[3]._id, servicoId: servicos[4]._id, clienteNome: 'Gustavo Almeida', clienteTelefone: '(11) 95544-3322', data: hoje, horario: '09:00', status: 'confirmado' },
      { barbeariaId: barbearias[0]._id, barbeiroId: barbeiros[0]._id, servicoId: servicos[2]._id, clienteNome: 'Eduardo Dias', clienteTelefone: '(11) 94433-2211', data: amanha, horario: '15:00', status: 'confirmado' },
    ]);

    console.log('🌱 Seed concluído com sucesso!');
    console.log(`   ${barbearias.length} barbearias`);
    console.log(`   ${admins.length} admins`);
    console.log(`   ${barbeiros.length} barbeiros`);
    console.log(`   ${servicos.length} serviços`);
    console.log(`   4 agendamentos`);
    console.log('\n📋 Contas de admin:');
    admins.forEach((a) => console.log(`   ${a.email} / 123456`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  }
}

seed();
