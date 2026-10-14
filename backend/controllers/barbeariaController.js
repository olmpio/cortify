import Barbearia from '../models/Barbearia.js';

export async function listarBarbearias(_req, res) {
  try {
    const barbearias = await Barbearia.find().sort({ createdAt: -1 });
    res.json(barbearias);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar barbearias', detalhe: err.message });
  }
}

export async function obterBarbearia(req, res) {
  try {
    const barbearia = await Barbearia.findById(req.params.id);
    if (!barbearia) {
      return res.status(404).json({ erro: 'Barbearia não encontrada' });
    }
    res.json(barbearia);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar barbearia', detalhe: err.message });
  }
}

export async function criarBarbearia(req, res) {
  try {
    const barbearia = new Barbearia(req.body);
    await barbearia.save();
    res.status(201).json(barbearia);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao criar barbearia', detalhe: err.message });
  }
}

export async function atualizarBarbearia(req, res) {
  try {
    const barbearia = await Barbearia.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!barbearia) {
      return res.status(404).json({ erro: 'Barbearia não encontrada' });
    }
    res.json(barbearia);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar barbearia', detalhe: err.message });
  }
}
