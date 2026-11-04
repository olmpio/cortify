import mongoose from 'mongoose';

// Uma conversa = um cliente conversando com uma barbearia (única por par).
const conversaSchema = new mongoose.Schema(
  {
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    barbeariaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barbearia', required: true },
    ultimaMensagem: { type: String, default: '' },
    ultimaMensagemEm: { type: Date, default: Date.now },
    naoLidasCliente: { type: Number, default: 0 },
    naoLidasBarbearia: { type: Number, default: 0 },
  },
  { timestamps: true }
);

conversaSchema.index({ clienteId: 1, barbeariaId: 1 }, { unique: true });
conversaSchema.index({ barbeariaId: 1, ultimaMensagemEm: -1 });

export default mongoose.model('Conversa', conversaSchema);
