import mongoose from 'mongoose';

const agendamentoSchema = new mongoose.Schema(
  {
    barbeariaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barbearia',
      required: true,
      index: true,
    },
    barbeiroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barbeiro',
      required: true,
      index: true,
    },
    servicoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Servico',
      required: true,
    },
    // Conta do cliente que agendou (agendamentos antigos podem não ter)
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      index: true,
    },
    clienteNome: {
      type: String,
      required: [true, 'Nome do cliente é obrigatório'],
      trim: true,
    },
    clienteTelefone: {
      type: String,
      required: [true, 'Telefone do cliente é obrigatório'],
      trim: true,
    },
    clienteEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    data: {
      type: String,
      required: true,
    },
    horario: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pendente', 'confirmado', 'concluido', 'cancelado'],
      default: 'confirmado',
    },
  },
  { timestamps: true }
);

// Só agendamentos ATIVOS bloqueiam o horário. Antes, um agendamento cancelado
// continuava ocupando o slot para sempre (índice único incluía cancelados).
agendamentoSchema.index(
  { barbeiroId: 1, data: 1, horario: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pendente', 'confirmado'] } } }
);
agendamentoSchema.index({ barbeariaId: 1, data: 1 });

export default mongoose.model('Agendamento', agendamentoSchema);
