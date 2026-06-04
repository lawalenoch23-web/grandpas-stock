import { Card, Tag, EmptyState } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt } from '../../lib/utils'

export default function ManagerExpenses() {
  const { appState } = useAppState()

  const byDate: Record<string, typeof appState.expenses> = {}
  appState.expenses.forEach(e => {
    if (!byDate[e.date]) byDate[e.date] = []
    byDate[e.date].push(e)
  })
  const dates = Object.keys(byDate).sort().reverse()

  return (
    <div className="max-w-xl">
      <div className="font-display font-bold text-2xl mb-6">Staff Expenses</div>

      {dates.length === 0
        ? <EmptyState icon="🧾" text="No expenses recorded" />
        : dates.map(date => {
          const exps = byDate[date]
          const total = exps.reduce((s, e) => s + e.amount, 0)
          return (
            <Card key={date} className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <div className="font-display font-semibold">{date}</div>
                <Tag color="yellow">{fmt(total)}</Tag>
              </div>
              {exps.map(e => (
                <div key={e.id} className="flex justify-between text-sm py-2.5 border-b border-border/40 last:border-0">
                  <span className="text-soft">{e.description}</span>
                  <span className="font-mono text-yellow">{fmt(e.amount)}</span>
                </div>
              ))}
            </Card>
          )
        })
      }
    </div>
  )
}
