import { Card, Tag } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt, today } from '../../lib/utils'

type Period = 'daily' | 'weekly' | 'monthly' | 'alltime'

function startOf(period: Period): string {
  const now = new Date()
  if (period === 'daily') return today()
  if (period === 'weekly') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  }
  if (period === 'monthly') {
    const d = new Date(now)
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  }
  return '2000-01-01'
}

export default function ManagerFinancials() {
  const { appState } = useAppState()
  const periods: { id: Period; label: string }[] = [
    { id: 'daily', label: 'Today' },
    { id: 'weekly', label: 'Last 7 Days' },
    { id: 'monthly', label: 'Last 30 Days' },
    { id: 'alltime', label: 'All Time' },
  ]

  const calc = (period: Period) => {
    const from = startOf(period)

    const sales = appState.sales.filter(s => s.created_at.split('T')[0] >= from)
    const expenses = appState.expenses.filter(e => e.date >= from)
    const supplies = appState.supplies.filter(s => s.date >= from)

    const totalRevenue = sales.reduce((s, sale) => s + sale.amount_paid, 0)
    const totalOutstanding = sales.reduce((s, sale) => s + sale.outstanding, 0)
    const totalSalesValue = sales.reduce((s, sale) => s + sale.subtotal, 0)
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
    const totalSupplyCost = supplies.reduce((s, sup) => s + sup.total_cost, 0)
    const netProfit = totalRevenue - totalExpenses - totalSupplyCost

    return { totalRevenue, totalOutstanding, totalSalesValue, totalExpenses, totalSupplyCost, netProfit, salesCount: sales.length }
  }

  return (
    <div>
      <div className="font-display font-bold text-2xl mb-6">Financial Summary</div>

      <div className="space-y-8">
        {periods.map(p => {
          const d = calc(p.id)
          const isProfit = d.netProfit >= 0
          return (
            <div key={p.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="font-display font-semibold text-lg">{p.label}</div>
                <div className="h-px flex-1 bg-border" />
                <Tag color={isProfit ? 'green' : 'red'}>
                  {isProfit ? '+' : ''}{fmt(d.netProfit)} net
                </Tag>
              </div>

              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                <Card>
                  <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-2">Revenue Collected</div>
                  <div className="text-xl font-display font-bold text-accent">{fmt(d.totalRevenue)}</div>
                  <div className="text-xs text-muted mt-1">{d.salesCount} sales</div>
                </Card>
                <Card>
                  <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-2">Total Billed</div>
                  <div className="text-xl font-display font-bold">{fmt(d.totalSalesValue)}</div>
                  <div className="text-xs text-muted mt-1">incl. credit</div>
                </Card>
                <Card>
                  <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-2">Outstanding</div>
                  <div className="text-xl font-display font-bold text-red">{fmt(d.totalOutstanding)}</div>
                  <div className="text-xs text-muted mt-1">uncollected</div>
                </Card>
                <Card>
                  <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-2">Supply Cost</div>
                  <div className="text-xl font-display font-bold text-yellow">{fmt(d.totalSupplyCost)}</div>
                  <div className="text-xs text-muted mt-1">purchases</div>
                </Card>
                <Card>
                  <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-2">Expenses</div>
                  <div className="text-xl font-display font-bold text-yellow">{fmt(d.totalExpenses)}</div>
                  <div className="text-xs text-muted mt-1">operational</div>
                </Card>
                <Card className={`border ${isProfit ? 'border-accent/30 bg-accent/5' : 'border-red/30 bg-red/5'}`}>
                  <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-2">Net Profit</div>
                  <div className={`text-xl font-display font-bold ${isProfit ? 'text-accent' : 'text-red'}`}>
                    {isProfit ? '+' : ''}{fmt(d.netProfit)}
                  </div>
                  <div className="text-xs text-muted mt-1">revenue − expenses − supply</div>
                </Card>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
