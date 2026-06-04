import { useState } from 'react'
import { Btn, Card, Field, Input, Tag, EmptyState } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt, today, nowTime } from '../../lib/utils'

export default function ExpensesTab() {
  const { appState, setAppState } = useAppState()
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')

  const todayExpenses = appState.expenses.filter(e => e.date === today())
  const total = todayExpenses.reduce((s, e) => s + e.amount, 0)

  const addExpense = () => {
    if (!desc.trim() || !amount) return
    setAppState(prev => ({
      ...prev,
      expenses: [...prev.expenses, {
        id: Date.now(),
        description: desc,
        amount: parseFloat(amount),
        date: today(),
        created_at: new Date().toISOString(),
      }],
    }))
    setDesc('')
    setAmount('')
  }

  return (
    <div className="max-w-lg">
      <div className="font-display font-bold text-2xl mb-6">Expenses</div>

      <Card className="mb-5">
        <div className="font-display font-semibold mb-4">Log Expense</div>
        <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 140px' }}>
          <Field label="DESCRIPTION">
            <Input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="e.g. Delivery fare"
              onKeyDown={e => e.key === 'Enter' && addExpense()}
            />
          </Field>
          <Field label="AMOUNT (₦)">
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              onKeyDown={e => e.key === 'Enter' && addExpense()}
            />
          </Field>
        </div>
        <Btn onClick={addExpense} className="mt-1">Add Expense</Btn>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="font-display font-semibold">Today's Expenses</div>
          <Tag color="yellow">{fmt(total)}</Tag>
        </div>

        {todayExpenses.length === 0
          ? <EmptyState icon="🧾" text="No expenses logged today" />
          : todayExpenses.map(e => (
            <div key={e.id} className="flex justify-between items-center py-3 border-b border-border last:border-0">
              <div>
                <div className="font-medium text-sm mb-0.5">{e.description}</div>
                <div className="text-[11px] text-muted font-mono">
                  {new Date(e.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="font-mono text-yellow">{fmt(e.amount)}</div>
            </div>
          ))
        }
      </Card>
    </div>
  )
}
