# BarberSync — Sistema SaaS Multi-Barbearias

Plataforma centralizada onde múltiplas barbearias podem se cadastrar e gerenciar seus próprios negócios. Os clientes acessam o site, escolhem a barbearia/serviços e realizam agendamentos com barbeiros disponíveis em tempo real.

## Arquitetura do Projeto

```
project/
├── src/                          # Frontend (React + Vite + TypeScript + Tailwind)
│   ├── components/               # Componentes reutilizáveis
│   ├── context/                  # Context API (estado global)
│   ├── data/                     # Dados mock para demonstração
│   ├── pages/                    # Páginas do sistema
│   │   ├── HomePage.tsx          # Landing page
│   │   ├── BarbeariasPage.tsx    # Lista de barbearias
│   │   ├── BarbeariaDetailPage.tsx # Detalhe + catálogo de serviços
│   │   ├── AgendamentoServicoPage.tsx   # Passo 1: escolha do serviço
│   │   ├── AgendamentoBarbeiroPage.tsx  # Passo 2: barbeiro + horário
│   │   ├── AgendamentoConfirmacaoPage.tsx # Passo 3: dados do cliente
│   │   ├── AgendamentoSucessoPage.tsx   # Confirmação
│   │   └── admin/                # Painel administrativo
│   │       ├── AdminLoginPage.tsx
│   │       ├── AdminDashboardPage.tsx
│   │       ├── AdminBarbeariaPage.tsx
│   │       ├── AdminBarbeirosPage.tsx
│   │       ├── AdminServicosPage.tsx
│   │       └── AdminAgendaPage.tsx
│   ├── types/                    # Tipos TypeScript
│   └── utils/                    # Funções utilitárias
│
├── backend/                      # Backend (Node.js + Express + MongoDB)
│   ├── server.js                 # Entry point
│   ├── app.js                    # Configuração do Express
│   ├── seed.js                   # População do banco (dados de demonstração)
│   ├── models/                   # Schemas Mongoose
│   │   ├── Barbearia.js
│   │   ├── UsuarioAdmin.js
│   │   ├── Barbeiro.js
│   │   ├── Servico.js
│   │   └── Agendamento.js
│   ├── controllers/              # Lógica de negócio
│   │   ├── barbeariaController.js
│   │   ├── authController.js
│   │   ├── barbeiroController.js  # Inclui busca de disponibilidade
│   │   ├── servicoController.js
│   │   └── agendamentoController.js
│   ├── routes/                   # Rotas da API REST
│   │   ├── barbeariaRoutes.js
│   │   ├── authRoutes.js
│   │   ├── barbeiroRoutes.js
│   │   ├── servicoRoutes.js
│   │   └── agendamentoRoutes.js
│   └── middleware/
│       └── auth.js               # Autenticação JWT
│
├── package.json                  # Dependências do frontend
└── README.md
```

## Stack Tecnológica

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Lucide React (ícones)
- **Backend:** Node.js + Express.js
- **Banco de Dados:** MongoDB + Mongoose
- **Autenticação:** JWT (JSON Web Tokens) + bcryptjs

## Modelos de Dados (Schemas)

### Barbearia
- nome, endereco, telefone, email
- horarioAbertura, horarioFechamento, diasFuncionamento[]
- descricao, imagemUrl

### UsuarioAdmin
- nome, email, senha (hash bcrypt)
- barbeariaId (referência)

### Barbeiro
- nome, barbeariaId (referência)
- especialidades[], horarioInicio, horarioFim
- diasFolga[], ativo

### Servico
- nome, descricao, preco, duracaoMinutos
- barbeariaId (referência), categoria

### Agendamento
- barbeariaId, barbeiroId, servicoId (referências)
- clienteNome, clienteTelefone, clienteEmail
- data, horario, status (pendente|confirmado|concluido|cancelado)

## Como Rodar

### Frontend (demo interativo)

```bash
npm install
npm run dev
```

O frontend agora consome a API real. Copie `.env.example` para `.env` e ajuste `VITE_API_URL`
(padrão: `http://localhost:5000/api`). **O backend precisa estar rodando** para o site funcionar.

### Backend (API completa)

```bash
cd backend
cp .env.example .env    # configure sua URI do MongoDB
npm install
npm run seed            # popula o banco com dados de demonstração
npm run dev             # inicia o servidor
```

## Endpoints da API

### Autenticação
- `POST /api/auth/cadastrar` — Cadastra nova barbearia + admin
- `POST /api/auth/login` — Login do admin (retorna JWT)
- `GET /api/auth/perfil` — Dados do admin logado (protegido)
- `POST /api/auth/esqueci-senha` — Envia e-mail com link de redefinição (sempre responde 200)
- `POST /api/auth/redefinir-senha` — Define nova senha a partir do token do e-mail
- `POST /api/auth/alterar-senha` — Troca a senha estando logado (protegido)

### Sessão (cookie httpOnly) e verificação de e-mail
- `POST /api/auth/refresh` · `POST /api/clientes/refresh` — Renova o access token a partir do cookie (rotação do refresh token)
- `POST /api/auth/logout` · `POST /api/clientes/logout` — Revoga a sessão
- `POST /api/auth/verificar-email` · `POST /api/clientes/verificar-email` — Confirma o e-mail com o token do link
- `POST /api/auth/reenviar-verificacao` · `POST /api/clientes/reenviar-verificacao` — Reenvia o link (logado)
- `GET /api/clientes/meus-dados` · `DELETE /api/clientes/conta` — LGPD: exportar dados / excluir conta

### Clientes (quem agenda)
- `POST /api/clientes/cadastrar` — Cria conta de cliente (nome, e-mail, telefone, senha) e já loga
- `POST /api/clientes/login` — Login do cliente (retorna JWT)
- `GET /api/clientes/perfil` · `PUT /api/clientes/perfil` — Dados da conta; edita nome/telefone (protegido)
- `GET /api/clientes/agendamentos` — Histórico do cliente logado, do mais recente ao mais antigo (protegido)
- `POST /api/clientes/esqueci-senha` · `POST /api/clientes/redefinir-senha` — Recuperação de senha por e-mail

### Chat (cliente ↔ barbearia)
- `GET /api/chat/conversas` · `POST /api/chat/conversas` — Conversas do cliente / abre a conversa com uma barbearia (cliente logado)
- `GET|POST /api/chat/conversas/:id/mensagens` — Lê (`?depois=ISO` para só as novas) / envia (cliente logado)
- `GET /api/chat/admin/conversas` · `GET /api/chat/admin/nao-lidas` — Caixa de entrada e contador de não lidas (painel)
- `GET|POST /api/chat/admin/conversas/:id/mensagens` — Lê / responde (painel; só conversas da própria barbearia)

### Barbearias
- `GET /api/barbearias` — Lista todas
- `GET /api/barbearias/:id` — Detalhe de uma
- `PUT /api/barbearias/:id` — Atualiza (protegido; só a **própria** barbearia)
- `PUT /api/barbearias/:id/imagem` · `GET /api/barbearias/:id/imagem` — Envia a foto de capa (protegido) / serve a foto (pública)

### Serviços
- `GET /api/servicos/barbearia/:barbeariaId` — Lista por barbearia
- `POST /api/servicos` — Cria (protegido)
- `PUT /api/servicos/:id` — Atualiza (protegido)
- `DELETE /api/servicos/:id` — Remove (protegido)

### Barbeiros
- `GET /api/barbeiros/barbearia/:barbeariaId` — Lista por barbearia
- `GET /api/barbeiros/disponiveis?barbeariaId=&servicoId=&data=&horario=` — **Rota inteligente**: retorna apenas barbeiros disponíveis
- `GET /api/barbeiros/horarios-disponiveis?barbeariaId=&barbeiroId=&servicoId=&data=` — Horários livres de um barbeiro
- `POST /api/barbeiros` — Cria (protegido)
- `PUT /api/barbeiros/:id` — Atualiza (protegido)
- `PUT /api/barbeiros/:id/foto` · `GET /api/barbeiros/:id/foto` — Foto de perfil do barbeiro (protegido) / serve a foto (pública)
- `DELETE /api/barbeiros/:id` — Desativa (protegido)

### Agendamentos
- `POST /api/agendamentos` — Cria (**exige cliente logado**; nome/telefone/e-mail vêm da conta; verifica conflitos de horário)
- `GET /api/agendamentos/barbearia/:barbeariaId` — Lista por barbearia (protegido; só a própria)
- `GET /api/agendamentos/:id` — Detalhe (protegido; só da própria barbearia)
- `PATCH /api/agendamentos/:id/status` — Atualiza status (protegido; avisa o cliente por e-mail ao cancelar/concluir)

### Saúde / monitoramento
- `GET /health` — O processo está de pé? (para UptimeRobot etc.)
- `GET /health/ready` — Processo + MongoDB ok? (503 se o banco caiu)
- `GET /health/details` — Uptime, memória, contadores, últimos erros, SMTP (header `x-health-token`)

## Contas de Demonstração

Criadas por `npm run seed` (somente desenvolvimento — **nunca rode o seed em produção**, ele apaga o banco):

| E-mail | Senha | Barbearia |
|--------|-------|-----------|
| admin@navalhadeouro.com | demo1234 | Navalha de Ouro |
| admin@studiocut.com | demo1234 | Studio Cut Premium |
| admin@irmaossteel.com | demo1234 | Irmãos Steel |

Cliente de demonstração: `cliente@demo.com` / `demo1234` (já com histórico de agendamentos). O seed é **bloqueado** com `NODE_ENV=production`.

Barbearias novas se cadastram em **"Sou Dono de Barbearia" → "Cadastre sua barbearia"**.

## Lógica de Disponibilidade

A rota `GET /api/barbeiros/disponiveis` cruza:
1. Dias de folga do barbeiro
2. Dias de funcionamento da barbearia
3. Expediente do barbeiro vs. horário solicitado
4. Conflitos com agendamentos já confirmados/pendentes

Um barbeiro é retornado como disponível apenas se o serviço completo (início + duração) couber dentro do expediente e não sobrepor nenhum agendamento existente.


> 🚀 **Indo para produção?** Leia **[docs/PRODUCAO.md](docs/PRODUCAO.md)** — segurança implementada, passo a passo de deploy, checklist e o que ainda não está coberto.

## Autenticação e isolamento de dados

- Login com e-mail + senha (bcrypt, custo 12). Access token de 15 min em memória + refresh token rotativo em cookie `httpOnly`. Senha: mínimo 8 caracteres com letras e números (e fora da lista de senhas comuns).
- Cada usuário pertence a **uma barbearia**. Todas as rotas protegidas usam `req.barbeariaId` (vindo do token),
  nunca um ID enviado pelo cliente, e o middleware `exigirMinhaBarbearia` bloqueia (403) acesso a outra barbearia.
- Trocar/redefinir a senha invalida os tokens antigos.
- Rate limit: por IP e por e-mail-alvo no login, mais limites para cadastro, agendamento, chat e upload (veja `backend/middleware/rateLimit.js`).
- O front não guarda token em `localStorage`; a sessão é restaurada pelo cookie `httpOnly` ao abrir o site.
- Agendar e conversar exigem **e-mail confirmado**.

## Contas de cliente

- Para agendar, o cliente precisa **entrar ou criar uma conta** (nome, telefone, e-mail, senha). Navegar pelas barbearias continua livre.
- Ao clicar em "Agendar" sem estar logado, aparece a tela de acesso e, depois de entrar, ele cai direto na tela que queria.
- O botão **"Entrar"** fica no topo da home, da lista e da página de cada barbearia; logado, vira um menu com *Meus agendamentos* e *Sair*.
- Cada agendamento fica vinculado à conta (`clienteId`). Em **Meus agendamentos** o cliente vê os próximos e o histórico, pode corrigir nome/telefone e agendar novamente na mesma barbearia.
- As sessões de cliente e de dono de barbearia são separadas: o token de um não abre as rotas do outro.

## E-mails transacionais

Enviados via SMTP (Nodemailer) — funciona com Resend, Brevo, Mailgun, Amazon SES, Gmail (senha de app) etc.
Configure `SMTP_*` e `EMAIL_FROM` em `backend/.env`. Sem `SMTP_HOST`, os e-mails só são impressos no console.

| Evento | Destinatário |
|--------|--------------|
| Barbearia cadastrada | Dono |
| Conta de cliente criada | Cliente |
| Agendamento criado | Cliente (se informou e-mail) + e-mail da barbearia |
| Agendamento cancelado / concluído | Cliente |
| Esqueci a senha / senha alterada | Dono ou cliente |
| Alertas de monitoramento | `ALERT_EMAILS` |

Falha de e-mail **nunca** impede um agendamento. Teste com: `cd backend && npm run test:email -- voce@email.com`

> Em produção, configure SPF/DKIM do seu domínio no provedor de e-mail, senão as mensagens caem no spam.

## Monitoramento e alertas

Dentro da API (`backend/services/monitorService.js`), você recebe **e-mail e/ou webhook (Discord/Slack)** quando:

- o MongoDB cai (e quando volta);
- ocorre erro 500 em alguma rota, ou um pico de 10+ erros 5xx em 1 minuto;
- o processo cai por exceção não tratada / promise rejeitada;
- a memória fica acima de 92% do heap;
- o servidor não consegue nem iniciar (banco inacessível no boot).

Alertas repetidos do mesmo tipo respeitam um intervalo (`ALERT_COOLDOWN_MIN`, padrão 15 min).

**Importante:** um servidor que caiu por completo não consegue avisar ninguém. Por isso, além do que está no código,
configure um monitor **externo** gratuito (UptimeRobot, Better Stack, Uptime Kuma...) apontando para:

1. `https://SUA-API/health` a cada 1–5 min (site no ar?)
2. `https://SUA-API/health/ready` (banco ok?)

e use um gerenciador que reinicie o processo ao cair (PM2, Docker `restart: always`, Render/Railway etc.).

## Variáveis de ambiente

Veja `backend/.env.example` (servidor, banco, JWT, SMTP, alertas) e `.env.example` na raiz (URL da API para o front).
Em produção defina `NODE_ENV=production`, um `JWT_SECRET` forte e `CLIENT_URL` com o domínio exato do front (CORS).


## Imagens

| O quê | Onde alterar |
|-------|--------------|
| **Fotos em destaque da página inicial (home)** | Edite a lista `HERO_IMAGES` em **`src/config/siteImages.ts`** (links ou arquivos em `public/hero/`). Elas se alternam sozinhas; o tempo de cada uma está em `HERO_INTERVALO_MS`. |
| **Foto principal (capa) de cada barbearia** | Pelo próprio dono: **Painel → Minha Barbearia → "Foto principal (capa)"**. |
| **Foto de perfil dos barbeiros** | Pelo dono: **Painel → Barbeiros** (ícone de câmera no avatar, ou ao cadastrar). O cliente vê na página da barbearia e na escolha do barbeiro. |

As fotos enviadas pelos usuários são redimensionadas e comprimidas no navegador (limite de 700 KB no servidor, apenas JPG/PNG/WebP,
com checagem da assinatura do arquivo) e guardadas no MongoDB; são servidas pela API com cache. Para muito volume, o próximo passo
é migrar para um storage de objetos (S3/Cloudinary).

## Chat interno

- O cliente (logado) abre a conversa em **"Conversar com a barbearia"** (página da barbearia) ou em **Menu → Mensagens**.
- A barbearia responde em **Painel → Mensagens** (com contador de não lidas no menu). A tela se atualiza sozinha a cada 5 s.
- Cada conversa é única por par cliente/barbearia, e uma barbearia só enxerga as próprias conversas.
- A barbearia recebe um e-mail na primeira mensagem não lida de cada conversa (sem spam a cada mensagem).

## WhatsApp no painel

Ícone verde do WhatsApp ao lado de cada agendamento (Dashboard e Agenda) e no cabeçalho das conversas. Ao clicar, abre
`https://wa.me/<número do cliente>` (WhatsApp Web/App) **sem nenhuma mensagem automática** — só abre a conversa para o lojista
escrever. Números sem DDI são tratados como Brasil (+55).
