import mongoose from 'mongoose';

const mensagemSchema = new mongoose.Schema(
  {
    conversaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversa', required: true },
    de: { type: String, enum: ['cliente', 'barbearia'], required: true },
    texto: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

mensagemSchema.index({ conversaId: 1, createdAt: 1 });

export default mongoose.model('Mensagem', mensagemSchema);
