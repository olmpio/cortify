import Agendamento from '../models/Agendamento.js';
import Barbeiro from '../models/Barbeiro.js';
import Servico from '../models/Servico.js';
import Barbearia from '../models/Barbearia.js';
import { detalheErro, idValido, dataValida, horaValida, agoraBrasil, paraMinutos } from '../utils/http.js';
import { enviarEmail } from '../services/emailService.js';
import { templates } from '../services/emailTemplates.js';

const STATUS_VALIDOS = ['pendente', 'confirmado', 'concluido', 'cancelado'];

const populate = (q) =>
  q.populate('barbeariaId', 'nome endereco telefone email').populate('barbeiroId', 'nome').populate('servicoId', 'nome preco duracaoMinutos');

/** Dispara os e-mails de um novo agendamento sem bloquear a resposta HTTP. */
function notificarNovoAgendamento(ag) {
  if (ag.clienteEmail) {
    const t = templates.agendamentoConfirmado(ag);
    enviarEmail({ para: ag.clienteEmail, assunto: t.assunto, html: t.html });
  }
  if (ag.barbeariaId?.email) {
    const t = templates.novoAgendamentoParaBarbearia(ag);
    enviarEmail({ para: ag.barbeariaId.email, assunto: t.assunto, html: t.html });
  }
}

/**
 * POST /api/agendamentos (exige cliente logado).
 * Os dados do cliente (nome, telefone, e-mail) vêm da CONTA, nunca do corpo da requisição.
 * Valida disponibilidade antes de salvar e envia e-mails transacionais.
 */
export async function criarAgendamento(req, res) {
  try {
    const { barbeariaId, barbeiroId, servicoId, data, horario } = req.body;
    const cliente = req.cliente;

    if (!barbeariaId || !barbeiroId || !servicoId || !data || !horario) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: barbeariaId, barbeiroId, servicoId, data, horario',
      });
    }
    if (![barbeariaId, barbeiroId, servicoId].every(idValido)) return res.status(400).json({ erro: 'ID inválido' });
    if (!dataValida(data) || !horaValida(horario)) return res.status(400).json({ erro: 'Data ou horário em formato inválido' });

    const agora = agoraBrasil();
    if (data < agora.data || (data === agora.data && paraMinutos(horario) <= paraMinutos(agora.hora))) {
      return res.status(400).json({ erro: 'Não é possível agendar em um horário que já passou' });
    }

    const [barbearia, barbeiro, servico] = await Promise.all([
      Barbearia.findById(barbeariaId),
      Barbeiro.findById(barbeiroId),
      Servico.findById(servicoId),
    ]);

    if (!barbearia || !barbeiro || !servico) {
      return res.status(404).json({ erro: 'Barbearia, barbeiro ou serviço não encontrado' });
    }
    if (!barbeiro.ativo) return res.status(409).json({ erro: 'Este barbeiro não está mais disponível' });

    if (!barbeiro.barbeariaId.equals(barbearia._id) || !servico.barbeariaId.equals(barbearia._id)) {
      return res.status(400).json({ erro: 'Barbeiro ou serviço não pertence a esta barbearia' });
    }

    const [year, month, day] = data.split('-').map(Number);
    const diaSemana = new Date(year, month - 1, day).getDay();

    if (barbeiro.diasFolga.includes(diaSemana)) return res.status(409).json({ erro: 'O barbeiro está de folga neste dia' });
    if (!barbearia.diasFuncionamento.includes(diaSemana)) return res.status(409).json({ erro: 'A barbearia não funciona neste dia' });

    const inicio = paraMinutos(horario);
    const fim = inicio + servico.duracaoMinutos;

    const expInicio = Math.max(paraMinutos(barbeiro.horarioInicio), paraMinutos(barbearia.horarioAbertura));
    const expFim = Math.min(paraMinutos(barbeiro.horarioFim), paraMinutos(barbearia.horarioFechamento));

    if (inicio < expInicio || fim > expFim) {
      return res.status(409).json({ erro: 'Horário fora do expediente' });
    }

    const existentes = await Agendamento.find({
      barbeiroId,
      data,
      status: { $in: ['pendente', 'confirmado'] },
    }).populate('servicoId', 'duracaoMinutos');

    for (const ag of existentes) {
      const agInicio = paraMinutos(ag.horario);
      const agFim = agInicio + (ag.servicoId?.duracaoMinutos || 30);
      if (inicio < agFim && fim > agInicio) {
        return res.status(409).json({ erro: 'Este horário acabou de ser ocupado. Escolha outro.' });
      }
    }

    const criado = await Agendamento.create({
      barbeariaId,
      barbeiroId,
      servicoId,
      clienteId: cliente._id,
      clienteNome: cliente.nome,
      clienteTelefone: cliente.telefone,
      clienteEmail: cliente.email,
      data,
      horario,
      status: 'confirmado',
    });

    const agendamento = await populate(Agendamento.findById(criado._id));

    notificarNovoAgendamento(agendamento); // assíncrono, nunca derruba o agendamento

    res.status(201).json({ mensagem: 'Agendamento criado com sucesso', agendamento });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Este horário acabou de ser ocupado. Escolha outro.' });
    }
    res.status(400).json({ erro: 'Erro ao criar agendamento', ...detalheErro(err) });
  }
}

/** GET /api/agendamentos/barbearia/:barbeariaId (protegido + isolado por barbearia na rota) */
export async function listarAgendamentosPorBarbearia(req, res) {
  try {
    const { data, status } = req.query;

    const filtro = { barbeariaId: req.barbeariaId }; // sempre a do usuário logado
    if (data) {
      if (!dataValida(data)) return res.status(400).json({ erro: 'Data inválida' });
      filtro.data = data;
    }
    if (status) {
      if (!STATUS_VALIDOS.includes(status)) return res.status(400).json({ erro: 'Status inválido' });
      filtro.status = status;
    }

    const agendamentos = await Agendamento.find(filtro)
      .populate('barbeiroId', 'nome')
      .populate('servicoId', 'nome preco duracaoMinutos')
      .sort({ data: -1, horario: -1 })
      .limit(2000); // teto de segurança/performance

    res.json(agendamentos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar agendamentos', ...detalheErro(err) });
  }
}

/** GET /api/agendamentos/:id (protegido: só agendamentos da própria barbearia) */
export async function obterAgendamento(req, res) {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });

    const agendamento = await populate(Agendamento.findOne({ _id: req.params.id, barbeariaId: req.barbeariaId }));
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });

    res.json(agendamento);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar agendamento', ...detalheErro(err) });
  }
}

/** PATCH /api/agendamentos/:id/status (protegido, isolado por barbearia) */
export async function atualizarStatusAgendamento(req, res) {
  try {
    const { status } = req.body;
    if (!idValido(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ erro: `Status deve ser um de: ${STATUS_VALIDOS.join(', ')}` });
    }

    const atual = await Agendamento.findOne({ _id: req.params.id, barbeariaId: req.barbeariaId });
    if (!atual) return res.status(404).json({ erro: 'Agendamento não encontrado' });

    const mudou = atual.status !== status;
    atual.status = status;
    await atual.save();

    const agendamento = await populate(Agendamento.findById(atual._id));

    if (mudou && agendamento.clienteEmail) {
      if (status === 'cancelado') {
        const t = templates.agendamentoCancelado(agendamento);
        enviarEmail({ para: agendamento.clienteEmail, assunto: t.assunto, html: t.html });
      } else if (status === 'concluido') {
        const t = templates.agendamentoConcluido(agendamento);
        enviarEmail({ para: agendamento.clienteEmail, assunto: t.assunto, html: t.html });
      }
    }

    res.json(agendamento);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Já existe outro agendamento ativo neste horário' });
    }
    res.status(400).json({ erro: 'Erro ao atualizar status', ...detalheErro(err) });
  }
}
