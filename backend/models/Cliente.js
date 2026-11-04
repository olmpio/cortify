import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Conta do cliente final (quem agenda). Totalmente separada de UsuarioAdmin (dono da barbearia).
const clienteSchema = new mongoose.Schema(
  {
    nome: { type: String, required: [true, 'Nome é obrigatório'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    telefone: { type: String, required: [true, 'Telefone é obrigatório'], trim: true, maxlength: 30 },
    senha: { type: String, required: [true, 'Senha é obrigatória'], minlength: 6, select: false },
    resetSenhaHash: { type: String, select: false },
    resetSenhaExpira: { type: Date, select: false },
    senhaAlteradaEm: { type: Date, default: null },
    // Verificação de e-mail (impede cadastrar o e-mail de outra pessoa para ela receber spam)
    emailVerificado: { type: Boolean, default: false },
    verificacaoHash: { type: String, select: false },
    verificacaoExpira: { type: Date, select: false },
    verificacaoEnviadaEm: { type: Date, select: false },
    // LGPD: registro do aceite dos Termos de Uso / Política de Privacidade
    aceitouTermosEm: { type: Date, default: null },
  },
  { timestamps: true }
);

clienteSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, await bcrypt.genSalt(12));
  if (!this.isNew) this.senhaAlteradaEm = new Date();
  next();
});

clienteSchema.methods.compararSenha = function (candidata) {
  return bcrypt.compare(candidata, this.senha);
};

export default mongoose.model('Cliente', clienteSchema);
