import { FastifyInstance } from 'fastify'
import { previsaoDespesasRoutes } from './previsao-despesas'
import { perfilUnidadesRoutes } from './perfil-unidades'
import { riscoInadimplenciaRoutes } from './risco-inadimplencia'
import { anomaliasDespesasRoutes } from './anomalias-despesas'
import { simulacaoTaxaRoutes } from './simulacao-taxa'
import { simulacaoRateioRoutes } from './simulacao-rateio'
import { previsaoFluxoCaixaRoutes } from './previsao-fluxo-caixa'

export async function mlRoutes(app: FastifyInstance) {
  await app.register(previsaoDespesasRoutes, { prefix: '/previsao-despesas' })
  await app.register(perfilUnidadesRoutes, { prefix: '/perfil-unidades' })
  await app.register(riscoInadimplenciaRoutes, { prefix: '/risco-inadimplencia' })
  await app.register(anomaliasDespesasRoutes, { prefix: '/anomalias-despesas' })
  await app.register(simulacaoTaxaRoutes, { prefix: '/simulacao-taxa' })
  await app.register(simulacaoRateioRoutes, { prefix: '/simulacao-rateio' })
  await app.register(previsaoFluxoCaixaRoutes, { prefix: '/previsao-fluxo-caixa' })
}
