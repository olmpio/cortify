// Uso: npm run test:email -- seu@email.com
import '../config/env.js';
import { enviarEmail, verificarSmtp } from '../services/emailService.js';
import { templates } from '../services/emailTemplates.js';

const para = process.argv[2];
if (!para) {
  console.error('Informe o destinatário: npm run test:email -- seu@email.com');
  process.exit(1);
}

console.log('SMTP:', await verificarSmtp());
const t = templates.boasVindas({ nomeAdmin: 'Teste da Silva', nomeBarbearia: 'Barbearia de Teste' });
console.log(await enviarEmail({ para, assunto: t.assunto, html: t.html }));
process.exit(0);
