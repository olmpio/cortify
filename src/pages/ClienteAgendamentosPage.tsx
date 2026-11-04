import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { clienteApi } from '@/services/api';
import { useApiData } from '@/hooks/useApiData';
import { Loading, ErrorBox, FormError } from '@/components/Feedback';
import { ClienteMenu } from '@/components/ClienteMenu';
import { AvisoEmail } from '@/components/AvisoEmail';
import { formatPreco, formatDuracao, formatDate, getDiaSemana, hojeISO, statusClasses } from '@/utils/helpers';
import type { AgendamentoCriado } from '@/types';
import { ArrowLeft, Scissors, User, Clock, Calendar, MapPin, Pencil, Check, Loader2, Repeat, Download, Trash2, ShieldCheck } from 'lucide-react';

const input =
  'w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none transition-colors';

function CartaoAgendamento({ ag, onRepetir }: { ag: AgendamentoCriado; onRepetir: () => void }) {
  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-white font-semibold truncate">{ag.barbeariaId?.nome}</p>
          <p className="text-stone-500 text-xs flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="h-3 w-3 flex-shrink-0" /> {ag.barbeariaId?.endereco}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-md flex-shrink-0 ${statusClasses[ag.status]}`}>{ag.status}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-stone-300">
          <Scissors className="h-4 w-4 text-amber-500 flex-shrink-0" /> {ag.servicoId?.nome}
          <span className="text-stone-600">· {ag.servicoId && formatDuracao(ag.servicoId.duracaoMinutos)}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-300">
          <User className="h-4 w-4 text-amber-500 flex-shrink-0" /> {ag.barbeiroId?.nome}
        </div>
        <div className="flex items-center gap-2 text-stone-300">
          <Calendar className="h-4 w-4 text-amber-500 flex-shrink-0" /> {getDiaSemana(ag.data)}, {formatDate(ag.data)}
        </div>
        <div className="flex items-center gap-2 text-stone-300">
          <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" /> {ag.horario}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-800">
        <p className="text-amber-500 font-bold">{ag.servicoId && formatPreco(ag.servicoId.preco)}</p>
        <button onClick={onRepetir} className="text-stone-400 hover:text-amber-500 text-sm font-semibold flex items-center gap-1.5 transition-colors">
          <Repeat className="h-4 w-4" /> Agendar novamente
        </button>
      </div>
    </div>
  );
}

export function ClienteAgendamentosPage() {
  const { navigate, cliente, setCliente, clienteLogout } = useApp();
  const { data, loading, erro, reload } = useApiData(() => clienteApi.agendamentos(), []);

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nome: cliente?.nome ?? '', telefone: cliente?.telefone ?? '' });
  const [salvando, setSalvando] = useState(false);
  const [erroPerfil, setErroPerfil] = useState('');
  const [excluindo, setExcluindo] = useState(false);
  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [erroLgpd, setErroLgpd] = useState('');
  const [ocupado, setOcupado] = useState(false);

  if (!cliente) return null; // o Router já barra visitantes
  if (loading && !data) return <Loading />;
  if (erro || !data) return <ErrorBox mensagem={erro ?? 'Erro ao carregar seus agendamentos.'} onRetry={reload} />;

  const hoje = hojeISO();
  const ativo = (a: AgendamentoCriado) => a.status === 'confirmado' || a.status === 'pendente';
  const proximos = data.filter((a) => ativo(a) && a.data >= hoje).sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario));
  const historico = data.filter((a) => !(ativo(a) && a.data >= hoje)); // já vem do mais recente ao mais antigo

  async function salvarPerfil() {
    if (salvando) return;
    if (form.nome.trim().length < 2) return setErroPerfil('Informe seu nome.');
    if (form.telefone.replace(/\D/g, '').length < 10) return setErroPerfil('Informe um telefone válido com DDD.');
    setSalvando(true);
    setErroPerfil('');
    try {
      const { cliente: atualizado } = await clienteApi.atualizarPerfil({ nome: form.nome.trim(), telefone: form.telefone.trim() });
      setCliente(atualizado);
      setEditando(false);
    } catch (e) {
      setErroPerfil((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function baixarDados() {
    setOcupado(true);
    setErroLgpd('');
    try {
      const dados = await clienteApi.exportarDados();
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meus-dados-barbersync.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErroLgpd((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  async function excluirConta() {
    if (!senhaExclusao) return setErroLgpd('Digite sua senha para confirmar.');
    setOcupado(true);
    setErroLgpd('');
    try {
      await clienteApi.excluirConta(senhaExclusao);
      clienteLogout();
      navigate({ name: 'home' });
    } catch (e) {
      setErroLgpd((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  const repetir = (ag: AgendamentoCriado) => navigate({ name: 'agendamento-servico', barbeariaId: ag.barbeariaId._id });

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate({ name: 'home' })} className="text-stone-400 hover:text-amber-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-amber-500" />
            <span className="text-white font-bold">Meus agendamentos</span>
          </div>
          <div className="ml-auto"><ClienteMenu /></div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {!cliente.emailVerificado && <div className="mb-6"><AvisoEmail perfil="cliente" email={cliente.email} /></div>}

        {/* Dados da conta */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-stone-500 text-xs uppercase tracking-wide">Seus dados</p>
            {!editando && (
              <button onClick={() => { setForm({ nome: cliente.nome, telefone: cliente.telefone }); setEditando(true); }} className="text-stone-400 hover:text-amber-500 text-sm flex items-center gap-1.5 transition-colors">
                <Pencil className="h-3.5 w-3.5" /> Editar
              </button>
            )}
          </div>
          {editando ? (
            <>
              <FormError mensagem={erroPerfil} />
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 text-xs block mb-1">Nome</label>
                  <input className={input} value={form.nome} onChange={(e) => { setForm({ ...form, nome: e.target.value }); setErroPerfil(''); }} />
                </div>
                <div>
                  <label className="text-stone-400 text-xs block mb-1">Telefone</label>
                  <input className={input} value={form.telefone} onChange={(e) => { setForm({ ...form, telefone: e.target.value }); setErroPerfil(''); }} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={salvarPerfil} disabled={salvando} className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold px-5 py-2 rounded-xl text-sm flex items-center gap-2 transition-all">
                  {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Salvar
                </button>
                <button onClick={() => setEditando(false)} className="text-stone-400 hover:text-white px-4 py-2 text-sm">Cancelar</button>
              </div>
            </>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div><p className="text-stone-500 text-xs">Nome</p><p className="text-white font-semibold">{cliente.nome}</p></div>
              <div><p className="text-stone-500 text-xs">Telefone</p><p className="text-white font-semibold">{cliente.telefone}</p></div>
              <div className="min-w-0"><p className="text-stone-500 text-xs">E-mail</p><p className="text-white font-semibold truncate">{cliente.email}</p></div>
            </div>
          )}
        </div>

        {data.length === 0 ? (
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-12 text-center">
            <Calendar className="h-10 w-10 text-stone-700 mx-auto mb-3" />
            <p className="text-stone-400 text-sm mb-5">Você ainda não fez nenhum agendamento.</p>
            <button onClick={() => navigate({ name: 'barbearias' })} className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-3 rounded-xl text-sm transition-all">
              Agendar agora
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-white mb-4">Próximos agendamentos</h2>
            {proximos.length === 0 ? (
              <p className="text-stone-500 text-sm mb-8">Nenhum agendamento futuro.</p>
            ) : (
              <div className="space-y-4 mb-10">
                {proximos.map((ag) => <CartaoAgendamento key={ag._id} ag={ag} onRepetir={() => repetir(ag)} />)}
              </div>
            )}

            {historico.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-white mb-4">Histórico</h2>
                <div className="space-y-4 mb-10">
                  {historico.map((ag) => <CartaoAgendamento key={ag._id} ag={ag} onRepetir={() => repetir(ag)} />)}
                </div>
              </>
            )}
          </>
        )}

        {/* Privacidade e dados (LGPD) */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 mb-16">
          <p className="text-stone-500 text-xs uppercase tracking-wide flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 text-amber-500" /> Privacidade e dados</p>
          <FormError mensagem={erroLgpd} />
          <div className="flex flex-wrap gap-3">
            <button onClick={baixarDados} disabled={ocupado} className="bg-stone-800 hover:bg-stone-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors">
              <Download className="h-4 w-4 text-amber-500" /> Baixar meus dados
            </button>
            {!excluindo && (
              <button onClick={() => setExcluindo(true)} className="text-stone-400 hover:text-red-400 text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors">
                <Trash2 className="h-4 w-4" /> Excluir minha conta
              </button>
            )}
          </div>
          {excluindo && (
            <div className="mt-4 bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-300 text-sm mb-1 font-semibold">Esta ação é permanente.</p>
              <p className="text-stone-400 text-xs mb-3">Apagamos sua conta, conversas e sessões. Os agendamentos passados ficam anonimizados para as barbearias.</p>
              <input
                type="password"
                value={senhaExclusao}
                onChange={(e) => { setSenhaExclusao(e.target.value); setErroLgpd(''); }}
                placeholder="Digite sua senha para confirmar"
                autoComplete="current-password"
                className={input}
              />
              <div className="flex gap-2 mt-3">
                <button onClick={excluirConta} disabled={ocupado} className="bg-red-500 hover:bg-red-400 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-xl text-sm flex items-center gap-2 transition-all">
                  {ocupado && <Loader2 className="h-4 w-4 animate-spin" />} Excluir definitivamente
                </button>
                <button onClick={() => { setExcluindo(false); setSenhaExclusao(''); setErroLgpd(''); }} className="text-stone-400 hover:text-white px-4 py-2 text-sm">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
