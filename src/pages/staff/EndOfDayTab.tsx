import { useState } from 'react'
import { Btn, Card, StatCard } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt, today } from '../../lib/utils'
import * as db from '../../lib/db'

export default function EndOfDayTab() {
  const { appState, refresh } = useAppState()
  const [saving, setSaving] = useState(false)

  const todaySales = appState.sales.filter(s => s.created_at.startsWith(today()))
  const todayExpenses = appState.expenses.filter(e => e.date === today())
  const totalSalesValue = todaySales.reduce((s, sale) => s + sale.subtotal, 0)
  const totalExpenses = todayExpenses.reduce((s, e) => s + e.amount, 0)
  const totalOutstanding = todaySales.reduce((s, sale) => s + sale.outstanding, 0)

  // Supply received today from manager
  const todaySupplyUnits = appState.supplies
    .filter(s => s.date === today())
    .reduce((sum, s) => sum + s.items.reduce((a: number, i: any) => a + i.qty, 0), 0)

  // Opening stock = closing stock from yesterday's report
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const yesterdayReport = appState.reports.find(r => r.date === yesterdayStr)

  // Also check today's report (in case initial setup was done today)
  const todayReport = appState.reports.find(r => r.date === today())
  const alreadySubmitted = todayReport && todayReport.submitted_by !== 'Manager (Initial Setup)'

  // Opening stock: yesterday closing → or today's initial setup closing → or 0
  const openingStock = yesterdayReport
    ? yesterdayReport.closing_stock
    : todayReport
      ? todayReport.closing_stock
      : 0

  const openingLabel = yesterdayReport
    ? `from ${yesterdayStr}`
    : todayReport
      ? 'from initial setup'
      : 'no baseline set'

  // Units sold today
  const unitsSoldToday = todaySales.reduce(
    (sum, sale) => sum + sale.items.reduce((a: number, i: any) => a + Number(i.qty), 0), 0
  )

  const totalStock = openingStock + todaySupplyUnits
  const closingStock = Math.max(0, totalStock - unitsSoldToday)

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await db.addReport({
        date: today(),
        opening_stock: openingStock,
        supply_received: todaySupplyUnits,
        total_stock: totalStock,
        closing_stock: closingStock,
        total_sales_value: totalSalesValue,
        total_expenses: totalExpenses,
        submitted_by: 'Staff',
      })
      await refresh()
    } catch {
      alert('Failed to submit report. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="font-display font-bold text-2xl mb-6">End of Day Report</div>

      {alreadySubmitted && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-accent text-sm mb-5">
          ✅ Report submitted to manager successfully!
        </div>
      )}

      {!yesterdayReport && !todayReport && (
        <div className="bg-yellow/10 border border-yellow/20 rounded-xl px-4 py-3 text-yellow text-sm mb-5">
          ⚠️ No stock baseline set yet. Ask manager to set initial stock in Settings.
        </div>
      )}

      <Card className="mb-5">
        <div className="font-display font-semibold mb-4">Stock Summary</div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-bg rounded-lg p-3.5">
            <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Opening Stock</div>
            <div className="text-2xl font-display font-bold">{openingStock}</div>
            <div className="text-[10px] text-muted mt-1">{openingLabel}</div>
          </div>
          <div className="bg-bg rounded-lg p-3.5">
            <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Supply In</div>
            <div className="text-2xl font-display font-bold text-accent">{todaySupplyUnits}</div>
            <div className="text-[10px] text-muted mt-1">from manager</div>
          </div>
          <div className="bg-bg rounded-lg p-3.5">
            <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Total Stock</div>
            <div className="text-2xl font-display font-bold">{totalStock}</div>
            <div className="text-[10px] text-muted mt-1">opening + supply</div>
          </div>
          <div className="bg-bg rounded-lg p-3.5 border border-accent/20">
            <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Closing Stock</div>
            <div className="text-2xl font-display font-bold text-yellow">{closingStock}</div>
            <div className="text-[10px] text-muted mt-1">total − {unitsSoldToday} sold</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3.5 mb-6">
        <StatCard label="SALES TODAY" value={todaySales.length} sub="transactions" />
        <StatCard label="SALES VALUE" value={fmt(totalSalesValue)} accent="text-accent" />
        <StatCard label="EXPENSES" value={fmt(totalExpenses)} accent="text-yellow" />
        <StatCard label="OUTSTANDING" value={fmt(totalOutstanding)} accent="text-red" />
      </div>

      <Btn
        onClick={handleSubmit}
        size="lg"
        className="w-full"
        disabled={!!(saving || alreadySubmitted)}
      >
        {saving ? 'Submitting...' : 'Submit Report to Manager →'}
      </Btn>
    </div>
  )
}
