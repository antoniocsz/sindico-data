# Regressão Linear — Previsão de Despesas

## Problema

Prever o total de despesas do próximo mês com base no histórico de meses anteriores.

## Features

- Valor total de despesas do mês anterior (t-1)
- Valor total de despesas do mesmo mês no ano anterior (t-12)
- Média móvel dos últimos 3 meses

## Algoritmo

**Regressão Linear Univariada/Multivariada** com Gradiente Descendente.

### Hipótese

```
h(x) = θ₀ + θ₁x₁ + θ₂x₂ + ... + θₙxₙ
```

### Função de Custo (MSE)

```
J(θ) = (1/2m) Σ(h(xⁱ) - yⁱ)²
```

### Atualização dos Parâmetros

```
θⱼ := θⱼ - α * (1/m) Σ(h(xⁱ) - yⁱ) * xⱼⁱ
```

Onde α é a taxa de aprendizado.

### Normalização

Z-score: `x' = (x - μ) / σ`

## Métricas

- **R² (coeficiente de determinação):** proporção da variância explicada pelo modelo
- **RMSE (Root Mean Square Error):** desvio padrão dos resíduos

## Uso no SAD

- Gráfico mostrando despesas reais vs previstas
- Indicador: "Despesa prevista para o próximo mês: R$ XX.XXX"
- Aviso se previsão ultrapassar 110% da média histórica
