import Servico from '../models/Servico.js';

export async function listarServicosPorBarbearia(req, res) {
  try {
    const servicos = await Servico.find({ barbeariaId: req.params.barbeariaId }).sort({ categoria: 1, preco: 1 });
    res.json(servicos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar serviços', detalhe: err.message });
  }
}

export async function criarServico(req, res) {
  try {
    const servico = new Servico({
      ...req.body,
      barbeariaId: req.barbeariaId,
    });
    await servico.save();
    res.status(201).json(servico);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao criar serviço', detalhe: err.message });
  }
}

export async function atualizarServico(req, res) {
  try {
    const servico = await Servico.findOneAndUpdate(
      { _id: req.params.id, barbeariaId: req.barbeariaId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }
    res.json(servico);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar serviço', detalhe: err.message });
  }
}

export async function deletarServico(req, res) {
  try {
    const servico = await Servico.findOneAndDelete({
      _id: req.params.id,
      barbeariaId: req.barbeariaId,
    });
    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }
    res.json({ mensagem: 'Serviço removido com sucesso' });
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao deletar serviço', detalhe: err.message });
  }
}
