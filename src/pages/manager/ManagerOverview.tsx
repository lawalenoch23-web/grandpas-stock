import { Card, StatCard } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt, today } from '../../lib/utils'

export default function ManagerOverview() {
  const { appState } = useAppState()

  const todaySales = appState.sales.filter(s => s.created_at.startsWith(today()))
  const totalRevenue = todaySales.reduce((s, sale) => s + sale.amount_paid, 0)
  const totalOutstanding = appState.outstandingBalances
    .filter(b => !b.is_paid)
    .reduce((s, b) => s + b.amount, 0)
  const totalExpenses = appState.expenses
    .filter(e => e.date === today())
    .reduce((s, e) => s + e.amount, 0)
  const lowStock = appState.products.filter(p => p.current_stock < p.minimum_stock)
  const latestReport = appState.reports[appState.reports.length - 1]

  return (
    <div>
      <div className="font-display font-bold text-2xl mb-6">Manager Overview</div>

      <div className="grid gap-3.5 mb-7" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        <StatCard label="TODAY'S REVENUE" value={fmt(totalRevenue)} sub="cash collected" accent="text-accent" />
        <StatCard label="OUTSTANDING" value={fmt(totalOutstanding)} sub="to be collected" accent="text-red" />
        <StatCard label="TODAY'S EXPENSES" value={fmt(totalExpenses)} accent="text-yellow" />
        <StatCard label="SALES TODAY" value={todaySales.length} sub="transactions" />
      </div>

      {lowStock.length > 0 && (
        <Card className="mb-5 border-red/30">
          <div className="font-display font-semibold text-red mb-3">⚠️ Low Stock Alerts</div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(p => (
              <div key={p.id} className="bg-red/10 border border-red/20 rounded-lg px-3.5 py-2">
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-red font-mono">{p.current_stock} left (min: {p.minimum_stock})</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {latestReport && (
        <Card>
          <div className="font-display font-semibold mb-4">
            Latest Report
            <span className="ml-2 text-sm font-sans font-normal text-muted">— {latestReport.date}</span>
          </div>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
            {[
              ['Opening', latestReport.opening_stock],
              ['Supply In', latestReport.supply_received],
              ['Total', latestReport.total_stock],
              ['Closing', latestReport.closing_stock],
            ].map(([l, v]) => (
              <div key={l as string} className="bg-bg rounded-lg p-3.5 text-center">
                <div className="text-[10px] text-muted font-mono uppercase mb-1">{l}</div>
                <div className="text-xl font-display font-bold">{v}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {appState.reports.length === 0 && lowStock.length === 0 && todaySales.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-4xl mb-3">📊</div>
          <div className="text-muted text-sm">No activity yet today. Reports will appear here once staff submit them.</div>
        </Card>
      )}
    </div>
  )
}
