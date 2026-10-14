import type { Barbeiro, Servico, Agendamento, Barbearia } from '@/types';
import { mockBarbearias, mockBarbeiros, mockServicos, mockAgendamentos, mockAdmins } from '@/data/mockData';

export function formatPreco(preco: number): string {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, '0')}`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function getDiaSemana(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return dias[date.getDay()];
}

export function generateTimeSlots(inicio: string, fim: string, intervalo: number): string[] {
  const slots: string[] = [];
  const [hIni, mIni] = inicio.split(':').map(Number);
  const [hFim, mFim] = fim.split(':').map(Number);
  let total = hIni * 60 + mIni;
  const end = hFim * 60 + mFim;
  while (total + intervalo <= end) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    total += intervalo;
  }
  return slots;
}

export function getProximosDias(quantidade: number): { iso: string; diaSemana: number; label: string; dia: string; mes: string }[] {
  const dias: { iso: string; diaSemana: number; label: string; dia: string; mes: string }[] = [];
  const nomesMes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const nomesDia = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hoje = new Date();
  for (let i = 0; i < quantidade; i++) {
    const d = new Date(hoje);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    dias.push({
      iso,
      diaSemana: d.getDay(),
      label: nomesDia[d.getDay()],
      dia: d.getDate().toString().padStart(2, '0'),
      mes: nomesMes[d.getMonth()],
    });
  }
  return dias;
}

export function isBarbeiroDisponivel(
  barbeiro: Barbeiro,
  dataISO: string,
  horario: string,
  servico: Servico,
  agendamentos: Agendamento[]
): boolean {
  const [y, m, d] = dataISO.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const diaSemana = date.getDay();

  if (barbeiro.diasFolga.includes(diaSemana)) return false;

  const [bh, bm] = horario.split(':').map(Number);
  const inicioMin = bh * 60 + bm;
  const [fIniH, fIniM] = barbeiro.horarioInicio.split(':').map(Number);
  const [fFimH, fFimM] = barbeiro.horarioFim.split(':').map(Number);
  const expedienteInicio = fIniH * 60 + fIniM;
  const expedienteFim = fFimH * 60 + fFimM;
  const fimMin = inicioMin + servico.duracaoMinutos;

  if (inicioMin < expedienteInicio || fimMin > expedienteFim) return false;

  const agendamentosBarbeiro = agendamentos.filter(
    (a) =>
      a.barbeiroId === barbeiro._id &&
      a.data === dataISO &&
      (a.status === 'confirmado' || a.status === 'pendente')
  );

  for (const ag of agendamentosBarbeiro) {
    const [aH, aM] = ag.horario.split(':').map(Number);
    const agInicio = aH * 60 + aM;
    const servicoAg = mockServicos.find((s) => s._id === ag.servicoId);
    const agFim = agInicio + (servicoAg?.duracaoMinutos || 30);
    if (inicioMin < agFim && fimMin > agInicio) return false;
  }

  return true;
}

export function getBarbeirosDisponiveis(
  barbeariaId: string,
  servicoId: string,
  dataISO: string,
  horario: string
): Barbeiro[] {
  const servico = mockServicos.find((s) => s._id === servicoId);
  if (!servico) return [];
  const barbeiros = mockBarbeiros.filter((b) => b.barbeariaId === barbeariaId && b.ativo);
  return barbeiros.filter((b) => isBarbeiroDisponivel(b, dataISO, horario, servico, mockAgendamentos));
}

export function getHorariosDisponiveisBarbeiro(
  barbeiro: Barbeiro,
  barbearia: Barbearia,
  servico: Servico,
  dataISO: string
): string[] {
  const [y, m, d] = dataISO.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const diaSemana = date.getDay();

  if (barbeiro.diasFolga.includes(diaSemana)) return [];
  if (!barbearia.diasFuncionamento.includes(diaSemana)) return [];

  const expedienteInicio = barbeiro.horarioInicio > barbearia.horarioAbertura
    ? barbeiro.horarioInicio
    : barbearia.horarioAbertura;
  const expedienteFim = barbeiro.horarioFim < barbearia.horarioFechamento
    ? barbeiro.horarioFim
    : barbearia.horarioFechamento;

  const slots = generateTimeSlots(expedienteInicio, expedienteFim, 30);
  return slots.filter((slot) => isBarbeiroDisponivel(barbeiro, dataISO, slot, servico, mockAgendamentos));
}

export function getBarbeariaById(id: string): Barbearia | undefined {
  return mockBarbearias.find((b) => b._id === id);
}

export function getBarbeiroById(id: string): Barbeiro | undefined {
  return mockBarbeiros.find((b) => b._id === id);
}

export function getServicoById(id: string): Servico | undefined {
  return mockServicos.find((s) => s._id === id);
}

export function getServicosByBarbearia(barbeariaId: string): Servico[] {
  return mockServicos.filter((s) => s.barbeariaId === barbeariaId);
}

export function getBarbeirosByBarbearia(barbeariaId: string): Barbeiro[] {
  return mockBarbeiros.filter((b) => b.barbeariaId === barbeariaId);
}

export function getAgendamentosByBarbearia(barbeariaId: string): Agendamento[] {
  return mockAgendamentos.filter((a) => a.barbeariaId === barbeariaId);
}

export function validateAdminLogin(email: string, senha: string): { success: boolean; admin?: typeof mockAdmins[0] } {
  const admin = mockAdmins.find((a) => a.email === email && a.senha === senha);
  return admin ? { success: true, admin } : { success: false };
}

export function gerarId(): string {
  return 'ag' + Math.random().toString(36).substr(2, 9);
}

export function getAvatarIniciais(nome: string): string {
  const partes = nome.trim().split(' ');
  if (partes.length >= 2) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  return nome.substring(0, 2).toUpperCase();
}
