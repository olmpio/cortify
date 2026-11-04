import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { chatApi } from '@/services/api';
import { useApiData } from '@/hooks/useApiData';
import { ChatThread } from '@/components/ChatThread';
import { ClienteMenu } from '@/components/ClienteMenu';
import { Loading, ErrorBox } from '@/components/Feedback';
import { ArrowLeft, MessageCircle, Store } from 'lucide-react';

function dataCurta(iso: string) {
  const d = new Date(iso);
  return new Date().toDateString() === d.toDateString()
    ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** Chat do cliente com as barbearias. Se vier com `barbeariaId`, abre (ou cria) a conversa com ela. */
export function ClienteChatPage({ barbeariaId }: { barbeariaId?: string }) {
  const { navigate } = useApp();
  const { data, loading, erro, reload } = useApiData(() => chatApi.cliente.conversas(), []);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [erroAbrir, setErroAbrir] = useState('');

  // Veio de "Conversar com a barbearia": abre/cria a conversa e já seleciona
  useEffect(() => {
    if (!barbeariaId) return;
    let cancelado = false;
    chatApi.cliente
      .iniciar(barbeariaId)
      .then((c) => { if (!cancelado) { setSelecionada(c._id); reload(); } })
      .catch((e: Error) => { if (!cancelado) setErroAbrir(e.message); });
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barbeariaId]);

  if (loading && !data) return <Loading />;
  if (erro || !data) return <ErrorBox mensagem={erro ?? 'Erro ao carregar as conversas.'} onRetry={reload} />;

  const atual = data.find((c) => c._id === selecionada);

  return (
    <div className="h-screen bg-stone-950 flex flex-col">
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => (atual ? setSelecionada(null) : navigate({ name: 'home' }))}
            title="Voltar"
            aria-label="Voltar"
            className="p-2 -ml-2 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <MessageCircle className="h-5 w-5 text-amber-500" />
          <span className="text-white font-bold">{atual ? atual.barbeariaId.nome : 'Mensagens'}</span>
          <div className="ml-auto"><ClienteMenu /></div>
        </div>
      </div>

      <div className="flex-1 min-h-0 mx-auto w-full max-w-5xl md:grid md:grid-cols-[300px_1fr] md:border-x border-stone-800">
        {/* Lista de conversas */}
        <div className={`${atual ? 'hidden md:block' : 'block'} overflow-y-auto border-r border-stone-800 h-full`}>
          {erroAbrir && <p className="text-red-400 text-sm p-4">{erroAbrir}</p>}
          {data.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-10 w-10 text-stone-700 mx-auto mb-3" />
              <p className="text-stone-400 text-sm mb-4">Você ainda não conversou com nenhuma barbearia.</p>
              <button onClick={() => navigate({ name: 'barbearias' })} className="text-amber-500 hover:text-amber-400 text-sm font-semibold">
                Ver barbearias
              </button>
              <p className="text-stone-600 text-xs mt-2">Abra a página de uma barbearia e toque em "Conversar".</p>
            </div>
          ) : (
            data.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelecionada(c._id)}
                className={`w-full text-left px-4 py-3.5 border-b border-stone-800/60 flex items-center gap-3 transition-colors ${
                  selecionada === c._id ? 'bg-stone-800/70' : 'hover:bg-stone-900'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Store className="h-5 w-5 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-sm font-semibold truncate">{c.barbeariaId.nome}</p>
                    <span className="text-stone-600 text-xs flex-shrink-0">{c.ultimaMensagem && dataCurta(c.ultimaMensagemEm)}</span>
                  </div>
                  <p className="text-stone-500 text-xs truncate mt-0.5">{c.ultimaMensagem || 'Sem mensagens'}</p>
                </div>
                {c.naoLidasCliente > 0 && (
                  <span className="bg-amber-500 text-stone-950 text-[11px] font-bold min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">
                    {c.naoLidasCliente}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Conversa aberta */}
        <div className={`${atual ? 'block' : 'hidden md:flex'} h-full min-h-0 md:items-stretch`}>
          {atual ? (
            <div className="w-full h-full">
              <ChatThread
                conversaId={atual._id}
                euSou="cliente"
                listar={(depois) => chatApi.cliente.mensagens(atual._id, depois)}
                enviar={(texto) => chatApi.cliente.enviar(atual._id, texto)}
                aoAtualizar={reload}
              />
            </div>
          ) : (
            <div className="hidden md:flex w-full items-center justify-center text-stone-600 text-sm">
              Selecione uma conversa
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
