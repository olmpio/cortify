import mongoose from 'mongoose';

const barbeiroSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome do barbeiro é obrigatório'],
      trim: true,
    },
    barbeariaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barbearia',
      required: true,
      index: true,
    },
    especialidades: {
      type: [String],
      default: [],
    },
    horarioInicio: {
      type: String,
      required: true,
      default: '09:00',
    },
    horarioFim: {
      type: String,
      required: true,
      default: '18:00',
    },
    diasFolga: {
      type: [Number],
      default: [],
      validate: {
        validator: (v) => v.every((d) => d >= 0 && d <= 6),
        message: 'Dias de folga devem ser entre 0 (Domingo) e 6 (Sábado)',
      },
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Barbeiro', barbeiroSchema);
