import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  getBarbeariaById, getServicoById, getBarbeiroById,
  formatPreco, formatDuracao, formatDate, getDiaSemana, gerarId,
} from '@/utils/helpers';
import { ArrowLeft, Scissors, User, Clock, Calendar, MapPin, Check } from 'lucide-react';
import type { Agendamento } from '@/types';

export function AgendamentoConfirmacaoPage({
  barbeariaId, servicoId, barbeiroId, data, horario,
}: {
  barbeariaId: string; servicoId: string; barbeiroId: string; data: string; horario: string;
}) {
  const { navigate, adicionarAgendamento } = useApp();
  const barbearia = getBarbeariaById(barbeariaId);
  const servico = getServicoById(servicoId);
  const barbeiro = getBarbeiroById(barbeiroId);

  const [form, setForm] = useState({ nome: '', telefone: '', email: '' });
  const [erros, setErros] = useState<Record<string, string>>({});

  if (!barbearia || !servico || !barbeiro) {
    return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400">Dados não encontrados.</div>;
  }

  function validar(): boolean {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Informe seu nome';
    if (!form.telefone.trim()) e.telefone = 'Informe seu telefone';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function confirmar() {
    if (!validar()) return;
    const novoAgendamento: Agendamento = {
      _id: gerarId(),
      barbeariaId,
      barbeiroId,
      servicoId,
      clienteNome: form.nome.trim(),
      clienteTelefone: form.telefone.trim(),
      clienteEmail: form.email.trim(),
      data,
      horario,
      status: 'confirmado',
      createdAt: new Date().toISOString(),
    };
    adicionarAgendamento(novoAgendamento);
    navigate({ name: 'agendamento-sucesso', agendamentoId: novoAgendamento._id });
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate({ name: 'agendamento-barbeiro', barbeariaId, servicoId })} className="text-stone-400 hover:text-amber-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-stone-500 text-xs">Passo 3 de 3 — Agendamento</p>
            <p className="text-white font-semibold text-sm">{barbearia.nome}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-amber-500 rounded-full" />
          <div className="flex-1 h-1.5 bg-amber-500 rounded-full" />
          <div className="flex-1 h-1.5 bg-amber-500 rounded-full" />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-amber-500 font-semibold">Serviço</span>
          <span className="text-amber-500 font-semibold">Barbeiro & Horário</span>
          <span className="text-amber-500 font-semibold">Confirmação</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Confirme seu Agendamento</h1>
        <p className="text-stone-400 text-sm mb-8">Revise os detalhes e preencha seus dados</p>

        {/* Resumo */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 mb-6">
          <p className="text-stone-500 text-xs uppercase tracking-wide mb-4">Resumo do Agendamento</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Scissors className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-stone-500 text-xs">Serviço</p>
                <p className="text-white font-semibold">{servico.nome}</p>
              </div>
              <p className="text-amber-500 font-bold">{formatPreco(servico.preco)}</p>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-stone-500 text-xs">Barbeiro</p>
                <p className="text-white font-semibold">{barbeiro.nome}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-stone-500 text-xs">Data</p>
                <p className="text-white font-semibold">{getDiaSemana(data)}, {formatDate(data)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-stone-500 text-xs">Horário</p>
                <p className="text-white font-semibold">{horario} · {formatDuracao(servico.duracaoMinutos)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-stone-800">
              <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-stone-500 text-xs">Local</p>
                <p className="text-white text-sm">{barbearia.endereco}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
          <p className="text-stone-500 text-xs uppercase tracking-wide mb-4">Seus Dados</p>
          <div className="space-y-4">
            <div>
              <label className="text-stone-400 text-sm font-medium block mb-1.5">Nome completo *</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors"
                placeholder="Seu nome"
              />
              {erros.nome && <p className="text-red-400 text-xs mt-1">{erros.nome}</p>}
            </div>
            <div>
              <label className="text-stone-400 text-sm font-medium block mb-1.5">Telefone / WhatsApp *</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors"
                placeholder="(00) 00000-0000"
              />
              {erros.telefone && <p className="text-red-400 text-xs mt-1">{erros.telefone}</p>}
            </div>
            <div>
              <label className="text-stone-400 text-sm font-medium block mb-1.5">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors"
                placeholder="seu@email.com"
              />
              {erros.email && <p className="text-red-400 text-xs mt-1">{erros.email}</p>}
            </div>
          </div>

          <button
            onClick={confirmar}
            className="w-full mt-6 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-4 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Check className="h-5 w-5" />
            Confirmar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
}
