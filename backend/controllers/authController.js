import UsuarioAdmin from '../models/UsuarioAdmin.js';
import Barbearia from '../models/Barbearia.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';

/**
 * Login do dono/gerente da barbearia.
 * Retorna um JWT com o ID do admin e o ID da barbearia.
 */
export async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
    }

    const admin = await UsuarioAdmin.findOne({ email: email.toLowerCase() }).select('+senha');

    if (!admin) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaCorreta = await admin.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: admin._id, barbeariaId: admin.barbeariaId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        nome: admin.nome,
        email: admin.email,
        barbeariaId: admin.barbeariaId,
      },
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao fazer login', detalhe: err.message });
  }
}

/**
 * Cadastro de uma nova barbearia + admin.
 * Cria a barbearia e o usuário admin vinculado a ela.
 */
export async function cadastrar(req, res) {
  try {
    const {
      nomeBarbearia, endereco, telefone, emailBarbearia,
      horarioAbertura, horarioFechamento, diasFuncionamento, descricao,
      nomeAdmin, emailAdmin, senha,
    } = req.body;

    if (!nomeBarbearia || !endereco || !emailAdmin || !senha || !nomeAdmin) {
      return res.status(400).json({ erro: 'Campos obrigatórios não preenchidos' });
    }

    const adminExistente = await UsuarioAdmin.findOne({ email: emailAdmin.toLowerCase() });
    if (adminExistente) {
      return res.status(409).json({ erro: 'Já existe um admin com este e-mail' });
    }

    const barbearia = new Barbearia({
      nome: nomeBarbearia,
      endereco,
      telefone,
      email: emailBarbearia || emailAdmin,
      horarioAbertura: horarioAbertura || '09:00',
      horarioFechamento: horarioFechamento || '20:00',
      diasFuncionamento: diasFuncionamento || [1, 2, 3, 4, 5, 6],
      descricao,
    });
    await barbearia.save();

    const admin = new UsuarioAdmin({
      nome: nomeAdmin,
      email: emailAdmin.toLowerCase(),
      senha,
      barbeariaId: barbearia._id,
    });
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, barbeariaId: admin.barbeariaId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensagem: 'Barbearia e admin cadastrados com sucesso',
      token,
      barbearia,
      admin: {
        id: admin._id,
        nome: admin.nome,
        email: admin.email,
        barbeariaId: admin.barbeariaId,
      },
    });
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao cadastrar', detalhe: err.message });
  }
}

/**
 * Retorna os dados do admin logado.
 */
export async function perfil(req, res) {
  try {
    const admin = await UsuarioAdmin.findById(req.admin._id).select('-senha');
    const barbearia = await Barbearia.findById(admin.barbeariaId);

    res.json({
      admin,
      barbearia,
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar perfil', detalhe: err.message });
  }
}
