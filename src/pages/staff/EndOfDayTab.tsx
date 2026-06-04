import { useState } from 'react'
import { Btn, Card, Field, Input, StatCard } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt, today } from '../../lib/utils'

export default function EndOfDayTab() {
  const { appState, setAppState } = useAppState()
  const [openingStock, setOpeningStock] = useState('')
  const [supplyReceived, setSupplyReceived] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const todaySales = appState.sales.filter(s => s.created_at.startsWith(today()))
  const todayExpenses = appState.expenses.filter(e => e.date === today())
  const totalSalesValue = todaySales.reduce((s, sale) => s + sale.subtotal, 0)
  const totalExpenses = todayExpenses.reduce((s, e) => s + e.amount, 0)
  const totalOutstanding = todaySales.reduce((s, sale) => s + sale.outstanding, 0)

  const opening = parseFloat(openingStock) || 0
  const supply = parseFloat(supplyReceived) || 0
  const totalStock = opening + supply
  const closingStock = appState.products.reduce((s, p) => s + p.current_stock, 0)

  const alreadySubmitted = appState.reports.find(r => r.date === today())

  const handleSubmit = () => {
    const report = {
      id: Date.now(),
      date: today(),
      opening_stock: opening,
      supply_received: supply,
      total_stock: totalStock,
      closing_stock: closingStock,
      total_sales_value: totalSalesValue,
      total_expenses: totalExpenses,
      submitted_by: 'Staff',
      created_at: new Date().toISOString(),
    }
    setAppState(prev => ({ ...prev, reports: [...prev.reports, report] }))
    setSubmitted(true)
  }

  return (
    <div className="max-w-xl">
      <div className="font-display font-bold text-2xl mb-6">End of Day Report</div>

      {(submitted || alreadySubmitted) && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-accent text-sm mb-5">
          ✅ Report submitted to manager successfully!
        </div>
      )}

      <Card className="mb-5">
        <div className="font-display font-semibold mb-4">Stock Summary</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="OPENING STOCK (UNITS)">
            <Input
              type="number"
              value={openingStock}
              onChange={e => setOpeningStock(e.target.value)}
              placeholder="Enter opening stock"
            />
          </Field>
          <Field label="SUPPLY RECEIVED TODAY">
            <Input
              type="number"
              value={supplyReceived}
              onChange={e => setSupplyReceived(e.target.value)}
              placeholder="From manager"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2.5 mt-2">
          <div className="bg-bg rounded-lg p-3.5">
            <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Total Stock</div>
            <div className="text-2xl font-display font-bold text-accent">{totalStock}</div>
          </div>
          <div className="bg-bg rounded-lg p-3.5">
            <div className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Closing Stock</div>
            <div className="text-2xl font-display font-bold">{closingStock}</div>
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
        disabled={!!(submitted || alreadySubmitted)}
      >
        Submit Report to Manager →
      </Btn>
    </div>
  )
}
