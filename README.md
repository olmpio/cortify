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

O frontend roda com dados mock em memória — não precisa de MongoDB para a demonstração.

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

### Barbearias
- `GET /api/barbearias` — Lista todas
- `GET /api/barbearias/:id` — Detalhe de uma
- `PUT /api/barbearias/:id` — Atualiza (protegido)

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
- `DELETE /api/barbeiros/:id` — Desativa (protegido)

### Agendamentos
- `POST /api/agendamentos` — Cria (verifica conflitos de horário)
- `GET /api/agendamentos/barbearia/:barbeariaId` — Lista por barbearia (protegido)
- `GET /api/agendamentos/:id` — Detalhe
- `PATCH /api/agendamentos/:id/status` — Atualiza status (protegido)

## Contas de Demonstração

| E-mail | Senha | Barbearia |
|--------|-------|-----------|
| admin@navalhadeouro.com | 123456 | Navalha de Ouro |
| admin@studiocut.com | 123456 | Studio Cut Premium |
| admin@irmaossteel.com | 123456 | Irmãos Steel |

## Lógica de Disponibilidade

A rota `GET /api/barbeiros/disponiveis` cruza:
1. Dias de folga do barbeiro
2. Dias de funcionamento da barbearia
3. Expediente do barbeiro vs. horário solicitado
4. Conflitos com agendamentos já confirmados/pendentes

Um barbeiro é retornado como disponível apenas se o serviço completo (início + duração) couber dentro do expediente e não sobrepor nenhum agendamento existente.
