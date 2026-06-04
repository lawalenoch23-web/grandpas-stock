import { useState } from 'react'
import { Card, Tag, Input, EmptyState } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt } from '../../lib/utils'

type FilterPeriod = 'all' | 'today' | 'week' | 'month'

export default function ManagerSales() {
  const { appState } = useAppState()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterPeriod>('all')

  const filterStart = () => {
    const now = new Date()
    if (filter === 'today') return new Date().toISOString().split('T')[0]
    if (filter === 'week') { const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] }
    if (filter === 'month') { const d = new Date(now); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0] }
    return '2000-01-01'
  }

  const filtered = [...appState.sales]
    .filter(s => s.created_at.split('T')[0] >= filterStart())
    .filter(s =>
      search === '' ||
      s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_phone?.includes(search)
    )
    .reverse()

  // Group by date for day-by-day view
  const byDate: Record<string, typeof filtered> = {}
  filtered.forEach(s => {
    const date = s.created_at.split('T')[0]
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(s)
  })
  const dates = Object.keys(byDate).sort().reverse()

  const tagColor = (type: string) =>
    type === 'full' ? 'green' : type === 'half' ? 'yellow' : 'red'

  return (
    <div>
      <div className="font-display font-bold text-2xl mb-6">All Sales</div>

      <div className="flex gap-3 mb-5">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer name or phone..."
          className="flex-1 max-w-xs"
        />
        <div className="flex gap-1.5">
          {(['all', 'today', 'week', 'month'] as FilterPeriod[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-mono uppercase border cursor-pointer transition-all
                ${filter === f ? 'bg-yellow/10 border-yellow/30 text-yellow' : 'border-border text-muted hover:border-soft'}`}
            >{f}</button>
          ))}
        </div>
      </div>

      {dates.length === 0
        ? <EmptyState icon="💰" text="No sales found" />
        : dates.map(date => {
          const daySales = byDate[date]
          const dayTotal = daySales.reduce((s, sale) => s + sale.amount_paid, 0)
          const dayOutstanding = daySales.reduce((s, sale) => s + sale.outstanding, 0)
          return (
            <div key={date} className="mb-6">
              {/* Day header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="font-display font-semibold text-sm text-soft">{date}</div>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-mono text-accent">{fmt(dayTotal)} collected</span>
                {dayOutstanding > 0 && (
                  <span className="text-xs font-mono text-red">{fmt(dayOutstanding)} owed</span>
                )}
              </div>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        {['Customer', 'Time', 'Total', 'Paid', 'Outstanding', 'Type'].map(h => (
                          <th key={h} className="text-left px-3 py-2.5 text-[11px] text-muted font-mono uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {daySales.map(s => (
                        <tr key={s.id} className="border-b border-border/10 hover:bg-white/[0.02]">
                          <td className="px-3 py-3 font-medium text-sm">
                            {s.customer_name}
                            {s.customer_phone && <div className="text-xs text-muted">{s.customer_phone}</div>}
                          </td>
                          <td className="px-3 py-3 text-soft text-xs font-mono">
                            {new Date(s.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-3 py-3 font-mono text-sm">{fmt(s.subtotal)}</td>
                          <td className="px-3 py-3 font-mono text-sm text-accent">{fmt(s.amount_paid)}</td>
                          <td className={`px-3 py-3 font-mono text-sm ${s.outstanding > 0 ? 'text-red' : 'text-muted'}`}>
                            {fmt(s.outstanding)}
                          </td>
                          <td className="px-3 py-3">
                            <Tag color={tagColor(s.payment_type) as 'green' | 'red' | 'yellow'}>
                              {s.payment_type === 'full' ? 'PAID' : s.payment_type === 'half' ? 'HALF' : 'CREDIT'}
                            </Tag>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )
        })
      }
    </div>
  )
}
