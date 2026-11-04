import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Cliente from '../models/Cliente.js';
import Agendamento from '../models/Agendamento.js';
import Conversa from '../models/Conversa.js';
import Mensagem from '../models/Mensagem.js';
import Sessao from '../models/Sessao.js';
import { gerarTokenCliente } from '../middleware/authCliente.js';
import { iniciarSessao, renovarSessao, encerrarSessao, revogarTodas } from '../services/sessaoService.js';
import { enviarVerificacao, reenviarVerificacao, confirmarVerificacao } from '../services/verificacaoEmail.js';
import { env } from '../config/env.js';
import { detalheErro, emailValido, senhaForte, sha256, nomeValido, telefoneValido } from '../utils/http.js';
import { enviarEmail } from '../services/emailService.js';
import { templates } from '../services/emailTemplates.js';
import { logSeguranca } from '../utils/logger.js';

const HASH_FALSO = bcrypt.hashSync('senha-falsa-para-timing', 12);

const clientePublico = (c) => ({
  id: c._id, nome: c.nome, email: c.email, telefone: c.telefone, emailVerificado: !!c.emailVerificado,
});

/** POST /api/clientes/cadastrar */
export async function cadastrar(req, res) {
  try {
    const { nome, email, telefone, senha, aceiteTermos } = req.body;

    if (!nome || !email || !telefone || !senha) {
      return res.status(400).json({ erro: 'Preencha nome, e-mail, telefone e senha' });
    }
    if (aceiteTermos !== true) return res.status(400).json({ erro: 'É necessário aceitar os Termos de Uso e a Política de Privacidade' });
    if (!nomeValido(nome)) return res.status(400).json({ erro: 'Nome inválido' });
    if (!emailValido(email)) return res.status(400).json({ erro: 'E-mail inválido' });
    if (!telefoneValido(telefone)) return res.status(400).json({ erro: 'Informe um telefone válido com DDD' });
    const erroSenha = senhaForte(senha, { email });
    if (erroSenha) return res.status(400).json({ erro: erroSenha });

    const emailNorm = email.toLowerCase().trim();
    if (await Cliente.findOne({ email: emailNorm })) {
      return res.status(409).json({ erro: 'Já existe uma conta com este e-mail. Faça login.' });
    }

    const cliente = await Cliente.create({
      nome: nome.trim(), email: emailNorm, telefone: telefone.trim(), senha, aceitouTermosEm: new Date(),
    });

    const tpl = templates.boasVindasCliente({ nome: cliente.nome });
    enviarEmail({ para: cliente.email, assunto: tpl.assunto, html: tpl.html });
    enviarVerificacao(Cliente, cliente, 'cliente').catch(() => {});

    await iniciarSessao(req, res, 'cliente', cliente._id);
    res.status(201).json({ token: gerarTokenCliente(cliente), cliente: clientePublico(cliente) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: 'Já existe uma conta com este e-mail. Faça login.' });
    res.status(400).json({ erro: 'Erro ao cadastrar', ...detalheErro(err) });
  }
}

/** POST /api/clientes/login */
export async function login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha || typeof email !== 'string' || typeof senha !== 'string') {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
    }

    const cliente = await Cliente.findOne({ email: email.toLowerCase().trim() }).select('+senha');
    if (!cliente) {
      await bcrypt.compare(senha, HASH_FALSO);
      logSeguranca('login_falhou', { perfil: 'cliente', ip: req.ip, id: req.id });
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }
    if (!(await cliente.compararSenha(senha))) {
      logSeguranca('login_falhou', { perfil: 'cliente', usuarioId: String(cliente._id), ip: req.ip, id: req.id });
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    await iniciarSessao(req, res, 'cliente', cliente._id);
    res.json({ token: gerarTokenCliente(cliente), cliente: clientePublico(cliente) });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao fazer login', ...detalheErro(err) });
  }
}

/** POST /api/clientes/refresh */
export async function refresh(req, res) {
  try {
    const usuarioId = await renovarSessao(req, res, 'cliente');
    const cliente = await Cliente.findById(usuarioId);
    if (!cliente) {
      await encerrarSessao(req, res, 'cliente');
      return res.status(401).json({ erro: 'Sessão inválida', codigo: 'SESSAO_INVALIDA' });
    }
    res.json({ token: gerarTokenCliente(cliente), cliente: clientePublico(cliente) });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ erro: 'Sessão inválida ou expirada', codigo: err.codigo });
    res.status(500).json({ erro: 'Erro ao renovar sessão', ...detalheErro(err) });
  }
}

/** POST /api/clientes/logout */
export async function logout(req, res) {
  try {
    await encerrarSessao(req, res, 'cliente');
    res.json({ mensagem: 'Sessão encerrada' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao sair', ...detalheErro(err) });
  }
}

/** GET /api/clientes/perfil */
export function perfil(req, res) {
  res.json({ cliente: clientePublico(req.cliente) });
}

/** PUT /api/clientes/perfil — o cliente pode corrigir nome e telefone (e-mail e senha não mudam aqui). */
export async function atualizarPerfil(req, res) {
  try {
    const { nome, telefone } = req.body;
    if (nome !== undefined) {
      if (!nomeValido(nome)) return res.status(400).json({ erro: 'Nome inválido' });
      req.cliente.nome = nome.trim();
    }
    if (telefone !== undefined) {
      if (!telefoneValido(telefone)) return res.status(400).json({ erro: 'Informe um telefone válido com DDD' });
      req.cliente.telefone = telefone.trim();
    }
    await req.cliente.save();
    res.json({ cliente: clientePublico(req.cliente) });
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar perfil', ...detalheErro(err) });
  }
}

/** GET /api/clientes/agendamentos — histórico do cliente logado (mais recentes primeiro). */
export async function meusAgendamentos(req, res) {
  try {
    const agendamentos = await Agendamento.find({ clienteId: req.cliente._id })
      .populate('barbeariaId', 'nome endereco telefone')
      .populate('barbeiroId', 'nome')
      .populate('servicoId', 'nome preco duracaoMinutos')
      .sort({ data: -1, horario: -1 })
      .limit(100);
    res.json(agendamentos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar seus agendamentos', ...detalheErro(err) });
  }
}

/** POST /api/clientes/verificar-email { token } */
export async function verificarEmail(req, res) {
  try {
    const ok = await confirmarVerificacao(Cliente, req.body.token);
    if (!ok) return res.status(400).json({ erro: 'Link inválido ou expirado. Solicite um novo.' });
    res.json({ mensagem: 'E-mail confirmado com sucesso!' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao confirmar e-mail', ...detalheErro(err) });
  }
}

/** POST /api/clientes/reenviar-verificacao (logado) */
export async function reenviarVerificacaoEmail(req, res) {
  try {
    if (req.cliente.emailVerificado) return res.json({ mensagem: 'Seu e-mail já está confirmado.' });
    const enviado = await reenviarVerificacao(Cliente, req.cliente, 'cliente');
    if (!enviado) return res.status(429).json({ erro: 'Aguarde um minuto antes de pedir outro e-mail.' });
    res.json({ mensagem: 'Enviamos um novo link de confirmação.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao reenviar', ...detalheErro(err) });
  }
}

/** POST /api/clientes/esqueci-senha — sempre 200 (não revela se o e-mail existe). */
export async function esqueciSenha(req, res) {
  const resposta = { mensagem: 'Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha.' };
  try {
    const { email } = req.body;
    if (!emailValido(email)) return res.json(resposta);

    const cliente = await Cliente.findOne({ email: email.toLowerCase().trim() });
    if (cliente) {
      const token = crypto.randomBytes(32).toString('hex');
      await Cliente.updateOne(
        { _id: cliente._id },
        { resetSenhaHash: sha256(token), resetSenhaExpira: new Date(Date.now() + 60 * 60 * 1000) }
      );
      const link = `${env.clientUrl}/?reset=${token}&tipo=cliente`;
      const tpl = templates.redefinirSenha({ nome: cliente.nome, link });
      enviarEmail({ para: cliente.email, assunto: tpl.assunto, html: tpl.html });
    }
    res.json(resposta);
  } catch (err) {
    console.error(err);
    res.json(resposta);
  }
}

/** POST /api/clientes/redefinir-senha */
export async function redefinirSenha(req, res) {
  try {
    const { token, novaSenha } = req.body;
    if (!token || typeof token !== 'string') return res.status(400).json({ erro: 'Link inválido' });

    const cliente = await Cliente.findOne({
      resetSenhaHash: sha256(token),
      resetSenhaExpira: { $gt: new Date() },
    }).select('+resetSenhaHash +resetSenhaExpira');

    if (!cliente) return res.status(400).json({ erro: 'Link inválido ou expirado. Solicite um novo.' });

    const erroSenha = senhaForte(novaSenha, { email: cliente.email });
    if (erroSenha) return res.status(400).json({ erro: erroSenha });

    cliente.senha = novaSenha;
    cliente.resetSenhaHash = undefined;
    cliente.resetSenhaExpira = undefined;
    cliente.emailVerificado = true;
    await cliente.save();
    await revogarTodas('cliente', cliente._id);
    logSeguranca('senha_redefinida', { perfil: 'cliente', usuarioId: String(cliente._id), ip: req.ip });

    const tpl = templates.senhaAlterada({ nome: cliente.nome });
    enviarEmail({ para: cliente.email, assunto: tpl.assunto, html: tpl.html });

    res.json({ mensagem: 'Senha redefinida com sucesso. Faça login com a nova senha.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao redefinir senha', ...detalheErro(err) });
  }
}

/* ───────── LGPD: direitos do titular ───────── */

/** GET /api/clientes/meus-dados — exportação de todos os dados pessoais do cliente (portabilidade). */
export async function exportarDados(req, res) {
  try {
    const [agendamentos, conversas] = await Promise.all([
      Agendamento.find({ clienteId: req.cliente._id }).populate('barbeariaId', 'nome').populate('servicoId', 'nome preco').populate('barbeiroId', 'nome').lean(),
      Conversa.find({ clienteId: req.cliente._id }).populate('barbeariaId', 'nome').lean(),
    ]);
    const mensagens = await Mensagem.find({ conversaId: { $in: conversas.map((c) => c._id) } }).sort({ createdAt: 1 }).lean();

    res.set('Content-Disposition', 'attachment; filename="meus-dados-barbersync.json"');
    res.json({
      geradoEm: new Date().toISOString(),
      conta: { ...clientePublico(req.cliente), criadaEm: req.cliente.createdAt, aceitouTermosEm: req.cliente.aceitouTermosEm },
      agendamentos,
      conversas: conversas.map((c) => ({
        ...c,
        mensagens: mensagens.filter((m) => String(m.conversaId) === String(c._id)).map((m) => ({ de: m.de, texto: m.texto, em: m.createdAt })),
      })),
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao exportar dados', ...detalheErro(err) });
  }
}

/**
 * DELETE /api/clientes/conta { senha } — exclusão da conta (direito ao apagamento).
 * Remove conta, sessões, conversas e mensagens; anonimiza os agendamentos (a barbearia mantém só o registro
 * do serviço prestado, sem dados pessoais).
 */
export async function excluirConta(req, res) {
  try {
    const { senha } = req.body;
    const cliente = await Cliente.findById(req.cliente._id).select('+senha');
    if (typeof senha !== 'string' || !(await cliente.compararSenha(senha))) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }

    const conversas = await Conversa.find({ clienteId: cliente._id }).select('_id');
    await Mensagem.deleteMany({ conversaId: { $in: conversas.map((c) => c._id) } });
    await Conversa.deleteMany({ clienteId: cliente._id });
    await Agendamento.updateMany(
      { clienteId: cliente._id },
      { $set: { clienteNome: 'Cliente removido', clienteTelefone: '-', clienteEmail: '' }, $unset: { clienteId: 1 } }
    );
    await Sessao.deleteMany({ tipo: 'cliente', usuarioId: cliente._id });
    await Cliente.deleteOne({ _id: cliente._id });
    logSeguranca('conta_excluida', { perfil: 'cliente', usuarioId: String(cliente._id), ip: req.ip });

    await encerrarSessao(req, res, 'cliente');
    res.json({ mensagem: 'Sua conta e seus dados pessoais foram excluídos.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir conta', ...detalheErro(err) });
  }
}
