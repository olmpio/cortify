import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioAdminSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: 6,
      select: false,
    },
    barbeariaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barbearia',
      required: true,
    },
  },
  { timestamps: true }
);

usuarioAdminSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

usuarioAdminSchema.methods.compararSenha = async function (senhaCandidata) {
  return bcrypt.compare(senhaCandidata, this.senha);
};

export default mongoose.model('UsuarioAdmin', usuarioAdminSchema);
