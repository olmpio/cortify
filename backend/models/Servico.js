import mongoose from 'mongoose';

const servicoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome do serviço é obrigatório'],
      trim: true,
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    preco: {
      type: Number,
      required: [true, 'Preço é obrigatório'],
      min: 0,
    },
    duracaoMinutos: {
      type: Number,
      required: [true, 'Duração é obrigatória'],
      min: 5,
    },
    barbeariaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barbearia',
      required: true,
      index: true,
    },
    categoria: {
      type: String,
      required: true,
      default: 'Corte',
      enum: ['Corte', 'Combo', 'Adicional', 'Tratamento'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Servico', servicoSchema);
