import Agendamento from '../models/Agendamento.js';
import Barbeiro from '../models/Barbeiro.js';
import Servico from '../models/Servico.js';
import Barbearia from '../models/Barbearia.js';

/**
 * Cria um novo agendamento.
 * Antes de salvar, verifica se o barbeiro está realmente disponível
 * no horário solicitado (sem conflitos com agendamentos existentes).
 */
export async function criarAgendamento(req, res) {
  try {
    const { barbeariaId, barbeiroId, servicoId, data, horario, clienteNome, clienteTelefone, clienteEmail } = req.body;

    if (!barbeariaId || !barbeiroId || !servicoId || !data || !horario || !clienteNome || !clienteTelefone) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: barbeariaId, barbeiroId, servicoId, data, horario, clienteNome, clienteTelefone',
      });
    }

    const barbearia = await Barbearia.findById(barbeariaId);
    const barbeiro = await Barbeiro.findById(barbeiroId);
    const servico = await Servico.findById(servicoId);

    if (!barbearia || !barbeiro || !servico) {
      return res.status(404).json({ erro: 'Barbearia, barbeiro ou serviço não encontrado' });
    }

    if (!barbeiro.barbeariaId.equals(barbearia._id) || !servico.barbeariaId.equals(barbearia._id)) {
      return res.status(400).json({ erro: 'Barbeiro ou serviço não pertence a esta barbearia' });
    }

    const [year, month, day] = data.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const diaSemana = dateObj.getDay();

    if (barbeiro.diasFolga.includes(diaSemana)) {
      return res.status(409).json({ erro: 'O barbeiro está de folga neste dia' });
    }

    if (!barbearia.diasFuncionamento.includes(diaSemana)) {
      return res.status(409).json({ erro: 'A barbearia não funciona neste dia' });
    }

    const [h, m] = horario.split(':').map(Number);
    const horarioInicioMin = h * 60 + m;
    const horarioFimMin = horarioInicioMin + servico.duracaoMinutos;

    const [bh, bm] = barbeiro.horarioInicio.split(':').map(Number);
    const [fh, fm] = barbeiro.horarioFim.split(':').map(Number);
    const expedienteInicio = bh * 60 + bm;
    const expedienteFim = fh * 60 + fm;

    if (horarioInicioMin < expedienteInicio || horarioFimMin > expedienteFim) {
      return res.status(409).json({ erro: 'Horário fora do expediente do barbeiro' });
    }

    const agendamentosExistentes = await Agendamento.find({
      barbeiroId,
      data,
      status: { $in: ['pendente', 'confirmado'] },
    }).populate('servicoId', 'duracaoMinutos');

    for (const ag of agendamentosExistentes) {
      const [aH, aM] = ag.horario.split(':').map(Number);
      const agInicio = aH * 60 + aM;
      const duracaoAg = ag.servicoId?.duracaoMinutos || 30;
      const agFim = agInicio + duracaoAg;

      if (horarioInicioMin < agFim && horarioFimMin > agInicio) {
        return res.status(409).json({
          erro: 'Já existe um agendamento para este barbeiro neste horário',
          conflito: { horario: ag.horario, duracao: duracaoAg },
        });
      }
    }

    const agendamento = new Agendamento({
      barbeariaId,
      barbeiroId,
      servicoId,
      clienteNome,
      clienteTelefone,
      clienteEmail: clienteEmail || '',
      data,
      horario,
      status: 'confirmado',
    });

    await agendamento.save();

    const agendamentoPopulado = await Agendamento.findById(agendamento._id)
      .populate('barbeariaId', 'nome endereco')
      .populate('barbeiroId', 'nome')
      .populate('servicoId', 'nome preco duracaoMinutos');

    res.status(201).json({
      mensagem: 'Agendamento criado com sucesso',
      agendamento: agendamentoPopulado,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Já existe um agendamento para este barbeiro neste dia e horário' });
    }
    res.status(400).json({ erro: 'Erro ao criar agendamento', detalhe: err.message });
  }
}

export async function listarAgendamentosPorBarbearia(req, res) {
  try {
    const { barbeariaId } = req.params;
    const { data, status } = req.query;

    const filtro = { barbeariaId };
    if (data) filtro.data = data;
    if (status) filtro.status = status;

    const agendamentos = await Agendamento.find(filtro)
      .populate('barbeiroId', 'nome')
      .populate('servicoId', 'nome preco duracaoMinutos')
      .sort({ data: 1, horario: 1 });

    res.json(agendamentos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar agendamentos', detalhe: err.message });
  }
}

export async function obterAgendamento(req, res) {
  try {
    const agendamento = await Agendamento.findById(req.params.id)
      .populate('barbeariaId', 'nome endereco telefone')
      .populate('barbeiroId', 'nome')
      .populate('servicoId', 'nome preco duracaoMinutos');

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    res.json(agendamento);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar agendamento', detalhe: err.message });
  }
}

export async function atualizarStatusAgendamento(req, res) {
  try {
    const { status } = req.body;
    const statusValidos = ['pendente', 'confirmado', 'concluido', 'cancelado'];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: `Status deve ser um de: ${statusValidos.join(', ')}` });
    }

    const agendamento = await Agendamento.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    res.json(agendamento);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar status', detalhe: err.message });
  }
}
