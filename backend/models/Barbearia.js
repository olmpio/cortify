import mongoose from 'mongoose';

const barbeariaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome da barbearia é obrigatório'],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    endereco: {
      type: String,
      required: [true, 'Endereço é obrigatório'],
      trim: true,
    },
    telefone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    horarioAbertura: {
      type: String,
      required: true,
      default: '09:00',
    },
    horarioFechamento: {
      type: String,
      required: true,
      default: '20:00',
    },
    diasFuncionamento: {
      type: [Number],
      required: true,
      default: [1, 2, 3, 4, 5, 6],
      validate: {
        validator: (v) => v.every((d) => d >= 0 && d <= 6),
        message: 'Dias devem ser entre 0 (Domingo) e 6 (Sábado)',
      },
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    imagemUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Barbearia', barbeariaSchema);
