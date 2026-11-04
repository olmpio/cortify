import Barbearia from '../models/Barbearia.js';
import Servico from '../models/Servico.js';
import Barbeiro from '../models/Barbeiro.js';
import { detalheErro, idValido, pick, nomeValido, telefoneValido, emailValido, horaValida } from '../utils/http.js';
import { lerDataUrl, enviarImagem } from '../utils/imagem.js';

export async function listarBarbearias(_req, res) {
  try {
    const [barbearias, precos, equipes] = await Promise.all([
      Barbearia.find().sort({ createdAt: -1 }).limit(200),
      Servico.aggregate([{ $group: { _id: '$barbeariaId', precoMinimo: { $min: '$preco' } } }]),
      Barbeiro.aggregate([{ $match: { ativo: true } }, { $group: { _id: '$barbeariaId', total: { $sum: 1 } } }]),
    ]);
    const precoPor = new Map(precos.map((x) => [String(x._id), x.precoMinimo]));
    const equipePor = new Map(equipes.map((x) => [String(x._id), x.total]));

    // Resumo para os cards da home/listagem (evita N+1 chamadas no front)
    res.json(
      barbearias.map((b) => ({
        ...b.toObject(),
        precoMinimo: precoPor.get(String(b._id)) ?? null,
        totalBarbeiros: equipePor.get(String(b._id)) ?? 0,
      }))
    );
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar barbearias', ...detalheErro(err) });
  }
}

export async function obterBarbearia(req, res) {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    const barbearia = await Barbearia.findById(req.params.id);
    if (!barbearia) return res.status(404).json({ erro: 'Barbearia não encontrada' });
    res.json(barbearia);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar barbearia', ...detalheErro(err) });
  }
}

// A criação pública (POST /api/barbearias) foi removida: qualquer pessoa podia criar
// barbearias sem conta. O cadastro agora é feito apenas por POST /api/auth/cadastrar.

export async function atualizarBarbearia(req, res) {
  try {
    const dados = pick(req.body, [
      'nome', 'endereco', 'telefone', 'email', 'horarioAbertura',
      'horarioFechamento', 'diasFuncionamento', 'descricao',
    ]); // imagemUrl NÃO entra: a capa só muda pelo upload (evita apontar para URLs externas de rastreamento)

    if (dados.nome !== undefined && !nomeValido(dados.nome, 3)) return res.status(400).json({ erro: 'Nome inválido' });
    if (dados.endereco !== undefined && !nomeValido(dados.endereco, 5, 200)) return res.status(400).json({ erro: 'Endereço inválido' });
    if (dados.telefone !== undefined && !telefoneValido(dados.telefone)) return res.status(400).json({ erro: 'Telefone inválido' });
    if (dados.email !== undefined && !emailValido(dados.email)) return res.status(400).json({ erro: 'E-mail inválido' });
    for (const h of ['horarioAbertura', 'horarioFechamento']) {
      if (dados[h] !== undefined && !horaValida(dados[h])) return res.status(400).json({ erro: 'Horário inválido' });
    }
    if (dados.diasFuncionamento !== undefined && !(Array.isArray(dados.diasFuncionamento) && dados.diasFuncionamento.every((d) => Number.isInteger(d) && d >= 0 && d <= 6))) {
      return res.status(400).json({ erro: 'Dias de funcionamento inválidos' });
    }
    if (dados.descricao !== undefined && (typeof dados.descricao !== 'string' || dados.descricao.length > 500)) {
      return res.status(400).json({ erro: 'Descrição muito longa (máximo 500 caracteres)' });
    }
    // :id já foi validado por exigirMinhaBarbearia('id') na rota
    const barbearia = await Barbearia.findByIdAndUpdate(req.params.id, dados, { new: true, runValidators: true });
    if (!barbearia) return res.status(404).json({ erro: 'Barbearia não encontrada' });
    res.json(barbearia);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar barbearia', ...detalheErro(err) });
  }
}

/** PUT /api/barbearias/:id/imagem — troca a foto de capa (só a própria barbearia). */
export async function atualizarImagem(req, res) {
  try {
    const { tipo, dados } = lerDataUrl(req.body.imagem);
    const barbearia = await Barbearia.findByIdAndUpdate(
      req.params.id,
      {
        imagemDados: dados,
        imagemTipo: tipo,
        // ?v= força o navegador a buscar a foto nova (a rota tem cache)
        imagemUrl: `/api/barbearias/${req.params.id}/imagem?v=${Date.now()}`,
      },
      { new: true }
    );
    if (!barbearia) return res.status(404).json({ erro: 'Barbearia não encontrada' });
    res.json(barbearia);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

/** GET /api/barbearias/:id/imagem — pública. */
export async function obterImagem(req, res) {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    const b = await Barbearia.findById(req.params.id).select('+imagemDados +imagemTipo');
    if (!b?.imagemDados) return res.status(404).json({ erro: 'Sem imagem' });
    enviarImagem(res, b.imagemTipo, b.imagemDados);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar imagem', ...detalheErro(err) });
  }
}
