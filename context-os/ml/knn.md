# K-NN — Risco de Inadimplência

## Problema

Classificar cada unidade em baixo/médio/alto risco de se tornar inadimplente.

## Features

- **Pontualidade:** % de pagamentos em dia nos últimos 6 meses
- **Dias médio de atraso:** Média de dias de atraso nos últimos 6 meses
- **Valor médio da cota:** Valor da cota condominial
- **Quantidade de ocorrências:** Número de ocorrências registradas contra a unidade
- **Dias desde o último pagamento:** Dias desde o último pagamento recebido

## Algoritmo

**K-NN (K-Nearest Neighbors)** com K=5.

### Passos

1. Calcular distância euclidiana entre a unidade alvo e todas as unidades treinadas
2. Selecionar os K vizinhos mais próximos
3. Classificar por votação majoritária (classe mais frequente entre os K vizinhos)

### Distância Euclidiana Ponderada (opcional)

Features podem ser ponderadas por importância relativa.

### Validação

**Leave-One-Out (LOO):** Para cada unidade no dataset, usar as demais como treino e a unidade como teste. Ideal para datasets pequenos.

## Classes

| Classe | Rótulo | Critério |
|--------|--------|----------|
| 0 | Baixo Risco | Histórico de pagamento exemplar |
| 1 | Médio Risco | Atrasos ocasionais, mas regulariza |
| 2 | Alto Risco | Inadimplência recorrente |

## Métricas

- **Acurácia:** (VP + VN) / (VP + VN + FP + FN)
- **Matriz de Confusão:** análise detalhada dos erros

## Uso no SAD

- Card para cada unidade com indicador verde/amarelo/vermelho
- Tabela ordenada por risco (alto primeiro)
- Detalhamento: "Esta unidade foi classificada como ALTO RISCO com base em {feature} similar a unidades que se tornaram inadimplentes"
