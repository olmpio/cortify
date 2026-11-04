import RateLimit from '../models/RateLimit.js';
import { log } from '../utils/logger.js';

/**
 * Store do express-rate-limit baseado no MongoDB: o limite vale para TODAS as instâncias da API
 * (o store padrão guarda na memória de cada processo, o que multiplica o limite pelo nº de instâncias).
 * Em falha do banco, "abre" (não bloqueia usuários legítimos) e registra o erro.
 */
export class MongoRateLimitStore {
  constructor(prefixo) {
    this.prefixo = prefixo;
    this.windowMs = 60_000;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  chave(k) {
    return `${this.prefixo}:${k}`;
  }

  async increment(key) {
    const _id = this.chave(key);
    const agora = new Date();
    try {
      // 1) janela ativa: só incrementa
      let doc = await RateLimit.findOneAndUpdate({ _id, expiraEm: { $gt: agora } }, { $inc: { hits: 1 } }, { new: true });
      if (!doc) {
        // 2) sem janela (ou vencida): abre uma nova com 1 acesso
        doc = await RateLimit.findOneAndUpdate(
          { _id },
          { $set: { hits: 1, expiraEm: new Date(agora.getTime() + this.windowMs) } },
          { new: true, upsert: true }
        );
      }
      return { totalHits: doc.hits, resetTime: doc.expiraEm };
    } catch (err) {
      log('error', 'ratelimit_store_falhou', { erro: err.message });
      return { totalHits: 1, resetTime: new Date(agora.getTime() + this.windowMs) };
    }
  }

  async decrement(key) {
    try {
      await RateLimit.updateOne({ _id: this.chave(key), hits: { $gt: 0 } }, { $inc: { hits: -1 } });
    } catch {
      /* ignora */
    }
  }

  async resetKey(key) {
    try {
      await RateLimit.deleteOne({ _id: this.chave(key) });
    } catch {
      /* ignora */
    }
  }
}
