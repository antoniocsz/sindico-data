# ADR 001: Monorepo com Turborepo

## Contexto

Precisamos organizar um projeto com frontend (Next.js) e backend (Fastify) compartilhando tipos e algoritmos ML, com dependências entre si.

## Decisão

Usar **Turborepo** como orquestrador de monorepo com npm workspaces.

## Justificativa

- Criação pela Vercel (mesma do Next.js) — compatibilidade nativa
- Cache inteligente de builds
- Task orchestration (build, dev, lint em ordem)
- Zero configuração para casos simples
- Suporte nativo a npm/pnpm/yarn workspaces

## Consequências

- Estrutura `apps/` para aplicações e `packages/` para bibliotecas compartilhadas
- Dependências entre pacotes gerenciadas via workspace protocol (`@sindico/*`)
- Build em ordem: `shared` → `ml-core` → `api` → `web`
