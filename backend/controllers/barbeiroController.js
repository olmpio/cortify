import Barbeiro from '../models/Barbeiro.js';
import Barbearia from '../models/Barbearia.js';
import Servico from '../models/Servico.js';
import Agendamento from '../models/Agendamento.js';

export async function listarBarbeirosPorBarbearia(req, res) {
  try {
    const barbeiros = await Barbeiro.find({ barbeariaId: req.params.barbeariaId, ativo: true }).sort({ nome: 1 });
    res.json(barbeiros);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar barbeiros', detalhe: err.message });
  }
}

export async function criarBarbeiro(req, res) {
  try {
    const barbeiro = new Barbeiro({
      ...req.body,
      barbeariaId: req.barbeariaId,
    });
    await barbeiro.save();
    res.status(201).json(barbeiro);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao criar barbeiro', detalhe: err.message });
  }
}

export async function atualizarBarbeiro(req, res) {
  try {
    const barbeiro = await Barbeiro.findOneAndUpdate(
      { _id: req.params.id, barbeariaId: req.barbeariaId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!barbeiro) {
      return res.status(404).json({ erro: 'Barbeiro não encontrado' });
    }
    res.json(barbeiro);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar barbeiro', detalhe: err.message });
  }
}

export async function deletarBarbeiro(req, res) {
  try {
    const barbeiro = await Barbeiro.findOneAndUpdate(
      { _id: req.params.id, barbeariaId: req.barbeariaId },
      { ativo: false },
      { new: true }
    );
    if (!barbeiro) {
      return res.status(404).json({ erro: 'Barbeiro não encontrado' });
    }
    res.json({ mensagem: 'Barbeiro desativado com sucesso' });
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao desativar barbeiro', detalhe: err.message });
  }
}

/**
 * ROTA INTELIGENTE: Retorna apenas os barbeiros disponíveis
 * no dia/horário escolhido, cruzando horários ocupados.
 *
 * Query params:
 *   - barbeariaId (obrigatório)
 *   - servicoId (obrigatório)
 *   - data (obrigatório, formato YYYY-MM-DD)
 *   - horario (obrigatório, formato HH:MM)
 */
export async function buscarBarbeirosDisponiveis(req, res) {
  try {
    const { barbeariaId, servicoId, data, horario } = req.query;

    if (!barbeariaId || !servicoId || !data || !horario) {
      return res.status(400).json({
        erro: 'Parâmetros obrigatórios: barbeariaId, servicoId, data, horario',
      });
    }

    const barbearia = await Barbearia.findById(barbeariaId);
    if (!barbearia) {
      return res.status(404).json({ erro: 'Barbearia não encontrada' });
    }

    const servico = await Servico.findById(servicoId);
    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    const [year, month, day] = data.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const diaSemana = dateObj.getDay();

    if (!barbearia.diasFuncionamento.includes(diaSemana)) {
      return res.json({
        disponiveis: [],
        mensagem: 'A barbearia não funciona neste dia da semana',
      });
    }

    const [h, m] = horario.split(':').map(Number);
    const horarioInicioMin = h * 60 + m;
    const horarioFimMin = horarioInicioMin + servico.duracaoMinutos;

    const barbeiros = await Barbeiro.find({ barbeariaId, ativo: true });

    const agendamentosDoDia = await Agendamento.find({
      barbeariaId,
      data,
      status: { $in: ['pendente', 'confirmado'] },
    }).populate('servicoId', 'duracaoMinutos');

    const disponiveis = [];

    for (const barbeiro of barbeiros) {
      if (barbeiro.diasFolga.includes(diaSemana)) continue;

      const [bh, bm] = barbeiro.horarioInicio.split(':').map(Number);
      const [fh, fm] = barbeiro.horarioFim.split(':').map(Number);
      const expedienteInicio = bh * 60 + bm;
      const expedienteFim = fh * 60 + fm;

      if (horarioInicioMin < expedienteInicio || horarioFimMin > expedienteFim) continue;

      const agendamentosBarbeiro = agendamentosDoDia.filter((a) => a.barbeiroId.equals(barbeiro._id));

      let temConflito = false;
      for (const ag of agendamentosBarbeiro) {
        const [aH, aM] = ag.horario.split(':').map(Number);
        const agInicio = aH * 60 + aM;
        const duracaoAg = ag.servicoId?.duracaoMinutos || 30;
        const agFim = agInicio + duracaoAg;

        if (horarioInicioMin < agFim && horarioFimMin > agInicio) {
          temConflito = true;
          break;
        }
      }

      if (!temConflito) {
        disponiveis.push(barbeiro);
      }
    }

    res.json({
      disponiveis,
      total: disponiveis.length,
      horarioSolicitado: horario,
      dataSolicitada: data,
      servico: {
        id: servico._id,
        nome: servico.nome,
        duracaoMinutos: servico.duracaoMinutos,
      },
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar barbeiros disponíveis', detalhe: err.message });
  }
}

/**
 * ROTA INTELIGENTE: Retorna os horários disponíveis para um barbeiro
 * específico em uma data, considerando agendamentos existentes.
 *
 * Query params:
 *   - barbeariaId
 *   - barbeiroId
 *   - servicoId
 *   - data (YYYY-MM-DD)
 */
export async function buscarHorariosDisponiveis(req, res) {
  try {
    const { barbeariaId, barbeiroId, servicoId, data } = req.query;

    if (!barbeariaId || !barbeiroId || !servicoId || !data) {
      return res.status(400).json({
        erro: 'Parâmetros obrigatórios: barbeariaId, barbeiroId, servicoId, data',
      });
    }

    const barbearia = await Barbearia.findById(barbeariaId);
    const barbeiro = await Barbeiro.findById(barbeiroId);
    const servico = await Servico.findById(servicoId);

    if (!barbearia || !barbeiro || !servico) {
      return res.status(404).json({ erro: 'Recurso não encontrado' });
    }

    const [year, month, day] = data.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const diaSemana = dateObj.getDay();

    if (barbeiro.diasFolga.includes(diaSemana) || !barbearia.diasFuncionamento.includes(diaSemana)) {
      return res.json({ horarios: [], mensagem: 'Barbeiro ou barbearia não atende neste dia' });
    }

    const expedienteInicio = barbeiro.horarioInicio > barbearia.horarioAbertura
      ? barbeiro.horarioInicio
      : barbearia.horarioAbertura;
    const expedienteFim = barbeiro.horarioFim < barbearia.horarioFechamento
      ? barbeiro.horarioFim
      : barbearia.horarioFechamento;

    const slots = gerarSlots(expedienteInicio, expedienteFim, 30);

    const agendamentosDoDia = await Agendamento.find({
      barbeiroId,
      data,
      status: { $in: ['pendente', 'confirmado'] },
    }).populate('servicoId', 'duracaoMinutos');

    const horariosDisponiveis = slots.filter((slot) => {
      const [sh, sm] = slot.split(':').map(Number);
      const inicioMin = sh * 60 + sm;
      const fimMin = inicioMin + servico.duracaoMinutos;

      const [fh, fm] = expedienteFim.split(':').map(Number);
      const expedienteFimMin = fh * 60 + fm;
      if (fimMin > expedienteFimMin) return false;

      for (const ag of agendamentosDoDia) {
        const [aH, aM] = ag.horario.split(':').map(Number);
        const agInicio = aH * 60 + aM;
        const duracaoAg = ag.servicoId?.duracaoMinutos || 30;
        const agFim = agInicio + duracaoAg;
        if (inicioMin < agFim && fimMin > agInicio) return false;
      }
      return true;
    });

    res.json({
      horarios: horariosDisponiveis,
      total: horariosDisponiveis.length,
      data,
      barbeiro: { id: barbeiro._id, nome: barbeiro.nome },
      servico: { id: servico._id, nome: servico.nome, duracaoMinutos: servico.duracaoMinutos },
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar horários disponíveis', detalhe: err.message });
  }
}

function gerarSlots(inicio, fim, intervalo) {
  const slots = [];
  const [hIni, mIni] = inicio.split(':').map(Number);
  const [hFim, mFim] = fim.split(':').map(Number);
  let total = hIni * 60 + mIni;
  const end = hFim * 60 + mFim;
  while (total + intervalo <= end) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    total += intervalo;
  }
  return slots;
}
