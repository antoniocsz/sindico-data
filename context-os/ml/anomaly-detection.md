# Anomaly Detection — Despesas Anômalas

## Problema

Identificar despesas atípicas que fogem do padrão esperado, tanto no contexto geral (condomínio todo) quanto dentro da própria categoria.

## Features

- **Valor da despesa:** Única feature utilizada (valor monetário em R$)

## Algoritmo

**Z-Score:** mede quantos desvios-padrão um valor está distante da média do grupo.

### Fórmula

```
z = (x - μ) / σ
```

Onde:
- `x` = valor da despesa
- `μ` = média do grupo
- `σ` = desvio-padrão do grupo

### Critério de Anomalia

`|z| > 2` → considerado anomalia (~95% dos dados estão dentro de 2σ)

### Duas Análises

1. **Global:** z-score calculado contra a média de **todas** as despesas
2. **Por Categoria:** z-score calculado contra a média apenas das despesas da **mesma categoria**

## Validação

- Limiar configurável (`threshold`, padrão = 2)
- Quanto maior o threshold, menos despesas são marcadas como anômalas (mais conservador)
- Quanto menor, mais sensível a variações normais

## Uso no SAD

- Gráfico de dispersão (valor vs z-score) com pontos anômalos em vermelho
- Tabela ordenada por z-score (mais anômalos primeiro)
- Badge "Anomalia" / "Normal" para análise global e por categoria
- Cards de resumo com total de anomalias detectadas
- Filtro por categoria para análise específica
