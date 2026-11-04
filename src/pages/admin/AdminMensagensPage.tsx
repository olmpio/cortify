import { useState } from 'react';
import { useAdmin } from '@/context/AppContext';
import { chatApi } from '@/services/api';
import { useApiData } from '@/hooks/useApiData';
import { ChatThread } from '@/components/ChatThread';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Loading, ErrorBox } from '@/components/Feedback';
import { getAvatarIniciais } from '@/utils/helpers';
import { MessageCircle, ArrowLeft } from 'lucide-react';

function dataCurta(iso: string) {
  const d = new Date(iso);
  return new Date().toDateString() === d.toDateString()
    ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** Caixa de entrada da barbearia: conversas com os clientes. */
export function AdminMensagensPage() {
  const { barbeariaId, navigate } = useAdmin();
  const { data, loading, erro, reload } = useApiData(() => chatApi.admin.conversas(), [barbeariaId]);
  const [selecionada, setSelecionada] = useState<string | null>(null);

  if (loading && !data) return <Loading />;
  if (erro || !data) return <ErrorBox mensagem={erro ?? 'Erro ao carregar as mensagens.'} onRetry={reload} />;

  const atual = data.find((c) => c._id === selecionada);

  return (
    <div className="h-screen bg-stone-950 flex flex-col">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
          {/* No celular, com uma conversa aberta, a seta volta para a lista; senão, para o Dashboard */}
          <button
            onClick={() => (atual && window.matchMedia('(max-width: 767px)').matches ? setSelecionada(null) : navigate({ name: 'admin-dashboard' }))}
            title="Voltar"
            aria-label="Voltar"
            className="p-2 -ml-2 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <MessageCircle className="h-5 w-5 text-amber-500" />
          <span className="text-white font-semibold text-sm">{atual ? atual.clienteId.nome : 'Mensagens'}</span>
          {atual && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-stone-500 text-xs hidden sm:block">{atual.clienteId.telefone}</span>
              <WhatsAppButton telefone={atual.clienteId.telefone} comTexto />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 mx-auto w-full max-w-5xl md:grid md:grid-cols-[300px_1fr] md:border-x border-stone-800">
        <div className={`${atual ? 'hidden md:block' : 'block'} overflow-y-auto border-r border-stone-800 h-full`}>
          {data.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-10 w-10 text-stone-700 mx-auto mb-3" />
              <p className="text-stone-400 text-sm">Nenhum cliente enviou mensagem ainda.</p>
              <p className="text-stone-600 text-xs mt-2">Quando alguém tocar em "Conversar" na página da sua barbearia, a conversa aparece aqui.</p>
            </div>
          ) : (
            data.map((c) => (
              <button
                key={c._id}
                onClick={() => { setSelecionada(c._id); }}
                className={`w-full text-left px-4 py-3.5 border-b border-stone-800/60 flex items-center gap-3 transition-colors ${
                  selecionada === c._id ? 'bg-stone-800/70' : 'hover:bg-stone-900'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 flex items-center justify-center text-amber-500 font-bold text-sm border border-amber-500/20 flex-shrink-0">
                  {getAvatarIniciais(c.clienteId.nome)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-sm font-semibold truncate">{c.clienteId.nome}</p>
                    <span className="text-stone-600 text-xs flex-shrink-0">{c.ultimaMensagem && dataCurta(c.ultimaMensagemEm)}</span>
                  </div>
                  <p className="text-stone-500 text-xs truncate mt-0.5">{c.ultimaMensagem || 'Sem mensagens'}</p>
                </div>
                {c.naoLidasBarbearia > 0 && (
                  <span className="bg-amber-500 text-stone-950 text-[11px] font-bold min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">
                    {c.naoLidasBarbearia}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className={`${atual ? 'block' : 'hidden md:flex'} h-full min-h-0`}>
          {atual ? (
            <div className="w-full h-full">
              <ChatThread
                conversaId={atual._id}
                euSou="barbearia"
                listar={(depois) => chatApi.admin.mensagens(atual._id, depois)}
                enviar={(texto) => chatApi.admin.enviar(atual._id, texto)}
                aoAtualizar={reload}
              />
            </div>
          ) : (
            <div className="hidden md:flex w-full items-center justify-center text-stone-600 text-sm">Selecione uma conversa</div>
          )}
        </div>
      </div>
    </div>
  );
}
