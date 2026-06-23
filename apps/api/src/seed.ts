import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function rng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

async function main() {
  await prisma.receita.deleteMany()
  await prisma.despesa.deleteMany()
  await prisma.unidade.deleteMany()

  const unidades = await Promise.all([
    prisma.unidade.create({ data: { numero: '101', bloco: 'A', proprietario: 'Carlos Silva', email: 'carlos@email.com' } }),
    prisma.unidade.create({ data: { numero: '102', bloco: 'A', proprietario: 'Ana Souza', email: 'ana@email.com' } }),
    prisma.unidade.create({ data: { numero: '201', bloco: 'A', proprietario: 'Pedro Santos', email: 'pedro@email.com' } }),
    prisma.unidade.create({ data: { numero: '202', bloco: 'A', proprietario: 'Maria Oliveira', email: 'maria@email.com' } }),
    prisma.unidade.create({ data: { numero: '301', bloco: 'B', proprietario: 'João Lima', email: 'joao@email.com' } }),
    prisma.unidade.create({ data: { numero: '302', bloco: 'B', proprietario: 'Lucia Costa', email: 'lucia@email.com' } }),
    prisma.unidade.create({ data: { numero: '401', bloco: 'B', proprietario: 'Roberto Alves', email: 'roberto@email.com' } }),
    prisma.unidade.create({ data: { numero: '402', bloco: 'B', proprietario: 'Fernanda Rocha', email: 'fernanda@email.com' } }),
    prisma.unidade.create({ data: { numero: '501', bloco: 'C', proprietario: 'Gabriel Torres', email: 'gabriel@email.com' } }),
    prisma.unidade.create({ data: { numero: '502', bloco: 'C', proprietario: 'Juliana Martins', email: 'juliana@email.com' } }),
  ])

  const random = rng(42)
  const meses = Array.from({ length: 24 }, (_, i) => i)
  const baseAno = 2024

  const receitasData: Array<{
    descricao: string; valor: number; dataVencimento: Date; dataPagamento: Date | null; unidadeId: number; categoria: string; status: string
  }> = []

  const addReceita = (
    unidadeId: number,
    mes: number,
    ano: number,
    valor: number,
    pago: boolean,
    diasAtraso?: number
  ) => {
    const venc = new Date(ano, mes, 10)
    let pag: Date | null = null
    let status = 'pendente'
    if (pago) {
      const atraso = diasAtraso ?? 0
      pag = new Date(ano, mes, 10 + atraso)
      status = atraso > 5 ? 'atrasado' : 'pago'
    }
    receitasData.push({
      descricao: `Condomínio ${mes + 1}/${ano}`,
      valor,
      dataVencimento: venc,
      dataPagamento: pag,
      unidadeId,
      categoria: 'condominio',
      status,
    })
  }

  const valorCota = 650
  const perfis: Record<number, { probPagamento: number; probAtraso: number }> = {}
  for (const u of unidades) {
    perfis[u.id] = {
      probPagamento: 0.5 + random() * 0.5,
      probAtraso: random() * 0.4,
    }
  }

  for (const u of unidades) {
    const perfil = perfis[u.id]
    for (const idx of meses) {
      const mes = idx % 12
      const ano = baseAno + Math.floor(idx / 12)
      const inflacao = 1 + Math.floor(idx / 12) * 0.05
      const pago = random() < perfil.probPagamento
      const atraso = pago
        ? random() < perfil.probAtraso
          ? Math.floor(random() * 25) + 1
          : 0
        : undefined
      addReceita(u.id, mes, ano, Math.round(valorCota * inflacao - (u.id % 3) * 50), pago, atraso)
    }
  }

  for (const r of receitasData) {
    await prisma.receita.create({ data: r })
  }

  const categoriasDespesas = [
    { cat: 'agua', fornecedor: 'Embasa', valorBase: 3500 },
    { cat: 'luz', fornecedor: 'Coelba', valorBase: 2800 },
    { cat: 'folha', fornecedor: 'Funcionários', valorBase: 8000 },
    { cat: 'manutencao', fornecedor: 'Diversos', valorBase: 1500 },
    { cat: 'seguranca', fornecedor: 'Segurança Total', valorBase: 2200 },
    { cat: 'limpeza', fornecedor: 'Limpeza Ltda', valorBase: 1800 },
  ]

  for (const idx of meses) {
    const mes = idx % 12
    const ano = baseAno + Math.floor(idx / 12)
    const inflacao = 1 + Math.floor(idx / 12) * 0.06
    const verao = mes >= 11 || mes <= 2 ? 1.15 : 1.0
    const eManutencao = random() > 0.8

    for (const { cat, fornecedor, valorBase } of categoriasDespesas) {
      let valorFinal = valorBase * inflacao * verao
      const variacao = (random() - 0.4) * valorBase * 0.3
      valorFinal += variacao

      if (eManutencao && cat === 'manutencao') {
        valorFinal += 3000 + random() * 5000
      }

      await prisma.despesa.create({
        data: {
          descricao: `${cat.charAt(0).toUpperCase() + cat.slice(1)} - ${mes + 1}/${ano}`,
          valor: Math.round(valorFinal * 100) / 100,
          data: new Date(ano, mes, 15),
          categoria: cat,
          fornecedor,
        },
      })
    }
  }

  const totalReceitas = receitasData.length
  const receitasPago = receitasData.filter((r) => r.status === 'pago').length
  const totalDespesas = meses.length * categoriasDespesas.length
  console.log('Seed concluído!')
  console.log(`Unidades: ${unidades.length}`)
  console.log(`Receitas: ${totalReceitas} (${receitasPago} pagas, ${Math.round((receitasPago / totalReceitas) * 100)}% adimplência)`)
  console.log(`Despesas: ${totalDespesas}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
