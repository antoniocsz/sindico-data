import Fastify from 'fastify'
import cors from '@fastify/cors'
import { unidadesRoutes } from './routes/unidades'
import { receitasRoutes } from './routes/receitas'
import { despesasRoutes } from './routes/despesas'
import { dashboardRoutes } from './routes/dashboard'
import { mlRoutes } from './routes/ml'
import { biRoutes } from './routes/bi'
import { exportRoutes } from './routes/export'
import { orcamentosRoutes } from './routes/orcamentos'

const server = Fastify({ logger: true })

async function start() {
  await server.register(cors, { origin: true })

  await server.register(unidadesRoutes, { prefix: '/api/unidades' })
  await server.register(receitasRoutes, { prefix: '/api/receitas' })
  await server.register(despesasRoutes, { prefix: '/api/despesas' })
  await server.register(dashboardRoutes, { prefix: '/api/dashboard' })
  await server.register(mlRoutes, { prefix: '/api/ml' })
  await server.register(biRoutes, { prefix: '/api/bi' })
  await server.register(exportRoutes, { prefix: '/api/export' })
  await server.register(orcamentosRoutes, { prefix: '/api/orcamentos' })

  try {
    await server.listen({ port: 3001, host: '0.0.0.0' })
    console.log('API rodando em http://localhost:3001')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
