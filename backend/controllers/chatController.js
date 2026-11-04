import Conversa from '../models/Conversa.js';
import Mensagem from '../models/Mensagem.js';
import Barbearia from '../models/Barbearia.js';
import { detalheErro, idValido } from '../utils/http.js';
import { enviarEmail } from '../services/emailService.js';
import { templates } from '../services/emailTemplates.js';

const LIMITE_TEXTO = 1000;

/* ───────── helpers ───────── */

/** Mensagens da conversa. Sem `depois`: as últimas 100. Com `depois` (ISO): só as mais novas (polling). */
async function buscarMensagens(conversaId, depois) {
  if (depois) {
    const d = new Date(depois);
    if (Number.isNaN(d.getTime())) throw new Error('Data inválida');
    return Mensagem.find({ conversaId, createdAt: { $gt: d } }).sort({ createdAt: 1 }).limit(200);
  }
  const ultimas = await Mensagem.find({ conversaId }).sort({ createdAt: -1 }).limit(100);
  return ultimas.reverse();
}

function textoValido(texto) {
  if (typeof texto !== 'string') return null;
  const t = texto.trim();
  return t.length > 0 && t.length <= LIMITE_TEXTO ? t : null;
}

/** Grava a mensagem e atualiza a conversa. Retorna { mensagem, conversaAntes } (antes = estado anterior). */
async function gravarMensagem(conversaId, de, texto) {
  const mensagem = await Mensagem.create({ conversaId, de, texto });
  const conversaAntes = await Conversa.findByIdAndUpdate(conversaId, {
    ultimaMensagem: texto.slice(0, 120),
    ultimaMensagemEm: mensagem.createdAt,
    $inc: de === 'cliente' ? { naoLidasBarbearia: 1 } : { naoLidasCliente: 1 },
  });
  return { mensagem, conversaAntes };
}

/* ───────── CLIENTE ───────── */

export async function listarConversasCliente(req, res) {
  try {
    const conversas = await Conversa.find({ clienteId: req.cliente._id })
      .populate('barbeariaId', 'nome imagemUrl')
      .sort({ ultimaMensagemEm: -1 });
    res.json(conversas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar conversas', ...detalheErro(err) });
  }
}

/** Abre (ou recupera) a conversa do cliente com uma barbearia. */
export async function iniciarConversa(req, res) {
  try {
    const { barbeariaId } = req.body;
    if (!idValido(barbeariaId)) return res.status(400).json({ erro: 'ID inválido' });
    if (!(await Barbearia.exists({ _id: barbeariaId }))) return res.status(404).json({ erro: 'Barbearia não encontrada' });

    const conversa = await Conversa.findOneAndUpdate(
      { clienteId: req.cliente._id, barbeariaId },
      { $setOnInsert: { clienteId: req.cliente._id, barbeariaId } },
      { upsert: true, new: true }
    ).populate('barbeariaId', 'nome imagemUrl');
    res.json(conversa);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao abrir conversa', ...detalheErro(err) });
  }
}

export async function mensagensCliente(req, res) {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    const conversa = await Conversa.findOne({ _id: req.params.id, clienteId: req.cliente._id });
    if (!conversa) return res.status(404).json({ erro: 'Conversa não encontrada' });

    const mensagens = await buscarMensagens(conversa._id, req.query.depois);
    if (conversa.naoLidasCliente > 0) await Conversa.updateOne({ _id: conversa._id }, { naoLidasCliente: 0 });
    res.json(mensagens);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao buscar mensagens', ...detalheErro(err) });
  }
}

export async function enviarMensagemCliente(req, res) {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    const texto = textoValido(req.body.texto);
    if (!texto) return res.status(400).json({ erro: `Digite uma mensagem (até ${LIMITE_TEXTO} caracteres)` });

    const conversa = await Conversa.findOne({ _id: req.params.id, clienteId: req.cliente._id });
    if (!conversa) return res.status(404).json({ erro: 'Conversa não encontrada' });

    const { mensagem, conversaAntes } = await gravarMensagem(conversa._id, 'cliente', texto);

    // Avisa a barbearia por e-mail só na 1ª mensagem não lida (evita uma enxurrada de e-mails)
    if (conversaAntes && conversaAntes.naoLidasBarbearia === 0) {
      const barbearia = await Barbearia.findById(conversa.barbeariaId).select('nome email');
      if (barbearia?.email) {
        const t = templates.novaMensagemParaBarbearia({ clienteNome: req.cliente.nome, texto });
        enviarEmail({ para: barbearia.email, assunto: t.assunto, html: t.html });
      }
    }

    res.status(201).json(mensagem);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao enviar mensagem', ...detalheErro(err) });
  }
}

/* ───────── BARBEARIA (admin) ───────── */

export async function listarConversasAdmin(req, res) {
  try {
    const conversas = await Conversa.find({ barbeariaId: req.barbeariaId })
      .populate('clienteId', 'nome telefone email')
      .sort({ ultimaMensagemEm: -1 })
      .limit(200);
    res.json(conversas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar conversas', ...detalheErro(err) });
  }
}

export async function naoLidasAdmin(req, res) {
  try {
    const [r] = await Conversa.aggregate([
      { $match: { barbeariaId: req.barbeariaId } },
      { $group: { _id: null, total: { $sum: '$naoLidasBarbearia' } } },
    ]);
    res.json({ total: r?.total ?? 0 });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao contar mensagens', ...detalheErro(err) });
  }
}

export async function mensagensAdmin(req, res) {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    // Isolamento: a conversa precisa ser da barbearia do usuário logado
    const conversa = await Conversa.findOne({ _id: req.params.id, barbeariaId: req.barbeariaId });
    if (!conversa) return res.status(404).json({ erro: 'Conversa não encontrada' });

    const mensagens = await buscarMensagens(conversa._id, req.query.depois);
    if (conversa.naoLidasBarbearia > 0) await Conversa.updateOne({ _id: conversa._id }, { naoLidasBarbearia: 0 });
    res.json(mensagens);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao buscar mensagens', ...detalheErro(err) });
  }
}

export async function enviarMensagemAdmin(req, res) {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    const texto = textoValido(req.body.texto);
    if (!texto) return res.status(400).json({ erro: `Digite uma mensagem (até ${LIMITE_TEXTO} caracteres)` });

    const conversa = await Conversa.findOne({ _id: req.params.id, barbeariaId: req.barbeariaId });
    if (!conversa) return res.status(404).json({ erro: 'Conversa não encontrada' });

    const { mensagem } = await gravarMensagem(conversa._id, 'barbearia', texto);
    res.status(201).json(mensagem);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao enviar mensagem', ...detalheErro(err) });
  }
}
