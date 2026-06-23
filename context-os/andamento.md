# Andamento do Projeto

## 2026-06-22 — Sessão 1: Estrutura completa do projeto

### Atingido

- Criada estrutura `context-os/` com documentação base
- Definido roadmap com 12 etapas
- Planejado modelo de dados (Unidade, Receita, Despesa)
- ADRs registrados (monorepo, Fastify, ML do zero)
- Documentação detalhada dos 3 algoritmos ML
- Setup do monorepo com Turborepo (root package.json, turbo.json, tsconfig.base.json)
- `@sindico/shared` — tipos e DTOs (Unidade, Receita, Despesa, DashboardKPI, etc.)
- `@sindico/api` — Fastify + Prisma + SQLite com seed (10 unidades, 60 receitas, 36 despesas)
- `@sindico/ml-core` — Regressão Linear (gradiente descendente), K-Means (Forgy init), K-NN (votação majoritária + LOO) + métricas (R², RMSE, Silhueta, Acurácia)
- API routes CRUD: `/api/unidades`, `/api/receitas`, `/api/despesas`
- API routes ML: `/api/ml/previsao-despesas`, `/api/ml/perfil-unidades`, `/api/ml/risco-inadimplencia`
- Frontend completo com Dashboard, Receitas, Despesas, Unidades, Inadimplência, Análise Preditiva
- Dashboard com KPIs + gráfico de evolução mensal (Recharts)
- Cluster K-Means com scatter plot e perfil por unidade
- Classificação K-NN com indicador de risco
- Regressão Linear com gráfico real vs previsto

### Testado

- API rodando em `localhost:3001`
- Todos os endpoints respondendo (dashboard, unidades, receitas, despesas, ML)
- Seed executado com dados sintéticos realistas

## 2026-06-22 — Sessão 2: Filtros em todas as páginas

### Atingido

- API routes agora aceitam filtros via query params:
  - `GET /api/receitas`: `unidadeId`, `status` + novos `mesInicio`, `mesFim`
  - `GET /api/despesas`: `categoria` + novos `mesInicio`, `mesFim`, `fornecedor`
  - `GET /api/dashboard`: novos `mesInicio`, `mesFim`
  - `GET /api/ml/previsao-despesas`: novo `categoria`
  - `GET /api/ml/perfil-unidades`: novo `bloco`
  - `GET /api/ml/risco-inadimplencia`: novo `bloco`
- Frontend `api.ts` refatorado para aceitar `params?: Record<string, string | undefined>`
- Barra de filtros adicionada em todas as páginas:
  - **Dashboard**: select de período (3/6/12 meses)
  - **Receitas**: select de status, select de unidade, input month
  - **Despesas**: select de categoria, select de fornecedor, input month
  - **Unidades**: select de bloco, select de perfil
  - **Inadimplência**: select de bloco, select de risco
  - **Análise Preditiva**: select de categoria de despesa
- `useCallback` + `useEffect` com dependências para refetch automático

### Testado

- Todos os endpoints com filtros retornando dados corretos
- Compilação TypeScript sem erros (api, shared, ml-core, web)
- Filtros de bloco e categoria funcionando com dados seed

## 2026-06-22 — Sessão 3: Detecção de Anomalias em Despesas

### Atingido

- `@sindico/ml-core`: novo módulo `anomaly-detection.ts` com algoritmo de z-score (global e por categoria)
- `@sindico/shared`: novo tipo `AnomaliaDespesa`
- `GET /api/ml/anomalias-despesas` com suporte a filtros `categoria`, `mesInicio`, `mesFim`
- Página `/anomalias` com:
  - Cards de resumo (total, anomalias globais, anomalias por categoria, % anômalo)
  - Gráfico de dispersão Recharts (valor vs índice, pontos anômalos em vermelho)
  - Tabela ordenada por |z-score| com badges de anomalia global e por categoria
- Link Anomalias na navegação
- Documentação do algoritmo em `context-os/ml/anomaly-detection.md`

### Testado

- API retorna 3 anomalias globais (folha de pagamento, corretamente identificada como atípica)
- Nenhuma anomalia por categoria nos dados sintéticos (distribuição uniforme dentro de cada categoria — esperado)
- Filtro por categoria funciona corretamente

## 2026-06-22 — Sessão 4: Simulação de Taxa Condominial e Rateio

### Atingido

- `@sindico/ml-core`: novo módulo `simulacao.ts` com duas funções:
  - `simularTaxa()` — recalcula receitas com percentual de ajuste, projeta saldo mês a mês
  - `simularRateio()` — redistribui despesas entre unidades por unidade ou fração ideal (bloco A=1.5x, B=1.0x, C=0.8x)
- `@sindico/shared`: novos tipos `SimulacaoTaxaResult`, `SimulacaoRateioResult`, `SimulacaoRateioItem`
- `POST /api/ml/simulacao-taxa` — body: `{ percentual: number }`
- `POST /api/ml/simulacao-rateio` — body: `{ tipo: 'por_unidade' | 'fracao_ideal' }`
- Página `/simulacao` com duas seções:
  - **Simulação de Taxa**: slider -50% a +50% com debounce de 300ms, cards comparativos (receita/saldo original vs ajustado), gráfico de barras com projeção mensal
  - **Simulação de Rateio**: toggle entre "Por Unidade" e "Fração Ideal", tabela com valor atual, projetado e diferença por unidade
- Link Simulação na navegação

### Testado

- API responde corretamente para ambos endpoints
- +10% na taxa: receita R$19.700 → R$21.670, saldo melhora de -R$100.945 → -R$98.975
- Rateio por unidade: todas pagam R$12.064,54 (divisão igual das despesas totais)
- Rateio por fração ideal: Bloco A (1.5x) paga R$15.600, Bloco B (1.0x) paga R$10.400, Bloco C (0.8x) paga R$8.320

## 2026-06-22 — Sessão 5: Página BI (Business Intelligence)

### Atingido

- `GET /api/bi` — endpoint agregado único que computa KPIs, evolução mensal, composição de despesas, top fornecedores, receitas por bloco e saldo acumulado
- Aceita filtros `mesInicio`, `mesFim`, `bloco`, `categoria`, `status`
- `BiResult` type adicionado em `@sindico/shared`
- `fetchBi()` em `apps/web/src/lib/api.ts`
- Componente `GraficoPizza` (PieChart/Donut com `innerRadius=60`)
- `KpiCard` atualizado com `variacao` e seta indicadora (↑ verde / ↓ vermelho)
- Página `/bi` com:
  - 4 filtros globais: Período (3/6/12/24m + custom), Bloco, Categoria Despesa, Status Receita
  - 6 KPI cards: Saldo Atual, Receitas, Despesas, Inadimplência %, Inadimplência R$, (variações)
  - ComposedChart (barras receitas+despesas + linha saldo)
  - PieChart (composição despesas por categoria, donut)
  - LineChart (evolução inadimplência %)
  - BarChart horizontal (top 5 fornecedores)
  - AreaChart (saldo acumulado)
  - 2 ML widgets reutilizando endpoints existentes: K-Means perfil (filtrado por bloco), K-NN risco
  - Links para páginas de detalhe (Despesas, Inadimplência, etc.)
- Link "BI" na navegação do frontend

### Corrigido

- **Bug de timezone no parsing de datas**: `new Date("2025-06")` é interpretado como UTC midnight pelo Node.js. Em BRT (UTC-3), vira 31/05 21h, então `getMonth()` retornava 4 (Maio) em vez de 5 (Junho), fazendo o upper bound exclusivo da query ignorar todo o mês de Junho. Corrigido com `parseMes()` manual: `new Date(ano, mes - 1, 1)` — sem depender do parser de string do JS.

### Testado

- `mesFim=2025-06` retorna 6 meses (Jan a Jun) — antes só retornava 5
- `mesFim=2025-05` retorna 5 meses (Jan a Mai) — correto
- Compilação TypeScript sem erros em todos os pacotes
- API rodando em `localhost:3001` com BI endpoint funcional

## 2026-06-22 — Sessão 6: Base expandida para 2 anos

### Atingido

- Seed expandido de 6 meses para 24 meses (Jan/2024 a Dez/2025)
- Dados mais realistas: sazonalidade, inflação, comportamento variado por unidade
- Agora: 10 unidades, 240 receitas, 144 despesas

## 2026-06-22 — Sessão 7: Exportação de Relatórios (PDF + CSV)

### Atingido

- Refatorado: lógica de BI extraída para `apps/api/src/lib/bi.ts` (função `computeBi()`)
- `apps/api/src/lib/relatorio.ts`: geração de PDF via `pdf-lib` e CSV com BOM UTF-8
  - PDF: tabelas de KPIs, evolução mensal, composição despesas, top fornecedores, inadimplência
  - CSV: mesmas seções em formato tabular, compatível com Excel (BOM + CRLF)
- `GET /api/export?formato=pdf|csv&mesInicio=...&mesFim=...&bloco=...&categoria=...&status=...`
  - Content-Disposition com nome do arquivo incluindo período
- Botões PDF (vermelho) e CSV (verde) na barra de filtros da página BI
- `biRoutes` simplificado para usar `computeBi()` compartilhado
- `pdf-lib` adicionado como dependência

### Testado

- `formato=csv`: Content-Type `text/csv`, preview mostra cabeçalhos e dados corretos
- `formato=pdf`: Content-Type `application/pdf`, 3722 bytes de exemplo (6 meses)
- Compilação TypeScript sem erros (api + web)

## 2026-06-22 — Sessão 8: Orçamento (modelo + CRUD + frontend + comparativo BI)

### Atingido

- Modelos Prisma `OrcamentoLote` (versão, dataCriação) e `Orcamento` (categoria, mês, ano, valor, loteId)
- Migração aplicada com sucesso
- `GET /api/orcamentos` — orçamento vigente (opcional `?ano=`)
- `GET /api/orcamentos/lotes` — histórico de versões
- `GET /api/orcamentos/lotes/:id` — lote específico
- `POST /api/orcamentos` — cria novo lote (versão auto-incrementada), recebe array de `{ categoria, mes, ano, valor }`
- Página `/orcamentos` no frontend:
  - Tabela editável (6 categorias × 12 meses) com inputs numéricos
  - Totais por categoria e por mês
  - Seletor de ano (2024-2026)
  - Versão atual + botão "Salvar Orçamento"
  - Lista de versões anteriores
- Link "Orçamento" na navegação
- BI page: gráfico "Orçado vs Realizado" (barras agrupadas por mês + total comparativo)
  - Dados mesclados automaticamente: orçado do lote vigente × realizado do período filtrado

## 2026-06-22 — Sessão 9: Previsão de Fluxo de Caixa

### Atingido

- `GET /api/ml/previsao-fluxo-caixa?meses=6` — nova rota ML
  - Regressão linear aplicada às receitas (pagas) e despesas (histórico 24 meses)
  - Projeta 6 meses à frente (configurável até 12)
  - Retorna: meses históricos, receitas/despesas históricas, saldo atual, projeção mês a mês (receita, despesa, saldo), R² de ambos modelos
- BI page: gráfico "Projeção de Fluxo de Caixa" substitui o antigo "Saldo Acumulado"
  - ÁreaChart com duas séries: realizado (azul, últimos 12 meses) + projetado (laranja, tracejado, 6 meses)
  - Indicador de saldo atual e saldo projetado ao final do horizonte
- Rota registrada em `/api/ml/previsao-fluxo-caixa`

## 2026-06-22 — Sessão 10: CRUD no frontend (receitas, despesas, unidades)

### Atingido

- Componente `Modal` reutilizável em `@sindico/web/components/Modal.tsx`
- Página **Receitas**: botão "+ Nova Receita", modal com formulário (descrição, valor, vencimento, pagamento, unidade, status), editar e excluir por linha
- Página **Despesas**: botão "+ Nova Despesa", modal (descrição, valor, data, categoria, fornecedor), editar e excluir por linha
- Página **Unidades**: botão "+ Nova Unidade", modal (número, bloco, proprietário, email), editar e excluir por linha (coluna Email adicionada na tabela)
- Toda operação usa os endpoints CRUD já existentes (POST/PUT/DELETE) sem duplicação de lógica
- Compilação TypeScript sem erros

### Pendente / Melhorias Futuras

- Testes unitários para `@sindico/ml-core`
- Validação aprimorada de formulários (feedback visual de erros)
- Gráfico de linha da regressão com continuidade para o mês previsto
- Melhorar R² do modelo com features mais relevantes (dados reais)
- Responsividade mobile do layout
- CI/CD via GitHub Actions
