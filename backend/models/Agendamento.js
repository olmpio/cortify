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

agendamentoSchema.index({ barbeiroId: 1, data: 1, horario: 1 }, { unique: true });

export default mongoose.model('Agendamento', agendamentoSchema);
