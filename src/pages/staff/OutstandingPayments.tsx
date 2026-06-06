import { useState } from 'react'
import { Btn, Card, Field, Input, Tag, EmptyState, Divider } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt } from '../../lib/utils'
import * as db from '../../lib/db'

export default function OutstandingPayments() {
  const { appState, refresh } = useAppState()
  const [markingId, setMarkingId] = useState<number | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const unpaid = appState.outstandingBalances.filter(b => !b.is_paid)
  const total = unpaid.reduce((s, b) => s + b.amount, 0)

  const recordPayment = async (id: number, currentAmount: number, currentAmountPaid: number) => {
    const amt = parseFloat(payAmount) || currentAmount
    const newAmt = Math.max(0, currentAmount - amt)
    setSaving(true)
    try {
      await db.updateOutstandingBalance(id, {
        amount: newAmt,
        amount_paid: currentAmountPaid + amt,
        is_paid: newAmt <= 0,
      })
      await refresh()
      setMarkingId(null)
      setPayAmount('')
    } catch (err) {
      alert('Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="font-display font-bold text-2xl">Outstanding Payments</div>
        {unpaid.length > 0 && <Tag color="red">Total: {fmt(total)}</Tag>}
      </div>

      {unpaid.length === 0
        ? <EmptyState icon="✅" text="No outstanding balances — all clear!" />
        : unpaid.map(b => (
          <Card key={b.id} className="mb-3 border-red/20">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-display font-semibold text-base mb-1">{b.customer_name}</div>
                {b.customer_phone && <div className="text-sm text-muted mb-1">📞 {b.customer_phone}</div>}
                <div className="text-[11px] text-muted font-mono">Since {b.date}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-2xl text-red">{fmt(b.amount)}</div>
                <div className="text-xs text-muted mb-2">outstanding</div>
                <Btn variant="soft" size="sm" onClick={() => setMarkingId(b.id)}>Record Payment</Btn>
              </div>
            </div>
            {markingId === b.id && (
              <>
                <Divider />
                <div className="flex gap-2.5 items-end">
                  <Field label="AMOUNT BEING PAID (₦)" className="flex-1 mb-0">
                    <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                      placeholder={`Up to ${fmt(b.amount)}`} />
                  </Field>
                  <Btn onClick={() => recordPayment(b.id, b.amount, b.amount_paid)} disabled={saving}>
                    {saving ? '...' : 'Confirm'}
                  </Btn>
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
