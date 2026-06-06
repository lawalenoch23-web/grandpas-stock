import { useState } from 'react'
import { Card, Tag } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt } from '../../lib/utils'

type FilterPeriod = 'all' | 'today' | 'week' | 'month'

export default function ManagerFinancials() {
  const { appState } = useAppState()
  const [filter, setFilter] = useState<FilterPeriod>('all')

  const filterStart = () => {
    const now = new Date()
    if (filter === 'today') return new Date().toISOString().split('T')[0]
    if (filter === 'week') { const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] }
    if (filter === 'month') { const d = new Date(now); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0] }
    return '2000-01-01'
  }

  const from = filterStart()

  // Collect all unique dates that have any activity
  const allDates = Array.from(new Set([
    ...appState.sales.map(s => s.created_at.split('T')[0]),
    ...appState.expenses.map(e => e.date),
    ...appState.supplies.map(s => s.date),
  ])).filter(d => d >= from).sort().reverse()

  const calcDay = (date: string) => {
    const sales = appState.sales.filter(s => s.created_at.startsWith(date))
    const expenses = appState.expenses.filter(e => e.date === date)
    const supplies = appState.supplies.filter(s => s.date === date)

    const revenue = sales.reduce((s, sale) => s + sale.amount_paid, 0)
    const outstanding = sales.reduce((s, sale) => s + sale.outstanding, 0)
    const billed = sales.reduce((s, sale) => s + sale.subtotal, 0)
    const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0)
    const supplyCost = supplies.reduce((s, sup) => s + sup.total_cost, 0)
    const net = revenue - expenseTotal - supplyCost

    return { revenue, outstanding, billed, expenseTotal, supplyCost, net, salesCount: sales.length }
  }

  // Totals row
  const totals = allDates.reduce((acc, date) => {
    const d = calcDay(date)
    return {
      revenue: acc.revenue + d.revenue,
      outstanding: acc.outstanding + d.outstanding,
      billed: acc.billed + d.billed,
      expenseTotal: acc.expenseTotal + d.expenseTotal,
      supplyCost: acc.supplyCost + d.supplyCost,
      net: acc.net + d.net,
      salesCount: acc.salesCount + d.salesCount,
    }
  }, { revenue: 0, outstanding: 0, billed: 0, expenseTotal: 0, supplyCost: 0, net: 0, salesCount: 0 })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="font-display font-bold text-2xl">Financial Summary</div>
        <div className="flex gap-1.5">
          {(['all', 'today', 'week', 'month'] as FilterPeriod[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-mono uppercase border cursor-pointer transition-all
                ${filter === f ? 'bg-yellow/10 border-yellow/30 text-yellow' : 'border-border text-muted hover:border-soft'}`}
            >{f === 'all' ? 'All Time' : f === 'today' ? 'Today' : f === 'week' ? '7 Days' : '30 Days'}</button>
          ))}
        </div>
      </div>

      {allDates.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-3">💹</div>
          <div className="text-muted text-sm">No financial activity yet</div>
        </Card>
      ) : (
        <>
          {/* Summary totals */}
          <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {[
              { label: 'Total Revenue', value: fmt(totals.revenue), accent: 'text-accent' },
              { label: 'Total Billed', value: fmt(totals.billed), accent: '' },
              { label: 'Outstanding', value: fmt(totals.outstanding), accent: 'text-red' },
              { label: 'Supply Cost', value: fmt(totals.supplyCost), accent: 'text-yellow' },
              { label: 'Expenses', value: fmt(totals.expenseTotal), accent: 'text-yellow' },
              { label: 'Net Profit', value: fmt(totals.net), accent: totals.net >= 0 ? 'text-accent' : 'text-red' },
            ].map(item => (
              <Card key={item.label}>
                <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-2">{item.label}</div>
                <div className={`text-lg font-display font-bold ${item.accent}`}>{item.value}</div>
              </Card>
            ))}
          </div>

          {/* Day by day table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {['Date', 'Sales', 'Revenue', 'Billed', 'Outstanding', 'Supply Cost', 'Expenses', 'Net'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-[11px] text-muted font-mono uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allDates.map(date => {
                    const d = calcDay(date)
                    const isProfit = d.net >= 0
                    return (
                      <tr key={date} className="border-b border-border/10 hover:bg-white/[0.02]">
                        <td className="px-3 py-3 font-mono text-sm text-soft whitespace-nowrap">{date}</td>
                        <td className="px-3 py-3 text-sm text-center">{d.salesCount}</td>
                        <td className="px-3 py-3 font-mono text-sm text-accent">{fmt(d.revenue)}</td>
                        <td className="px-3 py-3 font-mono text-sm">{fmt(d.billed)}</td>
                        <td className={`px-3 py-3 font-mono text-sm ${d.outstanding > 0 ? 'text-red' : 'text-muted'}`}>
                          {fmt(d.outstanding)}
                        </td>
                        <td className="px-3 py-3 font-mono text-sm text-yellow">{fmt(d.supplyCost)}</td>
                        <td className="px-3 py-3 font-mono text-sm text-yellow">{fmt(d.expenseTotal)}</td>
                        <td className="px-3 py-3">
                          <Tag color={isProfit ? 'green' : 'red'}>
                            {isProfit ? '+' : ''}{fmt(d.net)}
                          </Tag>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
