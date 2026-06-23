import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db'
import { linearRegression } from '@sindico/ml-core'

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function std(arr: number[]) {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length)
}

export async function previsaoFluxoCaixaRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const { meses } = req.query as Record<string, string | undefined>
    const horizonte = Math.min(Math.max(Number(meses) || 6, 1), 12)

    const [receitas, despesas] = await Promise.all([
      prisma.receita.findMany({
        where: { status: 'pago' },
        orderBy: { dataVencimento: 'asc' },
      }),
      prisma.despesa.findMany({
        orderBy: { data: 'asc' },
      }),
    ])

    const receitasPorMes = new Map<string, number>()
    for (const r of receitas) {
      const chave = `${r.dataVencimento.getFullYear()}-${String(r.dataVencimento.getMonth() + 1).padStart(2, '0')}`
      receitasPorMes.set(chave, (receitasPorMes.get(chave) || 0) + r.valor)
    }

    const despesasPorMes = new Map<string, number>()
    for (const d of despesas) {
      const chave = `${d.data.getFullYear()}-${String(d.data.getMonth() + 1).padStart(2, '0')}`
      despesasPorMes.set(chave, (despesasPorMes.get(chave) || 0) + d.valor)
    }

    const todosMeses = new Set([...receitasPorMes.keys(), ...despesasPorMes.keys()])
    const mesesOrdenados = Array.from(todosMeses).sort()

    if (mesesOrdenados.length < 3) {
      return { erro: 'São necessários pelo menos 3 meses de dados.', projecao: [] }
    }

    const indices = mesesOrdenados.map((_, i) => i)
    const valsRec = mesesOrdenados.map((m) => receitasPorMes.get(m) || 0)
    const valsDesp = mesesOrdenados.map((m) => despesasPorMes.get(m) || 0)

    const resultadoRec = linearRegression(indices.map((i) => [i]), valsRec, 0.01, 1000)
    const resultadoDesp = linearRegression(indices.map((i) => [i]), valsDesp, 0.01, 1000)

    const ultimoMes = mesesOrdenados[mesesOrdenados.length - 1]
    const [ultAno, ultMes] = ultimoMes.split('-').map(Number)
    const dataUlt = new Date(ultAno, ultMes - 1, 1)

    const saldoAtual = valsRec.reduce((a, b) => a + b, 0) - valsDesp.reduce((a, b) => a + b, 0)

    const projecao: {
      mes: string
      receitaPrevista: number
      despesaPrevista: number
      saldoProjetado: number
    }[] = []

    const ultIdx = indices.length - 1
    let saldoProjetado = saldoAtual

    for (let i = 1; i <= horizonte; i++) {
      const xNorm = (ultIdx + i - mean(indices)) / (std(indices) || 1)
      const recPrev = resultadoRec.theta[0] + resultadoRec.theta[1] * xNorm
      const despPrev = resultadoDesp.theta[0] + resultadoDesp.theta[1] * xNorm

      const proxData = new Date(dataUlt)
      proxData.setMonth(proxData.getMonth() + i)
      const mesStr = `${proxData.getFullYear()}-${String(proxData.getMonth() + 1).padStart(2, '0')}`

      saldoProjetado += recPrev - despPrev

      projecao.push({
        mes: mesStr,
        receitaPrevista: Math.round(recPrev * 100) / 100,
        despesaPrevista: Math.round(despPrev * 100) / 100,
        saldoProjetado: Math.round(saldoProjetado * 100) / 100,
      })
    }

    return {
      mesesHistoricos: mesesOrdenados,
      receitasHistoricas: valsRec,
      despesasHistoricas: valsDesp,
      saldoAtual,
      projecao,
      r2Receitas: Math.round(resultadoRec.r2 * 10000) / 10000,
      r2Despesas: Math.round(resultadoDesp.r2 * 10000) / 10000,
    }
  })
}
