import mongoose from 'mongoose';
import { env } from '../config/env.js';

export * from './validacao.js';

/** Em produção nunca devolvemos a mensagem interna do erro ao cliente. */
export function detalheErro(err) {
  return env.isProd ? {} : { detalhe: err.message };
}

export const idValido = (id) => typeof id === 'string' && id.length === 24 && mongoose.isValidObjectId(id);
