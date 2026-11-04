import mongoose from 'mongoose';

// Refresh tokens (guardamos só o HASH). Cada login cria uma "família"; a cada renovação o token
// é trocado (rotação). Reuso de um token já usado => possível roubo => a família inteira é revogada.
const sessaoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  tipo: { type: String, enum: ['admin', 'cliente'], required: true },
  familia: { type: String, required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiraEm: { type: Date, required: true },
  usadoEm: { type: Date, default: null },
  revogadoEm: { type: Date, default: null },
  userAgent: { type: String, maxlength: 200 },
  criadoEm: { type: Date, default: Date.now },
});

sessaoSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 0 }); // o MongoDB apaga sessões vencidas sozinho

export default mongoose.model('Sessao', sessaoSchema);
