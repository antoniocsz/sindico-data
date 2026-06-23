import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

function fmt(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface BiData {
  kpis: {
    saldoAtual: number
    receitasPeriodo: number
    despesasPeriodo: number
    inadimplenciaPercent: number
    inadimplenciaValor: number
    variacaoReceita: number
    variacaoDespesa: number
  }
  evolucaoMensal: { mes: string; receitas: number; despesas: number; saldo: number }[]
  composicaoDespesas: { categoria: string; valor: number; percentual: number }[]
  inadimplenciaEvolucao: { mes: string; percentual: number; valor: number }[]
  topFornecedores: { fornecedor: string; valor: number }[]
  receitasPorBloco: { bloco: string; valor: number; percentual: number }[]
  periodo: { inicio: string; fim: string }
}

function fmtPct(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

export async function gerarPdf(data: BiData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()
  let y = height - 50
  const margin = 50
  const col1 = margin
  const col2 = width / 2
  const lineH = 16

  function title(text: string) {
    page.drawText(text, { x: col1, y, size: 18, font: bold, color: rgb(0.1, 0.1, 0.1) })
    y -= 28
  }

  function subtitle(text: string) {
    page.drawText(text, { x: col1, y, size: 11, font: bold, color: rgb(0.3, 0.3, 0.3) })
    y -= 20
  }

  function textLine(label: string, value: string, col = col1) {
    page.drawText(label, { x: col, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
    const vw = font.widthOfTextAtSize(value, 10)
    page.drawText(value, { x: col + 140, y, size: 10, font: bold, color: rgb(0.1, 0.1, 0.1) })
    y -= lineH
  }

  function checkPage(needed: number) {
    if (y < needed) {
      page = pdfDoc.addPage([595.28, 841.89])
      y = height - 50
    }
  }

  title('Relatório de Gestão')
  page.drawText(`Período: ${data.periodo.inicio} a ${data.periodo.fim}`, {
    x: col1, y, size: 11, font, color: rgb(0.4, 0.4, 0.4),
  })
  y -= lineH
  const hoje = new Date().toLocaleDateString('pt-BR')
  page.drawText(`Gerado em: ${hoje}`, { x: col1, y, size: 9, font, color: rgb(0.6, 0.6, 0.6) })
  y -= 30

  subtitle('Indicadores Financeiros')
  const kpis = data.kpis
  const linhasKpi = [
    ['Saldo Atual', fmt(kpis.saldoAtual)],
    ['Total Receitas', fmt(kpis.receitasPeriodo)],
    ['Total Despesas', fmt(kpis.despesasPeriodo)],
    ['Inadimplência', `${kpis.inadimplenciaPercent}% (${fmt(kpis.inadimplenciaValor)})`],
    ['Variação Receitas', fmtPct(kpis.variacaoReceita)],
    ['Variação Despesas', fmtPct(kpis.variacaoDespesa)],
  ]
  for (const [label, value] of linhasKpi) {
    textLine(label, value)
  }
  y -= 16

  if (data.evolucaoMensal.length > 0) {
    checkPage(120)
    subtitle('Evolução Mensal')
    const cols = ['Mês', 'Receitas', 'Despesas', 'Saldo']
    const colW = [80, 120, 120, 120]
    const x0 = col1
    let cx = x0
    page.drawText(cols[0], { x: cx, y, size: 9, font: bold, color: rgb(0.2, 0.2, 0.2) })
    cx += colW[0]
    page.drawText(cols[1], { x: cx, y, size: 9, font: bold, color: rgb(0.2, 0.2, 0.2) })
    cx += colW[1]
    page.drawText(cols[2], { x: cx, y, size: 9, font: bold, color: rgb(0.2, 0.2, 0.2) })
    cx += colW[2]
    page.drawText(cols[3], { x: cx, y, size: 9, font: bold, color: rgb(0.2, 0.2, 0.2) })
    y -= 18

    for (const e of data.evolucaoMensal) {
      checkPage(30)
      cx = x0
      page.drawText(e.mes, { x: cx, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) })
      cx += colW[0]
      page.drawText(fmt(e.receitas), { x: cx, y, size: 9, font, color: rgb(0.2, 0.6, 0.2) })
      cx += colW[1]
      page.drawText(fmt(e.despesas), { x: cx, y, size: 9, font, color: rgb(0.8, 0.2, 0.2) })
      cx += colW[2]
      const saldoCor = e.saldo >= 0 ? rgb(0.2, 0.6, 0.2) : rgb(0.8, 0.2, 0.2)
      page.drawText(fmt(e.saldo), { x: cx, y, size: 9, font: bold, color: saldoCor })
      y -= 16
    }
    y -= 12
  }

  if (data.composicaoDespesas.length > 0) {
    checkPage(100)
    subtitle('Composição de Despesas por Categoria')
    const cols = ['Categoria', 'Valor', '%']
    const colW = [120, 120, 80]
    const x0 = col1
    let cx = x0
    for (const c of cols) {
      page.drawText(c, { x: cx, y, size: 9, font: bold, color: rgb(0.2, 0.2, 0.2) })
      cx += colW[cols.indexOf(c)]
    }
    y -= 18

    for (const d of data.composicaoDespesas) {
      checkPage(30)
      cx = x0
      page.drawText(d.categoria, { x: cx, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) })
      cx += colW[0]
      page.drawText(fmt(d.valor), { x: cx, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) })
      cx += colW[1]
      page.drawText(`${d.percentual}%`, { x: cx, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) })
      y -= 16
    }
    y -= 12
  }

  if (data.topFornecedores.length > 0) {
    checkPage(100)
    subtitle('Top Fornecedores')
    const cols = ['Fornecedor', 'Valor']
    const colW = [180, 120]
    const x0 = col1
    let cx = x0
    for (const c of cols) {
      page.drawText(c, { x: cx, y, size: 9, font: bold, color: rgb(0.2, 0.2, 0.2) })
      cx += colW[cols.indexOf(c)]
    }
    y -= 18

    for (const f of data.topFornecedores) {
      checkPage(30)
      cx = x0
      page.drawText(f.fornecedor, { x: cx, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) })
      cx += colW[0]
      page.drawText(fmt(f.valor), { x: cx, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) })
      y -= 16
    }
    y -= 12
  }

  if (data.inadimplenciaEvolucao.length > 0) {
    checkPage(100)
    subtitle('Evolução da Inadimplência')
    const cols = ['Mês', '% Inadimplência', 'Valor']
    const colW = [80, 120, 120]
    const x0 = col1
    let cx = x0
    for (const c of cols) {
      page.drawText(c, { x: cx, y, size: 9, font: bold, color: rgb(0.2, 0.2, 0.2) })
      cx += colW[cols.indexOf(c)]
    }
    y -= 18

    for (const i of data.inadimplenciaEvolucao) {
      checkPage(30)
      cx = x0
      page.drawText(i.mes, { x: cx, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) })
      cx += colW[0]
      page.drawText(`${i.percentual}%`, { x: cx, y, size: 9, font, color: rgb(0.8, 0.2, 0.2) })
      cx += colW[1]
      page.drawText(fmt(i.valor), { x: cx, y, size: 9, font, color: rgb(0.8, 0.2, 0.2) })
      y -= 16
    }
  }

  return pdfDoc.save()
}

export function gerarCsv(data: BiData): string {
  const linhas: string[] = []

  linhas.push(`Relatório de Gestão - ${data.periodo.inicio} a ${data.periodo.fim}`)
  linhas.push(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`)
  linhas.push('')

  linhas.push('Indicadores Financeiros')
  linhas.push('Indicador,Valor')
  linhas.push(`Saldo Atual,${data.kpis.saldoAtual}`)
  linhas.push(`Total Receitas,${data.kpis.receitasPeriodo}`)
  linhas.push(`Total Despesas,${data.kpis.despesasPeriodo}`)
  linhas.push(`Inadimplência (%),${data.kpis.inadimplenciaPercent}`)
  linhas.push(`Inadimplência (R$),${data.kpis.inadimplenciaValor}`)
  linhas.push(`Variação Receitas (%),${data.kpis.variacaoReceita}`)
  linhas.push(`Variação Despesas (%),${data.kpis.variacaoDespesa}`)
  linhas.push('')

  linhas.push('Evolução Mensal')
  linhas.push('Mês,Receitas,Despesas,Saldo')
  for (const e of data.evolucaoMensal) {
    linhas.push(`${e.mes},${e.receitas},${e.despesas},${e.saldo}`)
  }
  linhas.push('')

  linhas.push('Composição de Despesas')
  linhas.push('Categoria,Valor,Percentual')
  for (const d of data.composicaoDespesas) {
    linhas.push(`${d.categoria},${d.valor},${d.percentual}%`)
  }
  linhas.push('')

  linhas.push('Top Fornecedores')
  linhas.push('Fornecedor,Valor')
  for (const f of data.topFornecedores) {
    linhas.push(`${f.fornecedor},${f.valor}`)
  }
  linhas.push('')

  linhas.push('Evolução da Inadimplência')
  linhas.push('Mês,Percentual,Valor')
  for (const i of data.inadimplenciaEvolucao) {
    linhas.push(`${i.mes},${i.percentual}%,${i.valor}`)
  }

  return '\ufeff' + linhas.join('\r\n')
}
