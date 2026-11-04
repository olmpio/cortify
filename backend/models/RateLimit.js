import mongoose from 'mongoose';

// Contadores do rate limit compartilhados entre instâncias (opcional: RATE_LIMIT_STORE=mongo).
const schema = new mongoose.Schema({
  _id: { type: String }, // "<limitador>:<chave>"
  hits: { type: Number, default: 0 },
  expiraEm: { type: Date, required: true },
});
schema.index({ expiraEm: 1 }, { expireAfterSeconds: 0 }); // limpeza automática

export default mongoose.model('RateLimit', schema);
