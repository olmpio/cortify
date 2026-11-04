import Servico from '../models/Servico.js';
import { detalheErro, idValido, pick } from '../utils/http.js';

const CAMPOS = ['nome', 'descricao', 'preco', 'duracaoMinutos', 'categoria'];

export async function listarServicosPorBarbearia(req, res) {
  try {
    if (!idValido(req.params.barbeariaId)) return res.status(400).json({ erro: 'ID inválido' });
    const servicos = await Servico.find({ barbeariaId: req.params.barbeariaId }).sort({ categoria: 1, preco: 1 });
    res.json(servicos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar serviços', ...detalheErro(err) });
  }
}

export async function criarServico(req, res) {
  try {
    const servico = await Servico.create({ ...pick(req.body, CAMPOS), barbeariaId: req.barbeariaId });
    res.status(201).json(servico);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao criar serviço', ...detalheErro(err) });
  }
}

export async function atualizarServico(req, res) {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    const servico = await Servico.findOneAndUpdate(
      { _id: req.params.id, barbeariaId: req.barbeariaId },
      pick(req.body, CAMPOS),
      { new: true, runValidators: true }
    );
    if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });
    res.json(servico);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar serviço', ...detalheErro(err) });
  }
}

export async function deletarServico(req, res) {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    const servico = await Servico.findOneAndDelete({ _id: req.params.id, barbeariaId: req.barbeariaId });
    if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });
    res.json({ mensagem: 'Serviço removido com sucesso' });
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao deletar serviço', ...detalheErro(err) });
  }
}
