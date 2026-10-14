import type { Barbearia, UsuarioAdmin, Barbeiro, Servico, Agendamento } from '@/types';

export const mockBarbearias: Barbearia[] = [
  {
    _id: 'b1',
    nome: 'Barbearia Navalha de Ouro',
    endereco: 'Rua das Flores, 123 - Centro, São Paulo/SP',
    telefone: '(11) 3456-7890',
    email: 'contato@navalhadeouro.com',
    horarioAbertura: '09:00',
    horarioFechamento: '20:00',
    diasFuncionamento: [1, 2, 3, 4, 5, 6],
    descricao: 'Barbearia clássica com ambiente sofisticado e profissionais experientes. Tradição em cortes masculinos desde 1998.',
    imagemUrl: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1200',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: 'b2',
    nome: 'Studio Cut Premium',
    endereco: 'Av. Paulista, 2000 - Bela Vista, São Paulo/SP',
    telefone: '(11) 2345-6789',
    email: 'contato@studiocut.com',
    horarioAbertura: '08:00',
    horarioFechamento: '21:00',
    diasFuncionamento: [1, 2, 3, 4, 5, 6],
    descricao: 'Estúdio moderno com tecnologia de ponta e atendimento premium. Cortes, barba e tratamentos capilares.',
    imagemUrl: 'https://images.pexels.com/photos/3992856/pexels-photo-3992856.jpeg?auto=compress&cs=tinysrgb&w=1200',
    createdAt: '2024-02-20T10:00:00Z',
  },
  {
    _id: 'b3',
    nome: 'Barbearia Irmãos Steel',
    endereco: 'Rua Augusta, 1500 - Consolação, São Paulo/SP',
    telefone: '(11) 4567-8901',
    email: 'contato@irmaossteel.com',
    horarioAbertura: '09:00',
    horarioFechamento: '19:00',
    diasFuncionamento: [1, 2, 3, 4, 5],
    descricao: 'Atmosfera urbana e industrial. Cortes modernos, undercut, fade e muito mais em um ambiente único.',
    imagemUrl: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200',
    createdAt: '2024-03-10T10:00:00Z',
  },
];

export const mockAdmins: UsuarioAdmin[] = [
  { _id: 'a1', nome: 'Carlos Silva', email: 'admin@navalhadeouro.com', senha: '123456', barbeariaId: 'b1' },
  { _id: 'a2', nome: 'Roberto Alves', email: 'admin@studiocut.com', senha: '123456', barbeariaId: 'b2' },
  { _id: 'a3', nome: 'Diego Steel', email: 'admin@irmaossteel.com', senha: '123456', barbeariaId: 'b3' },
];

export const mockBarbeiros: Barbeiro[] = [
  // Navalha de Ouro
  { _id: 'br1', nome: 'João Mendes', barbeariaId: 'b1', especialidades: ['Corte Clássico', 'Barba', 'Degradê'], horarioInicio: '09:00', horarioFim: '20:00', diasFolga: [0], ativo: true },
  { _id: 'br2', nome: 'Pedro Santos', barbeariaId: 'b1', especialidades: ['Corte Clássico', 'Sobrancelha'], horarioInicio: '09:00', horarioFim: '18:00', diasFolga: [6], ativo: true },
  { _id: 'br3', nome: 'Rafael Costa', barbeariaId: 'b1', especialidades: ['Degradê', 'Barba', 'Pezinho'], horarioInicio: '10:00', horarioFim: '20:00', diasFolga: [0, 6], ativo: true },
  // Studio Cut
  { _id: 'br4', nome: 'Lucas Ferreira', barbeariaId: 'b2', especialidades: ['Fade', 'Undercut', 'Barba'], horarioInicio: '08:00', horarioFim: '21:00', diasFolga: [0], ativo: true },
  { _id: 'br5', nome: 'André Oliveira', barbeariaId: 'b2', especialidades: ['Corte Masculino', 'Coloração'], horarioInicio: '08:00', horarioFim: '17:00', diasFolga: [6], ativo: true },
  { _id: 'br6', nome: 'Thiago Nunes', barbeariaId: 'b2', especialidades: ['Fade', 'Pezinho', 'Sobrancelha'], horarioInicio: '09:00', horarioFim: '21:00', diasFolga: [0, 6], ativo: true },
  // Irmãos Steel
  { _id: 'br7', nome: 'Diego Steel Jr.', barbeariaId: 'b3', especialidades: ['Undercut', 'Degradê', 'Barba'], horarioInicio: '09:00', horarioFim: '19:00', diasFolga: [0], ativo: true },
  { _id: 'br8', nome: 'Bruno Steel', barbeariaId: 'b3', especialidades: ['Fade', 'Corte Moderno'], horarioInicio: '09:00', horarioFim: '19:00', diasFolga: [5], ativo: true },
];

export const mockServicos: Servico[] = [
  // Navalha de Ouro
  { _id: 's1', nome: 'Corte Clássico', descricao: 'Corte tradicional com tesoura e máquina, finalização com pomada.', preco: 45, duracaoMinutos: 40, barbeariaId: 'b1', categoria: 'Corte' },
  { _id: 's2', nome: 'Corte + Barba', descricao: 'Corte completo com aparagem e desenho de barba.', preco: 65, duracaoMinutos: 60, barbeariaId: 'b1', categoria: 'Combo' },
  { _id: 's3', nome: 'Degradê', descricao: 'Corte degradê navalhado com precisão.', preco: 50, duracaoMinutos: 45, barbeariaId: 'b1', categoria: 'Corte' },
  { _id: 's4', nome: 'Pezinho', descricao: 'Aparagem do contorno com navalha.', preco: 20, duracaoMinutos: 20, barbeariaId: 'b1', categoria: 'Adicional' },
  { _id: 's5', nome: 'Sobrancelha', descricao: 'Design e aparagem de sobrancelhas.', preco: 15, duracaoMinutos: 15, barbeariaId: 'b1', categoria: 'Adicional' },
  // Studio Cut
  { _id: 's6', nome: 'Fade Premium', descricao: 'Corte fade com transição suave entre as grades.', preco: 60, duracaoMinutos: 50, barbeariaId: 'b2', categoria: 'Corte' },
  { _id: 's7', nome: 'Undercut', descricao: 'Corte undercut moderno com contraste marcante.', preco: 55, duracaoMinutos: 45, barbeariaId: 'b2', categoria: 'Corte' },
  { _id: 's8', nome: 'Corte + Barba Premium', descricao: 'Corte completo com barba modelada e toalha quente.', preco: 80, duracaoMinutos: 70, barbeariaId: 'b2', categoria: 'Combo' },
  { _id: 's9', nome: 'Coloração', descricao: 'Pigmentação e coloração capilar.', preco: 90, duracaoMinutos: 80, barbeariaId: 'b2', categoria: 'Tratamento' },
  // Irmãos Steel
  { _id: 's10', nome: 'Undercut Urbano', descricao: 'Undercut com raspar lateral e top texturizado.', preco: 50, duracaoMinutos: 45, barbeariaId: 'b3', categoria: 'Corte' },
  { _id: 's11', nome: 'Degradê Steel', descricao: 'Degradê marcante com acabamento navalhado.', preco: 55, duracaoMinutos: 50, barbeariaId: 'b3', categoria: 'Corte' },
  { _id: 's12', nome: 'Corte + Barba Steel', descricao: 'Combo completo: corte, barba e acabamento.', preco: 70, duracaoMinutos: 65, barbeariaId: 'b3', categoria: 'Combo' },
];

export const mockAgendamentos: Agendamento[] = [
  { _id: 'ag1', barbeariaId: 'b1', barbeiroId: 'br1', servicoId: 's1', clienteNome: 'Marcos Lima', clienteTelefone: '(11) 98765-4321', clienteEmail: 'marcos@email.com', data: getTodayISO(0), horario: '10:00', status: 'confirmado', createdAt: '2024-09-01T10:00:00Z' },
  { _id: 'ag2', barbeariaId: 'b1', barbeiroId: 'br1', servicoId: 's2', clienteNome: 'Paulo Souza', clienteTelefone: '(11) 91234-5678', clienteEmail: 'paulo@email.com', data: getTodayISO(0), horario: '14:00', status: 'confirmado', createdAt: '2024-09-02T10:00:00Z' },
  { _id: 'ag3', barbeariaId: 'b1', barbeiroId: 'br2', servicoId: 's1', clienteNome: 'Felipe Rocha', clienteTelefone: '(11) 99887-7665', clienteEmail: 'felipe@email.com', data: getTodayISO(0), horario: '11:00', status: 'confirmado', createdAt: '2024-09-03T10:00:00Z' },
  { _id: 'ag4', barbeariaId: 'b2', barbeiroId: 'br4', servicoId: 's6', clienteNome: 'Gustavo Almeida', clienteTelefone: '(11) 95544-3322', clienteEmail: 'gustavo@email.com', data: getTodayISO(0), horario: '09:00', status: 'confirmado', createdAt: '2024-09-04T10:00:00Z' },
  { _id: 'ag5', barbeariaId: 'b1', barbeiroId: 'br1', servicoId: 's3', clienteNome: 'Eduardo Dias', clienteTelefone: '(11) 94433-2211', clienteEmail: 'eduardo@email.com', data: getTodayISO(1), horario: '15:00', status: 'confirmado', createdAt: '2024-09-05T10:00:00Z' },
];

function getTodayISO(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const diasSemanaCurto = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
