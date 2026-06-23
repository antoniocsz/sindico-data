# ADR 002: Backend com Fastify

## Contexto

Precisamos de um backend HTTP para servir dados financeiros e resultados dos modelos ML para o frontend Next.js.

## Decisão

Usar **Fastify** como framework HTTP.

## Justificativa

- Mais rápido que Express em benchmarks
- Schema validation embutido (via JSON Schema ou TypeBox)
- Tipagem forte com TypeScript
- Ecossistema de plugins maduro (CORS, logging, etc.)
- API routes assíncronas por padrão

## Consequências

- Backend separado em `apps/api`
- Comunicação com frontend via REST JSON
- Prisma como ORM para SQLite
- ML roda no backend (Node.js), frontend só consome resultados
