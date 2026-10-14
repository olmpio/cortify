export interface Barbearia {
  _id: string;
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  horarioAbertura: string;
  horarioFechamento: string;
  diasFuncionamento: number[];
  descricao?: string;
  imagemUrl?: string;
  createdAt: string;
}

export interface UsuarioAdmin {
  _id: string;
  nome: string;
  email: string;
  senha: string;
  barbeariaId: string;
}

export interface Barbeiro {
  _id: string;
  nome: string;
  barbeariaId: string;
  especialidades: string[];
  horarioInicio: string;
  horarioFim: string;
  diasFolga: number[];
  avatarUrl?: string;
  ativo: boolean;
}

export interface Servico {
  _id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: string;
  categoria: string;
}

export interface Agendamento {
  _id: string;
  barbeariaId: string;
  barbeiroId: string;
  servicoId: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string;
  data: string;
  horario: string;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
  createdAt: string;
}

export type PageView =
  | { name: 'home' }
  | { name: 'barbearias' }
  | { name: 'barbearia-detail'; barbeariaId: string }
  | { name: 'agendamento-servico'; barbeariaId: string }
  | { name: 'agendamento-barbeiro'; barbeariaId: string; servicoId: string }
  | { name: 'agendamento-horario'; barbeariaId: string; servicoId: string; barbeiroId: string }
  | { name: 'agendamento-confirmacao'; barbeariaId: string; servicoId: string; barbeiroId: string; data: string; horario: string }
  | { name: 'agendamento-sucesso'; agendamentoId: string }
  | { name: 'admin-login' }
  | { name: 'admin-dashboard' }
  | { name: 'admin-barbearia' }
  | { name: 'admin-barbeiros' }
  | { name: 'admin-servicos' }
  | { name: 'admin-agenda' };
