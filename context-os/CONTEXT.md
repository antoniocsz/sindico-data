# SAD Financeiro para Condomínios

**Sistema de Apoio à Decisão** para gestão financeira de condomínios.

## Objetivo

Fornecer ao síndico uma visão clara da saúde financeira do condomínio através de dashboards, indicadores e modelos preditivos, auxiliando na tomada de decisões.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Monorepo | Turborepo |
| Frontend | Next.js 14+ (App Router) |
| Backend | Fastify + TypeScript |
| Banco | SQLite via Prisma ORM |
| Gráficos | Recharts |
| Estilo | Tailwind CSS |
| ML | Algoritmos implementados do zero em TypeScript |

## Estrutura do Monorepo

```
sindico-data/
├── apps/
│   ├── web/        # Next.js (frontend)
│   └── api/        # Fastify (backend)
├── packages/
│   ├── shared/     # Tipos e DTOs compartilhados
│   └── ml-core/    # Algoritmos ML puros
├── context-os/     # Documentação e memória do projeto
├── turbo.json
└── package.json
```

## Funcionalidades da Interface

- **Filtros dinâmicos** em todas as páginas (período, status, categoria, bloco, perfil, risco)
- Filtros via query string na API, refetch automático no frontend ao alterar

## Técnicas de Machine Learning

1. **Regressão Linear** — Previsão de despesas futuras com base em série histórica
2. **K-Means** — Agrupamento de unidades por perfil de pagamento
3. **K-NN** — Classificação de risco de inadimplência por unidade
4. **Z-Score Anomaly Detection** — Detecção de despesas anômalas (global e por categoria)
5. **Simulação Financeira** — Projeção de cenários (taxa condominial e rateio)

## Decision Records

Ver [ADR](./ADR/) para decisões arquiteturais documentadas.

## Status do Projeto

Ver [roadmap.md](./roadmap.md) para etapas e progresso.
