import { useEffect, useRef, useState } from 'react';
import type { Mensagem } from '@/types';
import { Loader2, Send } from 'lucide-react';

interface Props {
  /** Muda quando o usuário troca de conversa (reinicia a lista). */
  conversaId: string;
  /** Sem `depois`: histórico recente. Com `depois` (ISO): só as mensagens mais novas. */
  listar: (depois?: string) => Promise<Mensagem[]>;
  enviar: (texto: string) => Promise<Mensagem>;
  /** Quem é "eu" nesta tela: define o lado e a cor dos balões. */
  euSou: 'cliente' | 'barbearia';
  /** Chamado quando chegam mensagens novas (ex.: para atualizar contadores). */
  aoAtualizar?: () => void;
}

const INTERVALO_MS = 5000;

function hora(iso: string) {
  const d = new Date(iso);
  const hoje = new Date().toDateString() === d.toDateString();
  const h = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return hoje ? h : `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${h}`;
}

/** Conversa com atualização automática a cada 5 s (enquanto a aba está visível). */
export function ChatThread({ conversaId, listar, enviar, euSou, aoAtualizar }: Props) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const mensagensRef = useRef<Mensagem[]>([]);
  mensagensRef.current = mensagens;

  function juntar(novas: Mensagem[]) {
    if (novas.length === 0) return;
    setMensagens((atuais) => {
      const ids = new Set(atuais.map((m) => m._id));
      const unicas = novas.filter((m) => !ids.has(m._id));
      return unicas.length ? [...atuais, ...unicas] : atuais;
    });
  }

  // Carga inicial ao abrir/trocar de conversa
  useEffect(() => {
    let cancelado = false;
    setMensagens([]);
    setCarregando(true);
    setErro('');
    listar()
      .then((m) => { if (!cancelado) { setMensagens(m); aoAtualizar?.(); } })
      .catch((e: Error) => { if (!cancelado) setErro(e.message); })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversaId]);

  // Polling de mensagens novas
  useEffect(() => {
    const t = setInterval(async () => {
      if (document.hidden) return;
      const ultima = mensagensRef.current[mensagensRef.current.length - 1];
      try {
        const novas = await listar(ultima?.createdAt);
        const ids = new Set(mensagensRef.current.map((m) => m._id));
        if (novas.some((m) => !ids.has(m._id))) { juntar(novas); aoAtualizar?.(); }
      } catch {
        /* falha momentânea de rede: tenta de novo no próximo ciclo */
      }
    }, INTERVALO_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversaId]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mensagens.length]);

  async function enviarMensagem() {
    const t = texto.trim();
    if (!t || enviando) return;
    setEnviando(true);
    setErro('');
    try {
      const nova = await enviar(t);
      juntar([nova]);
      setTexto('');
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {carregando && (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-amber-500" /></div>
        )}
        {!carregando && mensagens.length === 0 && (
          <p className="text-stone-500 text-sm text-center py-8">Nenhuma mensagem ainda. Escreva a primeira! 👋</p>
        )}
        {mensagens.map((m) => {
          const minha = m.de === euSou;
          return (
            <div key={m._id} className={`flex ${minha ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${minha ? 'bg-amber-500 text-stone-950 rounded-br-md' : 'bg-stone-800 text-white rounded-bl-md'}`}>
                <p className="text-sm whitespace-pre-wrap break-words">{m.texto}</p>
                <p className={`text-[10px] mt-1 text-right ${minha ? 'text-stone-800/70' : 'text-stone-500'}`}>{hora(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={fimRef} />
      </div>

      {erro && <p className="text-red-400 text-xs px-4 pb-1">{erro}</p>}

      <div className="border-t border-stone-800 p-3 flex items-end gap-2">
        <textarea
          value={texto}
          maxLength={1000}
          rows={1}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensagem(); }
          }}
          placeholder="Digite sua mensagem..."
          className="flex-1 resize-none max-h-28 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-stone-600 focus:border-amber-500 focus:outline-none transition-colors"
        />
        <button
          onClick={enviarMensagem}
          disabled={enviando || !texto.trim()}
          title="Enviar"
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 p-3 rounded-xl transition-all"
        >
          {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
