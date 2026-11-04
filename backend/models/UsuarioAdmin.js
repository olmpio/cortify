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
    // Recuperação de senha: guardamos só o hash SHA-256 do token enviado por e-mail.
    resetSenhaHash: { type: String, select: false },
    resetSenhaExpira: { type: Date, select: false },
    // Tokens JWT emitidos antes desta data deixam de valer (ex.: após troca de senha).
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

usuarioAdminSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(12);
  this.senha = await bcrypt.hash(this.senha, salt);
  if (!this.isNew) this.senhaAlteradaEm = new Date();
  next();
});

usuarioAdminSchema.methods.compararSenha = async function (senhaCandidata) {
  return bcrypt.compare(senhaCandidata, this.senha);
};

export default mongoose.model('UsuarioAdmin', usuarioAdminSchema);
