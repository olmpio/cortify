# Guia de produção e segurança

## 1. O que está implementado

| Camada | Proteção |
|---|---|
| **Sessão** | Access token JWT de 15 min **só em memória** (nada sensível no `localStorage`). Renovação por **refresh token em cookie `httpOnly` + `Secure` + `SameSite`**, com **rotação** a cada uso e **detecção de reuso** (token copiado ⇒ a sessão inteira é revogada). Logout revoga no servidor. Trocar/redefinir a senha derruba todos os dispositivos. |
| **JWT** | Algoritmo fixo HS256, `issuer` e `audience` (`admin`/`cliente`): token de cliente nunca abre o painel e vice-versa. Segredo ≥ 32 caracteres exigido em produção. |
| **Senhas** | bcrypt custo 12, mínimo 8 com letras+números, lista de senhas comuns, não pode conter o e-mail, limite de 72 bytes (bcrypt). Tempo de resposta igualado quando o e-mail não existe. |
| **Força bruta** | Limite por IP **e** por e-mail-alvo (vale igual para e-mails que existem ou não). Limites próprios para cadastro, reenvio de e-mail, agendamento, chat e upload. |
| **Contas** | Verificação de e-mail (sem ela: nada de agendar/conversar ⇒ ninguém usa o e-mail de terceiros para disparar mensagens). Aceite de Termos/Privacidade registrado. |
| **Multi-tenant** | Toda rota do painel usa a barbearia do **token**, nunca um ID enviado pelo cliente; `exigirMinhaBarbearia` devolve 403 em tentativa de acessar outra. Campos editáveis em lista permitida (anti mass-assignment). |
| **Injeção** | Sanitização global de `$operadores`, chaves com `.` e `__proto__` (NoSQL injection / prototype pollution); validação de tipo/formato em todas as entradas; React escapa toda saída (sem `dangerouslySetInnerHTML`); e-mails escapam HTML. |
| **HTTP** | Helmet com CSP restritiva na API, HSTS, `Referrer-Policy: no-referrer`; CORS por lista de origens com credenciais; **redirecionamento HTTPS**; **CSRF** nas rotas de cookie via checagem de `Origin`; limites de corpo; timeouts (anti-slowloris). |
| **Uploads** | Só JPG/PNG/WebP (SVG recusado), **assinatura do arquivo conferida**, 700 KB, limite por hora, servidos com `nosniff`. Capa não aceita URL externa. |
| **LGPD** | Termos e Privacidade (textos-modelo), exportação dos dados (`GET /clientes/meus-dados`) e **exclusão da conta** com anonimização (`DELETE /clientes/conta`). |
| **Operação** | Logs JSON com `X-Request-Id` e eventos de segurança (`seguranca:*`); alertas por e-mail/webhook; `/health` e `/health/ready`; erros 500 sem detalhes ao usuário; seed **bloqueado** em produção; servidor **recusa subir** com config insegura. |
| **Engenharia** | Testes automatizados (`npm test` no backend), CI (typecheck, build, `npm audit`), Dependabot, Dockerfile não-root com healthcheck. |

## 2. Subindo para produção (passo a passo)

1. **Domínios** — o ideal é front e API no *mesmo site*: `app.seudominio.com` e `api.seudominio.com` (cookies `SameSite=Lax`, mais seguro). Se forem sites diferentes, use `COOKIE_SAMESITE=none` (exige HTTPS).
2. **MongoDB** — use um serviço gerenciado (Atlas): usuário com privilégio **mínimo** (readWrite só neste banco), acesso liberado apenas aos IPs da API, **backups automáticos ligados**, TLS.
3. **API** — hospede o `backend/` (Render, Railway, Fly.io, VPS com Docker...). Configure as variáveis de `backend/.env.example` no painel do provedor — **nunca** commite o `.env`. Gere o `JWT_SECRET` com o comando do próprio arquivo. `NODE_ENV=production`.
4. **E-mail** — configure SMTP e, no DNS do domínio remetente, **SPF, DKIM e DMARC** (senão os e-mails caem no spam).
5. **Frontend** — `npm run build` (com `VITE_API_URL=https://api.seudominio.com/api`) e publique a pasta `dist/` (Netlify, Cloudflare Pages, Vercel). Edite `public/_headers` trocando `api.SEUDOMINIO.com`. Em Nginx, aplique os mesmos cabeçalhos (exemplo abaixo).
6. **Dados legais** — preencha `src/config/empresa.ts` e peça revisão jurídica dos textos em `src/components/LegalContent.tsx`. Preencha `public/.well-known/security.txt`.
7. **Monitor externo** (UptimeRobot/Better Stack) em `/health` e `/health/ready`.
8. **Mais de uma instância da API?** Defina `RATE_LIMIT_STORE=mongo` (contador compartilhado).
9. **Primeiro acesso** — crie sua conta pelo cadastro normal (o seed é bloqueado em produção).

### Nginx (frontend estático)
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://api.SEUDOMINIO.com https://images.pexels.com; connect-src 'self' https://api.SEUDOMINIO.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header Referrer-Policy no-referrer always;
location / { try_files $uri /index.html; }
```

## 3. Checklist antes de divulgar

- [ ] `npm install` nas duas pastas, `npm test` (backend) e `npm run build` (front) passam
- [ ] `npm audit --omit=dev` sem vulnerabilidades altas/críticas
- [ ] Variáveis de produção configuradas; servidor sobe sem avisos
- [ ] HTTPS ativo nos dois domínios; http redireciona para https
- [ ] Fluxo completo testado **em produção** com e-mails reais: cadastro de barbearia → confirmar e-mail → cadastro de cliente → agendar → e-mails recebidos (fora do spam) → chat → esqueci a senha → excluir conta
- [ ] **Teste de isolamento**: com duas barbearias, confirme que a barbearia A recebe 403/404 ao tentar ler/alterar agendamentos, conversas, serviços e barbeiros da B (troque os IDs nas chamadas)
- [ ] Backup do MongoDB ligado **e restauração testada pelo menos uma vez**
- [ ] Alertas chegando (derrube o banco em homologação e veja o e-mail)
- [ ] Termos/Privacidade preenchidos e revisados; aviso vermelho sumiu
- [ ] Conta de dono com senha forte (idealmente gerenciador de senhas)

## 4. Operação

- **Segredo vazou?** Troque `JWT_SECRET` (invalida todos os access tokens em ≤ 15 min) e apague as sessões: `db.sessaos.deleteMany({})` (todos precisarão logar de novo).
- **Usuário comprometido?** Redefinir a senha dele já revoga todas as sessões.
- **Alertas de segurança** — filtre os logs por `seguranca:` e alerte em picos de `login_falhou`, `rate_limit`, `refresh_token_reutilizado`, `cors_bloqueado`.
- **Atualizações** — aceite os PRs semanais do Dependabot (rode o CI antes de mesclar).
- **Contas antigas** (criadas antes da verificação de e-mail) ficam "não verificadas" até clicarem no link; para liberar em massa: `db.clientes.updateMany({}, {$set:{emailVerificado:true}})` — só se você confia nelas.

## 5. Escalabilidade — o que esperar

- A API é *stateless* (sessões e contadores no MongoDB): pode rodar em N instâncias atrás de um balanceador.
- O chat usa *polling* de 5 s — ok para centenas de conversas simultâneas; acima disso, migre para WebSocket/SSE.
- Imagens ficam no MongoDB (≤ 700 KB cada) — ok para começar; com muitas barbearias, migre para S3/Cloudinary + CDN.
- Existem tetos de listagem (200 barbearias, 2000 agendamentos por painel). Para volumes maiores, adicione paginação.

## 6. O que NÃO está coberto (decida conscientemente)

- **CAPTCHA** no cadastro (recomendado: Cloudflare Turnstile) contra cadastros em massa por robôs.
- **Pagamentos/assinaturas** — não há cobrança de planos; um SaaS comercial precisa disso (Stripe/Asaas/Mercado Pago).
- **2FA** para donos de barbearia.
- **Vários usuários por barbearia** (funcionários com permissões) — hoje há 1 administrador por barbearia.
- **Exclusão de conta de barbearia** (só a de cliente está implementada) e política de retenção/anonimização automática.
- **Teste de invasão (pentest)** independente e revisão jurídica completa da LGPD.
- **WAF/CDN** (Cloudflare) na frente — fortemente recomendado contra DDoS.
