# SAD Condomínios — Sistema de Apoio à Decisão Financeira

> **Projeto acadêmico — UFBA**  
> Sistema para gestão financeira de condomínios com dashboards, ML e simulações.

---

## Visão Geral

O **SAD Condomínios** é um sistema web full-stack que fornece ao síndico uma visão
completa da saúde financeira do condomínio através de:

- **Dashboards** com KPIs e gráficos interativos
- **Business Intelligence (BI)** com análise multidimensional
- **Machine Learning** implementado do zero (Regressão, K-Means, K-NN, Z-Score)
- **Simulação** de cenários (taxa condominial e rateio)
- **Orçamento** com controle de versões e comparativo realizado vs orçado
- **Exportação** de relatórios em PDF e CSV

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Monorepo | Turborepo (npm workspaces) |
| Frontend | Next.js 14+ (App Router) + Tailwind CSS |
| Backend | Fastify + TypeScript |
| Banco | SQLite via Prisma ORM |
| Gráficos | Recharts |
| PDF | pdf-lib |
| ML | Algoritmos implementados do zero em TypeScript (`@sindico/ml-core`) |

---

## Estrutura do Monorepo

```
sindico-data/
├── apps/
│   ├── web/              # Next.js (frontend) — porta 3000
│   │   ├── src/
│   │   │   ├── app/      # Páginas (App Router)
│   │   │   ├── components/  # Componentes reutilizáveis
│   │   │   └── lib/api.ts   # API client
│   │   └── package.json
│   └── api/              # Fastify (backend) — porta 3001
│       ├── src/
│       │   ├── routes/   # Rotas da API
│       │   ├── lib/      # Utilitários (db, bi, relatorio)
│       │   └── server.ts # Entry point
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
├── packages/
│   ├── shared/           # Tipos e DTOs compartilhados
│   └── ml-core/          # Algoritmos ML puros (sem dependências)
├── context-os/           # Documentação do projeto
├── turbo.json
└── package.json
```

---

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento (API + Web simultaneamente)
npm run dev

# OU iniciar separadamente:
cd apps/api && npx tsx src/server.ts   # API em :3001
cd apps/web && npm run dev              # Web em :3000

# Popular banco com dados sintéticos (2 anos)
cd apps/api && npx tsx src/seed.ts
```

> **Pré-requisitos:** Node.js >= 18, npm >= 10

---

## Banco de Dados

### Modelo Entidade-Relacionamento

```
Unidade (1) ──→ (N) Receita
Despesa (avulsa, sem FK)
OrcamentoLote (1) ──→ (N) Orcamento
```

### Schema

- **Unidade**: `id, numero, bloco, proprietario, email`
- **Receita**: `id, descricao, valor, dataVencimento, dataPagamento?, unidadeId, categoria, status`
- **Despesa**: `id, descricao, valor, data, categoria, fornecedor`
- **OrcamentoLote**: `id, versao, dataCriacao, descricao?`
- **Orcamento**: `id, categoria, mes, ano, valor, loteId`

---

## API — Endpoints

### CRUD Base

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/unidades` | Lista unidades |
| POST | `/api/unidades` | Cria unidade |
| PUT | `/api/unidades/:id` | Atualiza unidade |
| DELETE | `/api/unidades/:id` | Remove unidade |
| GET | `/api/receitas` | Lista receitas (filtros: `unidadeId`, `status`, `mesInicio`, `mesFim`) |
| POST | `/api/receitas` | Cria receita |
| PUT | `/api/receitas/:id` | Atualiza receita |
| DELETE | `/api/receitas/:id` | Remove receita |
| GET | `/api/despesas` | Lista despesas (filtros: `categoria`, `fornecedor`, `mesInicio`, `mesFim`) |
| POST | `/api/despesas` | Cria despesa |
| PUT | `/api/despesas/:id` | Atualiza despesa |
| DELETE | `/api/despesas/:id` | Remove despesa |

### Dashboard

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/dashboard` | KPIs + evolução mensal (filtros: `mesInicio`, `mesFim`) |

### Business Intelligence

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/bi` | BI completo (KPIs, evolução, composição, fornecedores, blocos, saldo acumulado) |

### Exportação

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/export?formato=pdf\|csv` | Relatório executivo em PDF ou CSV |

### Orçamento

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/orcamentos` | Orçamento vigente (`?ano=`) |
| GET | `/api/orcamentos/lotes` | Histórico de versões |
| GET | `/api/orcamentos/lotes/:id` | Versão específica |
| POST | `/api/orcamentos` | Cria novo lote de orçamento |

### Machine Learning

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/ml/previsao-despesas` | Regressão linear para prever despesas |
| GET | `/api/ml/previsao-fluxo-caixa` | Regressão em receitas + despesas, projeta saldo 6 meses |
| GET | `/api/ml/perfil-unidades` | K-Means clustering por perfil de pagamento |
| GET | `/api/ml/risco-inadimplencia` | K-NN classificação de risco |
| GET | `/api/ml/anomalias-despesas` | Z-Score para detecção de anomalias |
| POST | `/api/ml/simulacao-taxa` | Simula ajuste de taxa condominial |
| POST | `/api/ml/simulacao-rateio` | Simula rateio por unidade ou fração ideal |

---

## Funcionalidades

### Dashboard
KPIs principais (saldo, receitas, despesas, inadimplência) com gráfico de evolução mensal.

### BI (Business Intelligence)
6 KPIs com tendência, 6 gráficos interativos, filtros por período/bloco/categoria/status, widgets ML (K-Means + K-NN).

### Receitas / Despesas / Unidades
Páginas com filtros dinâmicos, tabelas ordenáveis, CRUD completo (criar/editar/excluir via modal).

### Inadimplência
Classificação de risco por unidade usando K-NN, tabela com pontualidade e atraso médio.

### Análise Preditiva
Regressão linear para previsão de despesas futuras com gráfico real vs previsto.

### Anomalias
Detecção de despesas anômalas via z-score (global e por categoria), gráfico de dispersão.

### Simulação
Slider de ajuste de taxa (-50% a +50%) com projeção de saldo; rateio por unidade ou fração ideal.

### Orçamento
Tabela editável 6 categorias × 12 meses, salvamento versionado por lote, comparativo orçado vs realizado no BI.

### Exportação
PDF com tabelas formatadas e CSV compatível com Excel (BOM + CRLF).

---

## Machine Learning

Todos os algoritmos são implementados **do zero em TypeScript** no pacote `@sindico/ml-core`,
sem dependências de bibliotecas ML externas.

| Algoritmo | Técnica | Aplicação |
|-----------|---------|-----------|
| Regressão Linear | Gradiente descendente (batch) | Previsão de despesas e fluxo de caixa |
| K-Means | Inicialização Forgy, distância euclidiana | Perfil de pagamento das unidades |
| K-NN | Votação majoritária, Leave-One-Out | Risco de inadimplência |
| Z-Score | | Despesas anômalas (global e por categoria) |
| Simulação | Cálculo financeiro direto | Ajuste de taxa e rateio |

---

## Páginas

### Dashboard
![Dashboard](context-os/screenshots/dashboard.png)

### BI
![BI](context-os/screenshots/bi.png)

### Receitas
![Receitas](context-os/screenshots/receitas.png)

### Despesas
![Despesas](context-os/screenshots/despesas.png)

### Unidades
![Unidades](context-os/screenshots/unidades.png)

### Inadimplência
![Inadimplência](context-os/screenshots/inadimplencia.png)

### Análise Preditiva
![Análise Preditiva](context-os/screenshots/analise-preditiva.png)

### Anomalias
![Anomalias](context-os/screenshots/anomalias.png)

### Simulação
![Simulação](context-os/screenshots/simulacao.png)

### Orçamento
![Orçamento](context-os/screenshots/orcamentos.png)

---

## Dados do Seed

O seed gera dados sintéticos para 2 anos (2024-2025):

- **10 unidades** em 3 blocos (A, B, C)
- **240 receitas** (condomínio) com comportamento variado por unidade
- **144 despesas** em 6 categorias (água, luz, folha, limpeza, manutenção, segurança)
- Sazonalidade (verão +15% em contas), inflação anual (~5-6%), manutenções eventuais

---

## Licença

Projeto acadêmico — UFBA
