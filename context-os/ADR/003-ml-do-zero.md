# ADR 003: Algoritmos ML implementados do zero

## Contexto

O projeto requer técnicas de regressão, agrupamento e classificação. Precisamos decidir entre usar bibliotecas prontas ou implementar os algoritmos manualmente.

## Decisão

Implementar os algoritmos **do zero em TypeScript** no pacote `@sindico/ml-core`.

## Justificativa

- **Acadêmico:** O projeto é da UFBA — implementar do zero demonstra compreensão dos algoritmos
- **Didático:** Facilita explicação e visualização das etapas (gradiente descendente, distância euclidiana, etc.)
- **Sem dependências pesadas:** `ml-core` fica puro, sem libs externas
- **Cross-check:** Podemos comparar resultados com libs `ml-*` para validação

## Algoritmos

1. **Regressão Linear** — Gradiente descendente, normalização z-score, R² e RMSE
2. **K-Means** — Distância euclidiana, inicialização Forgy, coeficiente de silhueta
3. **K-NN** — Distância euclidiana, votação majoritária, Leave-One-Out

## Consequências

- Mais código para escrever e testar
- Maior valor acadêmico
- ML roda exclusivamente no backend (Node.js)
- Pacote `@sindico/ml-core` com cobertura de testes
