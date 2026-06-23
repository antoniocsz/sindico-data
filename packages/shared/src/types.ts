export interface Unidade {
  id: number
  numero: string
  bloco: string
  proprietario: string
  email: string
}

export interface Receita {
  id: number
  descricao: string
  valor: number
  dataVencimento: string
  dataPagamento: string | null
  unidadeId: number
  categoria: string
  status: 'pago' | 'pendente' | 'atrasado'
}

export interface Despesa {
  id: number
  descricao: string
  valor: number
  data: string
  categoria: string
  fornecedor: string
}

export interface DashboardKPI {
  saldoAtual: number
  receitasMes: number
  despesasMes: number
  inadimplenciaPercent: number
  evolucaoMensal: Array<{ mes: string; receitas: number; despesas: number }>
}

export interface PrevisaoDespesas {
  meses: string[]
  valoresReais: number[]
  valoresPrevistos: number[]
  proximaPrevisao: number
  proximoMes: string
  r2: number
  rmse: number
}

export interface PerfilUnidades {
  unidades: Array<{
    unidade: Unidade
    cluster: number
    features: {
      pontualidade: number
      atrasoMedio: number
      multaTotal: number
    }
  }>
  centoides: number[][]
  silhuetaMedia: number
}

export interface RiscoInadimplencia {
  unidade: Unidade
  risco: 'baixo' | 'medio' | 'alto'
  features: {
    pontualidade: number
    atrasoMedio: number
    valorMedioCota: number
    diasUltimoPagamento: number
  }
  acuracia: number
}

export interface CriarUnidadeInput {
  numero: string
  bloco: string
  proprietario: string
  email: string
}

export interface CriarReceitaInput {
  descricao: string
  valor: number
  dataVencimento: string
  dataPagamento?: string
  unidadeId: number
  categoria: string
}

export interface CriarDespesaInput {
  descricao: string
  valor: number
  data: string
  categoria: string
  fornecedor: string
}

export interface SimulacaoTaxaResult {
  percentualAjuste: number
  receitasOriginais: number
  receitasAjustadas: number
  despesasTotais: number
  saldoOriginal: number
  saldoProjetado: number
  projecaoMensal: Array<{ mes: string; original: number; projetado: number }>
}

export interface SimulacaoRateioItem {
  unidadeId: number
  numero: string
  bloco: string
  proprietario: string
  valorAtual: number
  valorProjetado: number
  diferenca: number
}

export interface SimulacaoRateioResult {
  tipo: 'fracao_ideal' | 'por_unidade'
  totalRateado: number
  porUnidade: SimulacaoRateioItem[]
}

export interface BiResult {
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
  saldoAcumulado: { mes: string; saldo: number }[]
}

export interface AnomaliaDespesa {
  id: number
  descricao: string
  valor: number
  data: string
  categoria: string
  fornecedor: string
  zScoreGlobal: number
  anomaliaGlobal: boolean
  zScoreCategoria: number
  anomaliaCategoria: boolean
}
