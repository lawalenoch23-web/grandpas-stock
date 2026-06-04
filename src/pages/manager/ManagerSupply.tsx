import { useState } from 'react'
import { Btn, Card, Field, Input, Select, Modal, Divider, EmptyState, Tag } from '../../components/ui'
import { useAppState, SupplyItem } from '../../hooks/useAppState'
import { fmt, today } from '../../lib/utils'

interface SupplyLineItem {
  productId: string
  qty: number
  pricePerUnit: string
}

export default function ManagerSupply() {
  const { appState, setAppState } = useAppState()
  const [showForm, setShowForm] = useState(false)
  const [supplierName, setSupplierName] = useState('')
  const [items, setItems] = useState<SupplyLineItem[]>([{ productId: '', qty: 1, pricePerUnit: '' }])
  const [success, setSuccess] = useState(false)

  const addItem = () => setItems([...items, { productId: '', qty: 1, pricePerUnit: '' }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof SupplyLineItem, val: string | number) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: val }
    setItems(updated)
  }

  const totalCost = items.reduce(
    (sum, it) => sum + (parseFloat(it.pricePerUnit) || 0) * (it.qty || 0), 0
  )

  const handleSubmit = () => {
    if (!supplierName.trim()) return alert('Enter supplier name')
    const validItems = items.filter(it => it.productId && it.qty > 0)
    if (!validItems.length) return alert('Add at least one item')

    const supplyItems: SupplyItem[] = validItems.map(it => {
      const product = appState.products.find(p => p.id === parseInt(it.productId))
      return {
        product_id: parseInt(it.productId),
        product_name: product?.name || '',
        qty: it.qty,
        unit: product?.unit_type || '',
        price_per_unit: parseFloat(it.pricePerUnit) || 0,
        total_cost: (parseFloat(it.pricePerUnit) || 0) * it.qty,
      }
    })

    // Update product stock
    const updatedProducts = appState.products.map(p => {
      const item = validItems.find(it => parseInt(it.productId) === p.id)
      if (item) return { ...p, current_stock: p.current_stock + item.qty }
      return p
    })

    setAppState(prev => ({
      ...prev,
      products: updatedProducts,
      supplies: [...prev.supplies, {
        id: Date.now(),
        supplier_name: supplierName,
        items: supplyItems,
        total_cost: totalCost,
        date: today(),
        created_at: new Date().toISOString(),
      }],
    }))

    setSupplierName(''); setItems([{ productId: '', qty: 1, pricePerUnit: '' }])
    setSuccess(true); setShowForm(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  const supplies = [...appState.supplies].reverse()
  const todayTotal = appState.supplies
    .filter(s => s.date === today())
    .reduce((sum, s) => sum + s.total_cost, 0)

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="font-display font-bold text-2xl">Supply / Purchases</div>
        <Btn onClick={() => setShowForm(true)}>+ Record Purchase</Btn>
      </div>

      {success && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-accent text-sm mb-5">
          ✅ Supply recorded and stock updated!
        </div>
      )}

      {appState.supplies.filter(s => s.date === today()).length > 0 && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 mb-5 flex justify-between items-center">
          <span className="text-sm text-soft">Today's total spend</span>
          <span className="font-mono text-yellow font-medium">{fmt(todayTotal)}</span>
        </div>
      )}

      {supplies.length === 0
        ? <EmptyState icon="🚚" text="No supply purchases recorded yet" />
        : supplies.map(s => (
          <Card key={s.id} className="mb-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-display font-semibold">{s.supplier_name}</div>
                <div className="text-xs text-muted font-mono mt-0.5">{s.date}</div>
              </div>
              <Tag color="yellow">{fmt(s.total_cost)}</Tag>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {['Product', 'Qty', 'Unit Price', 'Total'].map(h => (
                    <th key={h} className="text-left px-2 py-1.5 text-[10px] text-muted font-mono uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.items.map((item, i) => (
                  <tr key={i} className="border-b border-border/10">
                    <td className="px-2 py-2 text-sm">{item.product_name}</td>
                    <td className="px-2 py-2 text-sm font-mono">{item.qty} {item.unit}</td>
                    <td className="px-2 py-2 text-sm font-mono">{fmt(item.price_per_unit)}</td>
                    <td className="px-2 py-2 text-sm font-mono text-accent">{fmt(item.total_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))
      }

      {showForm && (
        <Modal title="Record Supply Purchase" onClose={() => setShowForm(false)} width="max-w-2xl">
          <Field label="SUPPLIER NAME *">
            <Input value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="e.g. Coca Cola Distributor" />
          </Field>

          <Divider />

          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-semibold">Items Purchased</div>
            <Btn variant="soft" size="sm" onClick={addItem}>+ Add Item</Btn>
          </div>

          {items.map((item, i) => (
            <div key={i} className="grid gap-2.5 mb-2.5 items-end" style={{ gridTemplateColumns: '1fr 80px 130px 36px' }}>
              <Field label={i === 0 ? 'PRODUCT' : ''} className="mb-0">
                <Select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                  <option value="">Select product</option>
                  {appState.products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label={i === 0 ? 'QTY' : ''} className="mb-0">
                <Input type="number" min={1} value={item.qty} onChange={e => updateItem(i, 'qty', parseInt(e.target.value))} />
              </Field>
              <Field label={i === 0 ? 'PRICE PER UNIT (₦)' : ''} className="mb-0">
                <Input type="number" value={item.pricePerUnit} onChange={e => updateItem(i, 'pricePerUnit', e.target.value)} placeholder="0" />
              </Field>
              <button
                onClick={() => removeItem(i)}
                className="bg-red/10 border-none text-red w-9 h-10 rounded-lg text-base cursor-pointer hover:bg-red/20 self-end"
              >×</button>
            </div>
          ))}

          <div className="bg-bg rounded-lg px-4 py-3 flex justify-between font-mono mt-3 mb-5">
            <span className="text-muted">TOTAL COST</span>
            <span className="text-yellow font-medium">{fmt(totalCost)}</span>
          </div>

          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
            <Btn onClick={handleSubmit}>Record Purchase →</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
