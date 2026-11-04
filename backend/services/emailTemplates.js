import { env } from '../config/env.js';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const preco = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function dataExtenso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

// Mesma identidade visual do site: fundo stone-950, cartão stone-900, destaque amber-500.
function layout({ titulo, corpo, rodape = '' }) {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0c0a09;font-family:Segoe UI,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c0a09;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<tr><td style="padding:0 0 20px 4px;color:#f59e0b;font-size:18px;font-weight:700;letter-spacing:.5px;">✂ BarberSync</td></tr>
<tr><td style="background:#1c1917;border:1px solid #292524;border-radius:16px;padding:32px;">
<h1 style="margin:0 0 16px;color:#ffffff;font-size:22px;">${esc(titulo)}</h1>
${corpo}
</td></tr>
<tr><td style="padding:20px 4px;color:#78716c;font-size:12px;line-height:1.5;">${rodape || 'Você recebeu este e-mail porque uma ação foi feita com o seu endereço no BarberSync.'}</td></tr>
</table></td></tr></table></body></html>`;
}

const p = (t) => `<p style="margin:0 0 16px;color:#d6d3d1;font-size:15px;line-height:1.6;">${t}</p>`;

const botao = (url, label) =>
  `<p style="margin:24px 0;"><a href="${esc(url)}" style="background:#f59e0b;color:#0c0a09;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:12px;display:inline-block;">${esc(label)}</a></p>`;

const linha = (rotulo, valor) =>
  `<tr><td style="padding:8px 0;color:#78716c;font-size:13px;width:110px;">${esc(rotulo)}</td><td style="padding:8px 0;color:#ffffff;font-size:15px;font-weight:600;">${valor}</td></tr>`;

function tabelaAgendamento(ag) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #292524;border-bottom:1px solid #292524;margin:8px 0 20px;">
${linha('Serviço', `${esc(ag.servicoId?.nome)} · ${preco(ag.servicoId?.preco)}`)}
${linha('Barbeiro', esc(ag.barbeiroId?.nome))}
${linha('Data', esc(dataExtenso(ag.data)))}
${linha('Horário', esc(ag.horario))}
${linha('Local', `${esc(ag.barbeariaId?.nome)}<br><span style="color:#a8a29e;font-weight:400;font-size:13px;">${esc(ag.barbeariaId?.endereco)}</span>`)}
</table>`;
}

export const templates = {
  verificarEmail({ nome, link }) {
    return {
      assunto: 'Confirme seu e-mail — BarberSync',
      html: layout({
        titulo: `Confirme seu e-mail, ${nome.split(' ')[0]}`,
        corpo:
          p('Para liberar todos os recursos da sua conta, confirme que este e-mail é seu.') +
          botao(link, 'Confirmar e-mail') +
          p('O link vale por <strong style="color:#fff">24 horas</strong>. Se você não criou uma conta no BarberSync, ignore esta mensagem.'),
      }),
    };
  },

  boasVindas({ nomeAdmin, nomeBarbearia }) {
    return {
      assunto: 'Bem-vindo ao BarberSync! 💈',
      html: layout({
        titulo: `Olá, ${nomeAdmin.split(' ')[0]}!`,
        corpo:
          p(`A barbearia <strong style="color:#f59e0b">${esc(nomeBarbearia)}</strong> foi cadastrada com sucesso.`) +
          p('Agora é só cadastrar seus barbeiros e serviços para começar a receber agendamentos online.') +
          botao(`${env.clientUrl}`, 'Acessar o painel'),
      }),
    };
  },

  boasVindasCliente({ nome }) {
    return {
      assunto: 'Sua conta no BarberSync foi criada ✂️',
      html: layout({
        titulo: `Bem-vindo, ${nome.split(' ')[0]}!`,
        corpo:
          p('Sua conta foi criada. Agora você pode agendar em qualquer barbearia parceira e acompanhar o histórico dos seus agendamentos.') +
          botao(`${env.clientUrl}`, 'Agendar agora'),
      }),
    };
  },

  redefinirSenha({ nome, link }) {
    return {
      assunto: 'Redefinição de senha — BarberSync',
      html: layout({
        titulo: 'Redefinir sua senha',
        corpo:
          p(`Olá, ${esc(nome.split(' ')[0])}. Recebemos um pedido para redefinir a senha da sua conta.`) +
          botao(link, 'Criar nova senha') +
          p('O link expira em <strong style="color:#fff">1 hora</strong>. Se você não fez esse pedido, ignore este e-mail: sua senha continua a mesma.'),
      }),
    };
  },

  senhaAlterada({ nome }) {
    return {
      assunto: 'Sua senha foi alterada — BarberSync',
      html: layout({
        titulo: 'Senha alterada',
        corpo:
          p(`Olá, ${esc(nome.split(' ')[0])}. A senha da sua conta foi alterada agora há pouco.`) +
          p('Se não foi você, redefina sua senha imediatamente e entre em contato com o suporte.'),
      }),
    };
  },

  agendamentoConfirmado(ag) {
    return {
      assunto: `Agendamento confirmado — ${ag.barbeariaId?.nome}`,
      html: layout({
        titulo: 'Agendamento confirmado! ✅',
        corpo:
          p(`Olá, ${esc(ag.clienteNome.split(' ')[0])}! Seu horário foi reservado:`) +
          tabelaAgendamento(ag) +
          p('Chegue com alguns minutos de antecedência. Precisando cancelar, avise a barbearia pelo telefone ' +
            `<strong style="color:#fff">${esc(ag.barbeariaId?.telefone || '')}</strong>.`),
      }),
    };
  },

  novoAgendamentoParaBarbearia(ag) {
    return {
      assunto: `Novo agendamento: ${ag.clienteNome} — ${ag.horario}`,
      html: layout({
        titulo: 'Novo agendamento recebido 📅',
        corpo:
          p(`<strong style="color:#f59e0b">${esc(ag.clienteNome)}</strong> agendou um horário.`) +
          tabelaAgendamento(ag) +
          p(`Contato do cliente: <strong style="color:#fff">${esc(ag.clienteTelefone)}</strong>${ag.clienteEmail ? ` · ${esc(ag.clienteEmail)}` : ''}`) +
          botao(`${env.clientUrl}`, 'Ver agenda'),
        rodape: 'Notificação automática do BarberSync para o responsável pela barbearia.',
      }),
    };
  },

  novaMensagemParaBarbearia({ clienteNome, texto }) {
    return {
      assunto: `Nova mensagem de ${clienteNome}`,
      html: layout({
        titulo: 'Você recebeu uma mensagem 💬',
        corpo:
          p(`<strong style="color:#f59e0b">${esc(clienteNome)}</strong> escreveu para a sua barbearia:`) +
          `<blockquote style="margin:0 0 16px;padding:12px 16px;border-left:3px solid #f59e0b;background:#0c0a09;color:#d6d3d1;font-size:14px;white-space:pre-wrap;">${esc(texto.slice(0, 300))}</blockquote>` +
          botao(`${env.clientUrl}`, 'Responder no painel'),
        rodape: 'Você só recebe este aviso na primeira mensagem não lida de cada conversa.',
      }),
    };
  },

  agendamentoCancelado(ag) {
    return {
      assunto: `Agendamento cancelado — ${ag.barbeariaId?.nome}`,
      html: layout({
        titulo: 'Agendamento cancelado',
        corpo:
          p(`Olá, ${esc(ag.clienteNome.split(' ')[0])}. Infelizmente o horário abaixo foi cancelado pela barbearia:`) +
          tabelaAgendamento(ag) +
          p(`Para reagendar, acesse <a href="${esc(env.clientUrl)}" style="color:#f59e0b">${esc(env.clientUrl)}</a> ou ligue para ${esc(ag.barbeariaId?.telefone || 'a barbearia')}.`),
      }),
    };
  },

  agendamentoConcluido(ag) {
    return {
      assunto: `Obrigado pela visita — ${ag.barbeariaId?.nome}`,
      html: layout({
        titulo: 'Obrigado pela visita! 💈',
        corpo:
          p(`Olá, ${esc(ag.clienteNome.split(' ')[0])}! Foi um prazer atender você.`) +
          p(`Quando quiser repetir o visual, é só agendar de novo: <a href="${esc(env.clientUrl)}" style="color:#f59e0b">${esc(env.clientUrl)}</a>`),
      }),
    };
  },

  alerta({ titulo, detalhes }) {
    return {
      assunto: `🚨 [BarberSync] ${titulo}`,
      html: layout({
        titulo: `🚨 ${titulo}`,
        corpo:
          `<pre style="margin:0;padding:16px;background:#0c0a09;border:1px solid #292524;border-radius:10px;color:#fca5a5;font-size:13px;white-space:pre-wrap;word-break:break-word;">${esc(detalhes)}</pre>` +
          p(`<span style="color:#78716c">Horário: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Bahia' })}</span>`),
        rodape: 'Alerta automático de monitoramento do servidor BarberSync.',
      }),
    };
  },
};
