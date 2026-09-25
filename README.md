# Tipsfy

Plataforma de gestão para tipsters e canais de apostas, com foco em automação de vendas, controle de assinantes, métricas de performance e operação de sinais esportivos.

## Visão geral

O Tipsfy foi pensado como um painel exclusivo para quem vende conteúdo esportivo premium, com gestão de planos, acompanhamento de receitas, controle de pagamentos e organização do ciclo de assinaturas.

A partir da análise da estrutura do projeto e do fluxo funcional implementado, o produto centraliza as seguintes frentes:

- gestão de planos e assinaturas
- controle de assinantes e status de cobrança
- acompanhamento de tips e performance
- dashboard financeiro com indicadores de MRR e churn
- página pública para apresentação do tipster
- autenticação e onboarding do usuário

## Referência visual

![Dashboard do Tipsfy](src/assets/tipsfy-reference.png)

## Funcionalidades principais

### 1. Dashboard executivo
- visão consolidada de receitas e assinantes
- métricas de MRR, inadimplência e taxa de acerto
- gráfico de evolução da receita
- notificações rápidas de pagamentos e alertas

### 2. Gestão de planos
- criação e manutenção de planos de assinatura
- diferenciação por periodicidade: mensal, trimestral e anual
- acompanhamento de quantidade de assinantes por plano

### 3. CRM de assinantes
- cadastro e status do cliente
- controle de renovação e cobrança
- segmentação por nível de assinatura e cobrança pendente

### 4. Gestão de tips
- histórico de sinais esportivos
- status dos resultados: green, red, void ou pending
- indicadores de ROI e taxa de acerto

### 5. Financeiro
- acompanhamento de pagamentos
- monitoramento de reembolsos, falhas e eventos financeiros
- visão do ciclo de monetização da operação

### 6. Página pública do tipster
- apresentação da marca e do perfil do tipster
- canal público para conversão de leads e assinaturas

## Stack técnico

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth
- Vitest
- Recharts

## Arquitetura do projeto

A base do projeto segue uma organização de camadas com foco em domínio, casos de uso, infraestrutura e interface:

```text
src/
├── app/                     # rotas e páginas do Next.js
├── application/            # casos de uso e portas
├── domain/                 # entidades, value objects e erros
├── infrastructure/         # Prisma, autenticação, integrações
├── interfaces/             # HTTP, web e componentes visuais
├── assets/                 # imagens e referências visuais
├── screens/                # telas do painel
├── types/                  # tipos globais
└── tests/                  # testes de domínio e aplicação
```

## Modelo de negócio

O produto é voltado para emissoras/tipsters que monetizam sinais esportivos por assinatura. O ecossistema principal gira em torno de:

- criação de planos escaláveis
- retenção de assinantes
- aumento de performance dos sinais
- redução de churn por controle financeiro e cobrança

## Requisitos para execução

- Node.js 20+
- pnpm
- PostgreSQL
- variáveis de ambiente configuradas

## Configuração local

1. Instale as dependências:

```bash
pnpm install
```

2. Configure o banco de dados e as variáveis de ambiente:

```bash
cp .env.example .env
```

3. Gere o cliente Prisma:

```bash
npx prisma generate
```

4. Inicie a aplicação em modo de desenvolvimento:

```bash
pnpm dev
```

A aplicação ficará disponível em:

```bash
http://localhost:3000
```

## Variáveis de ambiente

Arquivo base em `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tipsfy"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Scripts

```bash
pnpm dev      # inicia o ambiente de desenvolvimento
pnpm build    # gera build de produção
pnpm start    # inicia a build pronta
pnpm test     # executa os testes com Vitest
```

## Status do projeto

O projeto se encontra em uma etapa inicial de estruturação funcional, com foco em:

- UX e dashboard premium
- fluxos de gestão de assinatura
- modelagem de domínio e regras de negócio
- base para evolução com integração real de pagamentos, autenticação e banco de dados

## Próximos passos sugeridos

- integrar PostgreSQL em produção e migrações com Prisma
- conectar autenticação real do NextAuth
- criar fluxo de checkout e pagamentos
- automatizar disparos via Telegram/WhatsApp
- consolidar painel de relatórios e exportações
- evoluir para módulos de afiliados, bônus e campanhas

## Observação

Este README foi estruturado com base na análise da aplicação e da referência visual disponível no projeto, com foco em apresentar a proposta do produto de forma clara e objetiva.
