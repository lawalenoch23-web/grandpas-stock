import { useState } from 'react'
import { Btn, Card, Tag, Field, Input, EmptyState, Divider } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt } from '../../lib/utils'

export default function OutstandingBalances() {
  const { appState, setAppState } = useAppState()
  const [markingId, setMarkingId] = useState<number | null>(null)
  const [payAmount, setPayAmount] = useState('')

  const unpaid = appState.outstandingBalances.filter(b => !b.is_paid)
  const total = unpaid.reduce((s, b) => s + b.amount, 0)

  const recordPayment = (id: number) => {
    const amt = parseFloat(payAmount)
    setAppState(prev => ({
      ...prev,
      outstandingBalances: prev.outstandingBalances.map(b => {
        if (b.id !== id) return b
        const newAmt = b.amount - (amt || b.amount)
        return {
          ...b,
          amount: Math.max(0, newAmt),
          amount_paid: b.amount_paid + (amt || b.amount),
          is_paid: newAmt <= 0,
          updated_at: new Date().toISOString(),
        }
      }),
    }))
    setMarkingId(null)
    setPayAmount('')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="font-display font-bold text-2xl">Outstanding Balances</div>
        <Tag color="red">Total Owed: {fmt(total)}</Tag>
      </div>

      {unpaid.length === 0
        ? <EmptyState icon="✅" text="No outstanding balances — all clear!" />
        : unpaid.map(b => (
          <Card key={b.id} className="mb-3 border-red/20">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-display font-semibold text-base mb-1">{b.customer_name}</div>
                {b.customer_phone && (
                  <div className="text-sm text-muted mb-1">📞 {b.customer_phone}</div>
                )}
                <div className="text-[11px] text-muted font-mono">Since {b.date} · Sale #{b.sale_id.toString().slice(-6)}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-2xl text-red">{fmt(b.amount)}</div>
                <div className="text-xs text-muted mb-2">outstanding</div>
                <Btn variant="soft" size="sm" onClick={() => setMarkingId(b.id)}>
                  Record Payment
                </Btn>
              </div>
            </div>

            {markingId === b.id && (
              <>
                <Divider />
                <div className="flex gap-2.5 items-end">
                  <Field label="AMOUNT BEING PAID (₦)" className="flex-1 mb-0">
                    <Input
                      type="number"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      placeholder={`Up to ${fmt(b.amount)}`}
                    />
                  </Field>
                  <Btn onClick={() => recordPayment(b.id)}>Confirm</Btn>
                  <Btn variant="ghost" onClick={() => setMarkingId(null)}>Cancel</Btn>
                </div>
              </>
            )}
          </Card>
        ))
      }
    </div>
  )
}
