import { useState } from 'react'
import { Card, Tag, Input, EmptyState } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt } from '../../lib/utils'

export default function ManagerSales() {
  const { appState } = useAppState()
  const [search, setSearch] = useState('')

  const filtered = [...appState.sales]
    .filter(s => s.customer_name.toLowerCase().includes(search.toLowerCase()))
    .reverse()

  const tagColor = (type: string) => {
    if (type === 'full') return 'green'
    if (type === 'half') return 'yellow'
    return 'red'
  }

  return (
    <div>
      <div className="font-display font-bold text-2xl mb-6">All Sales</div>
      <div className="mb-4">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer name..."
          className="max-w-xs"
        />
      </div>

      {filtered.length === 0
        ? <EmptyState icon="💰" text="No sales recorded yet" />
        : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {['ID', 'Customer', 'Date', 'Total', 'Paid', 'Outstanding', 'Type'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-[11px] text-muted font-mono uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className="border-b border-border/10 hover:bg-white/[0.02]">
                      <td className="px-3 py-3 font-mono text-[11px] text-muted">#{s.id.toString().slice(-6)}</td>
                      <td className="px-3 py-3 font-medium text-sm">{s.customer_name}</td>
                      <td className="px-3 py-3 text-soft text-sm">
                        {new Date(s.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        {' '}
                        <span className="text-muted text-xs">
                          {new Date(s.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
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
        )
      }
    </div>
  )
}
