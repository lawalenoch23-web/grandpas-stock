import { Card, Tag, EmptyState, Divider } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt } from '../../lib/utils'

export default function ManagerReports() {
  const { appState } = useAppState()
  const reports = [...appState.reports].reverse()

  return (
    <div>
      <div className="font-display font-bold text-2xl mb-6">Daily Reports</div>
      {reports.length === 0
        ? <EmptyState icon="📋" text="No reports submitted yet" />
        : reports.map(r => (
          <Card key={r.id} className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="font-display font-semibold text-base">{r.date}</div>
                <div className="text-xs text-muted mt-0.5">
                  {appState.sales.filter(s => s.created_at.startsWith(r.date)).length} sales · {fmt(r.total_sales_value)}
                </div>
              </div>
              <Tag color="green">SUBMITTED</Tag>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                ['Opening', r.opening_stock],
                ['Supply', r.supply_received],
                ['Total', r.total_stock],
                ['Closing', r.closing_stock],
              ].map(([l, v]) => (
                <div key={l as string} className="bg-bg rounded-lg p-3 text-center">
                  <div className="text-[10px] text-muted font-mono uppercase mb-1">{l}</div>
                  <div className="text-lg font-display font-bold">{v}</div>
                </div>
              ))}
            </div>
            {r.total_expenses > 0 && (
              <>
                <Divider />
                <div className="text-sm text-muted">
                  Expenses:{' '}
                  <span className="text-yellow font-mono">{fmt(r.total_expenses)}</span>
                </div>
              </>
            )}
          </Card>
        ))
      }
    </div>
  )
}
