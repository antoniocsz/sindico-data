# Simulação Financeira — Taxa Condominial e Rateio

## Problema

Permitir que o síndico simule cenários "e se" para tomada de decisão:
1. **E se a taxa condominial for ajustada em X%?**
2. **E se o rateio for alterado para divisão igual ou por fração ideal?**

## Algoritmo

### simularTaxa(receitas, despesas, percentual)

1. Filtra receitas do tipo "condomínio" (cotas pagas)
2. Aplica o percentual de ajuste: `novoValor = valorOriginal * (1 + percentual/100)`
3. Calcula nova receita total: `receitaOriginal + cotas * (fator - 1)`
4. Projeta saldo mensal: receita ajustada - despesas do período

### simularRateio(despesas, unidades, receitas, tipo)

**Por Unidade:**
- Divide o total de despesas igualmente entre todas as unidades
- `valor = totalDespesas / N unidades`

**Fração Ideal:**
- Cada bloco tem um peso: A = 1.5, B = 1.0, C = 0.8
- `valor = totalDespesas * pesoBloco / somaDosPesos`
- Unidades em blocos maiores pagam proporcionalmente mais

## Métricas de Comparação

- **Valor atual:** média mensal paga por cada unidade (baseado em cotas condominiais quitadas)
- **Valor projetado:** valor proposto pelo novo método de rateio
- **Diferença:** valorProjetado - valorAtual (positivo = aumento, negativo = economia)

## Uso no SAD

- Slider interativo para simular ajuste de -50% a +50%
- Cards comparativos: receita/saldo original vs ajustado
- Gráfico de barras com projeção mensal
- Toggle entre método de rateio com tabela comparativa por unidade
- Cores indicam aumento (vermelho) ou economia (verde) por unidade
