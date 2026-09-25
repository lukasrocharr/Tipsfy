export type SubscriberStatus = 'active' | 'delinquent' | 'cancelled' | 'trial'
export type TipResult = 'green' | 'red' | 'void' | 'pending'
export type PlanPeriod = 'monthly' | 'quarterly' | 'annual'
export type PaymentMethod = 'pix' | 'credit_card'
export type TransactionStatus = 'paid' | 'pending' | 'failed' | 'refunded'

export interface Subscriber {
  id: string
  name: string
  telegram: string
  telegramId: string
  plan: string
  planId: string
  status: SubscriberStatus
  nextBilling: string
  joinedAt: string
  totalPaid: number
  paymentMethod: PaymentMethod
  email: string
}

export interface Plan {
  id: string
  name: string
  price: number
  period: PlanPeriod
  active: boolean
  subscribers: number
  description?: string
  channelId: string
  checkoutSlug: string
}

export interface Tip {
  id: string
  sport: string
  event: string
  market: string
  odds: number
  units: number
  result: TipResult
  date: string
  potentialReturn?: number
  bookmaker?: string
  notes?: string
}

export interface Transaction {
  id: string
  subscriberName: string
  telegram: string
  plan: string
  amount: number
  method: PaymentMethod
  status: TransactionStatus
  date: string
  description: string
}

export interface Notification {
  id: string
  type: 'payment' | 'subscriber' | 'system' | 'alert'
  title: string
  message: string
  read: boolean
  time: string
}

// TEMPORÁRIO: mock ainda em uso, será substituído na Etapa 2.
export const subscribers: Subscriber[] = [
  { id: '1', name: 'Carlos Mendes', telegram: '@carlosm', telegramId: '48291037', plan: 'VIP Mensal', planId: '1', status: 'active', nextBilling: '2026-10-15', joinedAt: '2026-08-15', totalPaid: 119.70, paymentMethod: 'pix', email: 'carlos@email.com' },
  { id: '2', name: 'Ana Paula Silva', telegram: '@anapaula', telegramId: '93841020', plan: 'VIP Mensal', planId: '1', status: 'active', nextBilling: '2026-10-18', joinedAt: '2026-08-18', totalPaid: 79.80, paymentMethod: 'credit_card', email: 'ana@email.com' },
  { id: '3', name: 'Bruno Ferreira', telegram: '@brunof', telegramId: '11029384', plan: 'Premium Trimestral', planId: '2', status: 'delinquent', nextBilling: '2026-09-01', joinedAt: '2026-06-01', totalPaid: 99.90, paymentMethod: 'pix', email: 'bruno@email.com' },
  { id: '4', name: 'Mariana Costa', telegram: '@marianac', telegramId: '55820193', plan: 'VIP Mensal', planId: '1', status: 'active', nextBilling: '2026-10-20', joinedAt: '2026-08-20', totalPaid: 79.80, paymentMethod: 'credit_card', email: 'mariana@email.com' },
  { id: '5', name: 'Lucas Oliveira', telegram: '@lucasoliv', telegramId: '76481029', plan: 'Premium Trimestral', planId: '2', status: 'active', nextBilling: '2026-11-05', joinedAt: '2026-08-05', totalPaid: 199.80, paymentMethod: 'pix', email: 'lucas@email.com' },
  { id: '6', name: 'Fernanda Lima', telegram: '@fernandalima', telegramId: '23948102', plan: 'VIP Mensal', planId: '1', status: 'cancelled', nextBilling: '—', joinedAt: '2026-07-10', totalPaid: 159.60, paymentMethod: 'credit_card', email: 'fernanda@email.com' },
  { id: '7', name: 'Ricardo Santos', telegram: '@ricardos', telegramId: '88102934', plan: 'VIP Anual', planId: '3', status: 'active', nextBilling: '2027-05-12', joinedAt: '2025-05-12', totalPaid: 399.90, paymentMethod: 'credit_card', email: 'ricardo@email.com' },
  { id: '8', name: 'Patricia Gomes', telegram: '@patriciag', telegramId: '34019283', plan: 'VIP Mensal', planId: '1', status: 'trial', nextBilling: '2026-09-28', joinedAt: '2026-09-21', totalPaid: 0, paymentMethod: 'pix', email: 'patricia@email.com' },
  { id: '9', name: 'Thiago Alves', telegram: '@thiagoalv', telegramId: '61203948', plan: 'Premium Trimestral', planId: '2', status: 'delinquent', nextBilling: '2026-09-10', joinedAt: '2026-06-10', totalPaid: 99.90, paymentMethod: 'pix', email: 'thiago@email.com' },
  { id: '10', name: 'Juliana Rocha', telegram: '@julianr', telegramId: '50293847', plan: 'VIP Mensal', planId: '1', status: 'active', nextBilling: '2026-10-03', joinedAt: '2026-09-03', totalPaid: 39.90, paymentMethod: 'credit_card', email: 'juliana@email.com' },
]

// TEMPORÁRIO: mock ainda em uso, será substituído na Etapa 2.
export const plans: Plan[] = [
  { id: '1', name: 'VIP Mensal', price: 39.90, period: 'monthly', active: true, subscribers: 7, description: 'Acesso ao grupo VIP com sinais diários.', channelId: 'mock-channel', checkoutSlug: 'vip-mensal-demo' },
  { id: '2', name: 'Premium Trimestral', price: 99.90, period: 'quarterly', active: true, subscribers: 3, description: 'Plano trimestral com 16% de desconto.', channelId: 'mock-channel', checkoutSlug: 'premium-trimestral-demo' },
  { id: '3', name: 'VIP Anual', price: 399.90, period: 'annual', active: true, subscribers: 1, description: 'Melhor custo-benefício, 33% de desconto.', channelId: 'mock-channel', checkoutSlug: 'vip-anual-demo' },
]

// TEMPORÁRIO: mock ainda em uso, será substituído na Etapa 3.
export const tips: Tip[] = [
  { id: '1', sport: 'Futebol', event: 'Flamengo x Palmeiras – Brasileirão Série A', market: 'Ambas Marcam – Sim', odds: 2.10, units: 2, result: 'green', date: '2026-09-20', bookmaker: 'Bet365', notes: 'Ambos atacam muito bem em casa, defesas porosas.' },
  { id: '2', sport: 'Futebol', event: 'Real Madrid x Bayern – Champions League', market: 'Over 2.5 Gols', odds: 1.85, units: 1.5, result: 'green', date: '2026-09-18', bookmaker: 'Betano' },
  { id: '3', sport: 'Tênis', event: 'Djokovic x Alcaraz – US Open Final', market: 'Djokovic para vencer', odds: 2.40, units: 1, result: 'red', date: '2026-09-15', bookmaker: 'Sportingbet', notes: 'Djokovic com lesão no joelho reportada dias antes.' },
  { id: '4', sport: 'Futebol', event: 'Liverpool x Arsenal – Premier League', market: 'Resultado – Liverpool', odds: 3.20, units: 1, result: 'green', date: '2026-09-13', bookmaker: 'Bet365' },
  { id: '5', sport: 'Basquete', event: 'Lakers x Warriors – NBA Regular Season', market: 'Lakers -4.5 pts', odds: 1.95, units: 2, result: 'void', date: '2026-09-10', bookmaker: 'Betano', notes: 'Jogo suspenso por 30 min, apostas anuladas.' },
  { id: '6', sport: 'Futebol', event: 'São Paulo x Corinthians – Paulistão', market: 'Resultado – São Paulo', odds: 2.60, units: 1, result: 'green', date: '2026-09-08', bookmaker: 'Pixbet' },
  { id: '7', sport: 'Futebol', event: 'PSG x Marseille – Ligue 1', market: 'PSG -1.5 Asian Handicap', odds: 2.05, units: 1.5, result: 'green', date: '2026-09-05', bookmaker: 'Bet365' },
  { id: '8', sport: 'MMA', event: 'UFC 299 – Pereira x Prochazka', market: 'Pereira por nocaute', odds: 2.80, units: 0.5, result: 'red', date: '2026-09-01', bookmaker: 'Betano' },
  { id: '9', sport: 'Futebol', event: 'Grêmio x Internacional – Gauchão', market: 'Over 1.5 Gols FT', odds: 1.75, units: 2, result: 'green', date: '2026-08-28', bookmaker: 'Sportingbet' },
  { id: '10', sport: 'Futebol', event: 'Atlético-MG x Cruzeiro – Copa Brasil', market: 'Ambas Marcam – Sim', odds: 1.90, units: 1, result: 'pending', date: '2026-09-21', bookmaker: 'Bet365' },
]

// TEMPORÁRIO: mock ainda em uso, será substituído na Etapa 4.
export const transactions: Transaction[] = [
  { id: '1', subscriberName: 'Carlos Mendes', telegram: '@carlosm', plan: 'VIP Mensal', amount: 39.90, method: 'pix', status: 'paid', date: '2026-09-15', description: 'Renovação setembro' },
  { id: '2', subscriberName: 'Ana Paula Silva', telegram: '@anapaula', plan: 'VIP Mensal', amount: 39.90, method: 'credit_card', status: 'paid', date: '2026-09-18', description: 'Renovação setembro' },
  { id: '3', subscriberName: 'Bruno Ferreira', telegram: '@brunof', plan: 'Premium Trimestral', amount: 99.90, method: 'pix', status: 'failed', date: '2026-09-01', description: 'Renovação setembro – falhou' },
  { id: '4', subscriberName: 'Mariana Costa', telegram: '@marianac', plan: 'VIP Mensal', amount: 39.90, method: 'credit_card', status: 'paid', date: '2026-09-20', description: 'Renovação setembro' },
  { id: '5', subscriberName: 'Lucas Oliveira', telegram: '@lucasoliv', plan: 'Premium Trimestral', amount: 99.90, method: 'pix', status: 'paid', date: '2026-09-05', description: 'Renovação trimestral' },
  { id: '6', subscriberName: 'Ricardo Santos', telegram: '@ricardos', plan: 'VIP Anual', amount: 399.90, method: 'credit_card', status: 'paid', date: '2026-05-12', description: 'Assinatura anual' },
  { id: '7', subscriberName: 'Juliana Rocha', telegram: '@julianr', plan: 'VIP Mensal', amount: 39.90, method: 'credit_card', status: 'paid', date: '2026-09-03', description: 'Novo assinante' },
  { id: '8', subscriberName: 'Thiago Alves', telegram: '@thiagoalv', plan: 'Premium Trimestral', amount: 99.90, method: 'pix', status: 'failed', date: '2026-09-10', description: 'Renovação – falhou' },
  { id: '9', subscriberName: 'Fernanda Lima', telegram: '@fernandalima', plan: 'VIP Mensal', amount: 39.90, method: 'credit_card', status: 'refunded', date: '2026-08-10', description: 'Reembolso solicitado' },
  { id: '10', subscriberName: 'Carlos Mendes', telegram: '@carlosm', plan: 'VIP Mensal', amount: 39.90, method: 'pix', status: 'paid', date: '2026-08-15', description: 'Primeiro pagamento' },
]

// TEMPORÁRIO: mock ainda em uso, será substituído na Etapa 2.
export const notifications: Notification[] = [
  { id: '1', type: 'payment', title: 'Pagamento recebido', message: 'Ana Paula Silva renovou VIP Mensal – R$ 39,90', read: false, time: '5 min atrás' },
  { id: '2', type: 'alert', title: 'Inadimplência detectada', message: 'Bruno Ferreira está há 20 dias sem pagar. Acesso bloqueado.', read: false, time: '2h atrás' },
  { id: '3', type: 'subscriber', title: 'Novo assinante', message: 'Patricia Gomes iniciou período trial – VIP Mensal', read: false, time: '3h atrás' },
  { id: '4', type: 'payment', title: 'Pagamento recebido', message: 'Mariana Costa renovou VIP Mensal – R$ 39,90', read: true, time: '1 dia atrás' },
  { id: '5', type: 'system', title: 'Relatório semanal', message: 'MRR cresceu 12% esta semana. Veja o relatório completo.', read: true, time: '2 dias atrás' },
]

// TEMPORÁRIO: mock ainda em uso, será substituído na Etapa 4.
export const mrrHistory = [
  { month: 'Abr', mrr: 198 },
  { month: 'Mai', mrr: 279 },
  { month: 'Jun', mrr: 319 },
  { month: 'Jul', mrr: 279 },
  { month: 'Ago', mrr: 378 },
  { month: 'Set', mrr: 452 },
]

export function calcROI(tipsList: Tip[]) {
  const settled = tipsList.filter(t => t.result !== 'pending' && t.result !== 'void')
  const totalUnits = settled.reduce((s, t) => s + t.units, 0)
  const profit = settled.reduce((s, t) => {
    if (t.result === 'green') return s + t.units * (t.odds - 1)
    return s - t.units
  }, 0)
  const wins = settled.filter(t => t.result === 'green').length
  return {
    roi: totalUnits > 0 ? (profit / totalUnits) * 100 : 0,
    winRate: settled.length > 0 ? (wins / settled.length) * 100 : 0,
    profit,
    wins,
    losses: settled.filter(t => t.result === 'red').length,
    settled: settled.length,
  }
}
