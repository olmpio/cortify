import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import UsuarioAdmin from '../models/UsuarioAdmin.js';
import Barbearia from '../models/Barbearia.js';
import { gerarToken } from '../middleware/auth.js';
import { iniciarSessao, renovarSessao, encerrarSessao, revogarTodas } from '../services/sessaoService.js';
import { enviarVerificacao, reenviarVerificacao, confirmarVerificacao } from '../services/verificacaoEmail.js';
import { env } from '../config/env.js';
import { detalheErro, emailValido, senhaForte, sha256, nomeValido, telefoneValido } from '../utils/http.js';
import { enviarEmail } from '../services/emailService.js';
import { templates } from '../services/emailTemplates.js';
import { logSeguranca } from '../utils/logger.js';

// hash fixo usado para igualar o tempo de resposta quando o e-mail não existe
const HASH_FALSO = bcrypt.hashSync('senha-falsa-para-timing', 12);

const adminPublico = (a) => ({
  id: a._id, nome: a.nome, email: a.email, barbeariaId: a.barbeariaId, emailVerificado: !!a.emailVerificado,
});

/** POST /api/auth/login */
export async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha || typeof email !== 'string' || typeof senha !== 'string') {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
    }

    const admin = await UsuarioAdmin.findOne({ email: email.toLowerCase().trim() }).select('+senha');

    if (!admin) {
      await bcrypt.compare(senha, HASH_FALSO); // evita revelar se o e-mail existe pelo tempo de resposta
      logSeguranca('login_falhou', { perfil: 'admin', ip: req.ip, id: req.id });
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    if (!(await admin.compararSenha(senha))) {
      logSeguranca('login_falhou', { perfil: 'admin', usuarioId: String(admin._id), ip: req.ip, id: req.id });
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    await iniciarSessao(req, res, 'admin', admin._id);
    res.json({ token: gerarToken(admin), admin: adminPublico(admin) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao fazer login', ...detalheErro(err) });
  }
}

/** POST /api/auth/cadastrar — cria barbearia + admin vinculado. */
export async function cadastrar(req, res) {
  let barbearia = null;
  try {
    const {
      nomeBarbearia, endereco, telefone, emailBarbearia,
      horarioAbertura, horarioFechamento, diasFuncionamento, descricao,
      nomeAdmin, emailAdmin, senha, aceiteTermos,
    } = req.body;

    if (!nomeBarbearia || !endereco || !telefone || !emailAdmin || !senha || !nomeAdmin) {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
    }
    if (aceiteTermos !== true) return res.status(400).json({ erro: 'É necessário aceitar os Termos de Uso e a Política de Privacidade' });
    if (!nomeValido(nomeBarbearia, 3) || !nomeValido(nomeAdmin) || !nomeValido(endereco, 5, 200)) {
      return res.status(400).json({ erro: 'Nome ou endereço inválido' });
    }
    if (!telefoneValido(telefone)) return res.status(400).json({ erro: 'Informe um telefone válido com DDD' });
    if (!emailValido(emailAdmin) || (emailBarbearia && !emailValido(emailBarbearia))) {
      return res.status(400).json({ erro: 'E-mail inválido' });
    }
    const erroSenha = senhaForte(senha, { email: emailAdmin });
    if (erroSenha) return res.status(400).json({ erro: erroSenha });

    const emailNorm = emailAdmin.toLowerCase().trim();
    if (await UsuarioAdmin.findOne({ email: emailNorm })) {
      return res.status(409).json({ erro: 'Já existe uma conta com este e-mail' });
    }

    barbearia = await Barbearia.create({
      nome: nomeBarbearia,
      endereco,
      telefone,
      email: emailBarbearia || emailNorm,
      horarioAbertura: horarioAbertura || '09:00',
      horarioFechamento: horarioFechamento || '20:00',
      diasFuncionamento: diasFuncionamento || [1, 2, 3, 4, 5, 6],
      descricao,
    });

    const admin = await UsuarioAdmin.create({
      nome: nomeAdmin,
      email: emailNorm,
      senha,
      barbeariaId: barbearia._id,
      aceitouTermosEm: new Date(),
    });

    const tpl = templates.boasVindas({ nomeAdmin: admin.nome, nomeBarbearia: barbearia.nome });
    enviarEmail({ para: admin.email, assunto: tpl.assunto, html: tpl.html }); // sem await: não atrasa a resposta
    enviarVerificacao(UsuarioAdmin, admin, 'admin').catch(() => {});

    await iniciarSessao(req, res, 'admin', admin._id);
    res.status(201).json({
      mensagem: 'Barbearia e admin cadastrados com sucesso',
      token: gerarToken(admin),
      barbearia,
      admin: adminPublico(admin),
    });
  } catch (err) {
    if (barbearia) await Barbearia.findByIdAndDelete(barbearia._id).catch(() => {}); // rollback
    if (err.code === 11000) return res.status(409).json({ erro: 'Já existe uma conta com este e-mail' });
    res.status(400).json({ erro: 'Erro ao cadastrar', ...detalheErro(err) });
  }
}

/** POST /api/auth/refresh — troca o cookie httpOnly por um novo access token (rotação do refresh token). */
export async function refresh(req, res) {
  try {
    const usuarioId = await renovarSessao(req, res, 'admin');
    const admin = await UsuarioAdmin.findById(usuarioId);
    if (!admin) {
      await encerrarSessao(req, res, 'admin');
      return res.status(401).json({ erro: 'Sessão inválida', codigo: 'SESSAO_INVALIDA' });
    }
    const barbearia = await Barbearia.findById(admin.barbeariaId);
    res.json({ token: gerarToken(admin), admin: adminPublico(admin), barbearia });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ erro: 'Sessão inválida ou expirada', codigo: err.codigo });
    res.status(500).json({ erro: 'Erro ao renovar sessão', ...detalheErro(err) });
  }
}

/** POST /api/auth/logout */
export async function logout(req, res) {
  try {
    await encerrarSessao(req, res, 'admin');
    res.json({ mensagem: 'Sessão encerrada' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao sair', ...detalheErro(err) });
  }
}

/** GET /api/auth/perfil */
export async function perfil(req, res) {
  try {
    const barbearia = await Barbearia.findById(req.admin.barbeariaId);
    res.json({ admin: adminPublico(req.admin), barbearia });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar perfil', ...detalheErro(err) });
  }
}

/** POST /api/auth/verificar-email { token } */
export async function verificarEmail(req, res) {
  try {
    const ok = await confirmarVerificacao(UsuarioAdmin, req.body.token);
    if (!ok) return res.status(400).json({ erro: 'Link inválido ou expirado. Solicite um novo.' });
    res.json({ mensagem: 'E-mail confirmado com sucesso!' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao confirmar e-mail', ...detalheErro(err) });
  }
}

/** POST /api/auth/reenviar-verificacao (logado) */
export async function reenviarVerificacaoEmail(req, res) {
  try {
    if (req.admin.emailVerificado) return res.json({ mensagem: 'Seu e-mail já está confirmado.' });
    const enviado = await reenviarVerificacao(UsuarioAdmin, req.admin, 'admin');
    if (!enviado) return res.status(429).json({ erro: 'Aguarde um minuto antes de pedir outro e-mail.' });
    res.json({ mensagem: 'Enviamos um novo link de confirmação.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao reenviar', ...detalheErro(err) });
  }
}

/** POST /api/auth/esqueci-senha — sempre responde 200 (não revela se o e-mail existe). */
export async function esqueciSenha(req, res) {
  const resposta = { mensagem: 'Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha.' };
  try {
    const { email } = req.body;
    if (!emailValido(email)) return res.json(resposta);

    const admin = await UsuarioAdmin.findOne({ email: email.toLowerCase().trim() });
    if (admin) {
      const token = crypto.randomBytes(32).toString('hex');
      await UsuarioAdmin.updateOne(
        { _id: admin._id },
        { resetSenhaHash: sha256(token), resetSenhaExpira: new Date(Date.now() + 60 * 60 * 1000) }
      );
      const link = `${env.clientUrl}/?reset=${token}`;
      const tpl = templates.redefinirSenha({ nome: admin.nome, link });
      enviarEmail({ para: admin.email, assunto: tpl.assunto, html: tpl.html });
    }
    res.json(resposta);
  } catch (err) {
    console.error(err);
    res.json(resposta);
  }
}

/** POST /api/auth/redefinir-senha */
export async function redefinirSenha(req, res) {
  try {
    const { token, novaSenha } = req.body;
    if (!token || typeof token !== 'string') return res.status(400).json({ erro: 'Link inválido' });

    const admin = await UsuarioAdmin.findOne({
      resetSenhaHash: sha256(token),
      resetSenhaExpira: { $gt: new Date() },
    }).select('+resetSenhaHash +resetSenhaExpira');

    if (!admin) return res.status(400).json({ erro: 'Link inválido ou expirado. Solicite um novo.' });

    const erroSenha = senhaForte(novaSenha, { email: admin.email });
    if (erroSenha) return res.status(400).json({ erro: erroSenha });

    admin.senha = novaSenha; // o hook pre('save') faz o hash e marca senhaAlteradaEm
    admin.resetSenhaHash = undefined;
    admin.resetSenhaExpira = undefined;
    admin.emailVerificado = true; // quem recebeu o link no e-mail provou que ele é seu
    await admin.save();
    await revogarTodas('admin', admin._id); // derruba todos os dispositivos logados
    logSeguranca('senha_redefinida', { perfil: 'admin', usuarioId: String(admin._id), ip: req.ip });

    const tpl = templates.senhaAlterada({ nome: admin.nome });
    enviarEmail({ para: admin.email, assunto: tpl.assunto, html: tpl.html });

    res.json({ mensagem: 'Senha redefinida com sucesso. Faça login com a nova senha.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao redefinir senha', ...detalheErro(err) });
  }
}

/** POST /api/auth/alterar-senha (logado) */
export async function alterarSenha(req, res) {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const erroSenha = senhaForte(novaSenha, { email: req.admin.email });
    if (erroSenha) return res.status(400).json({ erro: erroSenha });

    const admin = await UsuarioAdmin.findById(req.admin._id).select('+senha');
    if (!senhaAtual || typeof senhaAtual !== 'string' || !(await admin.compararSenha(senhaAtual))) {
      return res.status(401).json({ erro: 'Senha atual incorreta' });
    }

    admin.senha = novaSenha;
    await admin.save();
    await revogarTodas('admin', admin._id);
    await iniciarSessao(req, res, 'admin', admin._id); // este dispositivo continua logado
    logSeguranca('senha_alterada', { perfil: 'admin', usuarioId: String(admin._id), ip: req.ip });

    const tpl = templates.senhaAlterada({ nome: admin.nome });
    enviarEmail({ para: admin.email, assunto: tpl.assunto, html: tpl.html });

    res.json({ mensagem: 'Senha alterada com sucesso', token: gerarToken(admin) });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao alterar senha', ...detalheErro(err) });
  }
}
