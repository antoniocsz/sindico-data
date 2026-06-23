# K-Means — Perfil de Unidades

## Problema

Agrupar unidades condominiais por comportamento de pagamento para identificar perfis.

## Features

- **Pontualidade:** % de pagamentos realizados até a data de vencimento
- **Atraso médio:** Dias de atraso médios (considerando apenas pagamentos atrasados)
- **Multa total:** Valor total de multas pagas nos últimos 12 meses

## Algoritmo

**K-Means** com K=3.

### Passos

1. **Inicialização (Forgy):** Sortear k observações como centróides iniciais
2. **Atribuição:** Cada ponto ao centróide mais próximo (distância euclidiana)
3. **Atualização:** Recalcular centróides como média dos pontos do cluster
4. **Repetir** passos 2-3 até convergência (centróides não mudam)

### Distância Euclidiana

```
d(p, q) = √(Σ(pᵢ - qᵢ)²)
```

### Normalização

Z-score em cada feature para evitar que escalas diferentes dominem.

## Métricas

- **Coeficiente de Silhueta:** mede o quão similar um ponto é ao seu cluster vs clusters vizinhos
  - Varia de -1 a 1
  - Próximo de 1: cluster denso e bem separado
  - Próximo de 0: clusters sobrepostos
  - Negativo: ponto pode estar no cluster errado

## Peris Esperados (k=3)

| Cluster | Perfil | Característica |
|---------|--------|----------------|
| 0 | Exemplar | > 90% pontualidade |
| 1 | Ocasional | 60-90% pontualidade, atrasos curtos |
| 2 | Crítico | < 60% pontualidade, atrasos longos |

## Uso no SAD

- Tabela com unidade + cluster
- Scatter plot 2D (PCA das features ou 2 features mais relevantes)
- Ações sugeridas por cluster (ex: notificar cluster crítico)
