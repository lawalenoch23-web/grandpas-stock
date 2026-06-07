import { useState } from 'react'
import { Btn, Card, Field, Input, Select, Modal, Divider, EmptyState, Tag } from '../../components/ui'
import { useAppState, SupplyItem } from '../../hooks/useAppState'
import { fmt, today } from '../../lib/utils'
import * as db from '../../lib/db'

interface SupplyLineItem {
  productId: string
  qty: number
  pricePerUnit: string
  sellingPrice: string
}

type FilterPeriod = 'all' | 'today' | 'week' | 'month'

export default function ManagerSupply() {
  const { appState, refresh } = useAppState()
  const [showForm, setShowForm] = useState(false)
  const [supplierName, setSupplierName] = useState('')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [items, setItems] = useState<SupplyLineItem[]>([{ productId: '', qty: 1, pricePerUnit: '', sellingPrice: '' }])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterPeriod>('all')

  const addItem = () => setItems([...items, { productId: '', qty: 1, pricePerUnit: '', sellingPrice: '' }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof SupplyLineItem, val: string | number) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: val }
    // Auto-fill selling price from product's current retail price
    if (field === 'productId') {
      const prod = appState.products.find(p => p.id === parseInt(val as string))
      if (prod && prod.retail_price > 0) updated[i].sellingPrice = prod.retail_price.toString()
    }
    setItems(updated)
  }

  const totalCost = items.reduce((sum, it) => sum + (parseFloat(it.pricePerUnit) || 0) * (it.qty || 0), 0)

  const handleSubmit = async () => {
    if (!supplierName.trim()) return alert('Enter supplier name')
    const validItems = items.filter(it => it.productId && it.qty > 0)
    if (!validItems.length) return alert('Add at least one item')
    setSaving(true)
    try {
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

      await db.addSupply({
        invoice_no: invoiceNo.trim() || `INV-${Date.now().toString().slice(-6)}`,
        supplier_name: supplierName,
        items: supplyItems,
        total_cost: totalCost,
        date: today(),
      })

      // Update stock + selling price per product
      await Promise.all(validItems.map(it => {
        const prod = appState.products.find(p => p.id === parseInt(it.productId))
        if (!prod) return Promise.resolve()
        const updates: any = { current_stock: prod.current_stock + it.qty }
        if (it.sellingPrice && parseFloat(it.sellingPrice) > 0) {
          updates.retail_price = parseFloat(it.sellingPrice)
        }
        return db.updateProduct(prod.id, updates)
      }))

      await refresh()
      setSupplierName(''); setInvoiceNo('')
      setItems([{ productId: '', qty: 1, pricePerUnit: '', sellingPrice: '' }])
      setSuccess(true); setShowForm(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      alert('Failed to record supply')
    } finally {
      setSaving(false)
    }
  }

  const filterStart = () => {
    const now = new Date()
    if (filter === 'today') return today()
    if (filter === 'week') { const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] }
    if (filter === 'month') { const d = new Date(now); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0] }
    return '2000-01-01'
  }

  const filtered = [...appState.supplies]
    .filter(s => s.date >= filterStart())
    .filter(s => search === '' ||
      s.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      s.supplier_name.toLowerCase().includes(search.toLowerCase()))
    .reverse()

  const todayTotal = appState.supplies.filter(s => s.date === today()).reduce((sum, s) => sum + s.total_cost, 0)

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="font-display font-bold text-2xl">Supply / Purchases</div>
        <Btn onClick={() => setShowForm(true)}>+ Record Purchase</Btn>
      </div>

      {success && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-accent text-sm mb-5">
          ✅ Supply recorded, stock and prices updated!
        </div>
      )}

      {appState.supplies.filter(s => s.date === today()).length > 0 && (
        <div className="bg-card border border-border rounded-xl px-4 py-3 mb-5 flex justify-between items-center">
          <span className="text-sm text-soft">Today's total spend</span>
          <span className="font-mono text-yellow font-medium">{fmt(todayTotal)}</span>
        </div>
      )}

      <div className="flex gap-3 mb-5">
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by invoice no. or supplier..." className="flex-1" />
        <div className="flex gap-1.5">
          {(['all', 'today', 'week', 'month'] as FilterPeriod[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-mono uppercase border cursor-pointer transition-all
                ${filter === f ? 'bg-accent/10 border-accent/30 text-accent' : 'border-border text-muted hover:border-soft'}`}
            >{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0
        ? <EmptyState icon="🚚" text="No supply purchases found" />
        : filtered.map(s => (
          <Card key={s.id} className="mb-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-display font-semibold">{s.supplier_name}</div>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-muted font-mono">{s.date}</span>
                  <span className="text-xs text-accent font-mono">#{s.invoice_no}</span>
                </div>
              </div>
              <Tag color="yellow">{fmt(s.total_cost)}</Tag>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {['Product', 'Qty', 'Cost/Unit', 'Total'].map(h => (
                    <th key={h} className="text-left px-2 py-1.5 text-[10px] text-muted font-mono uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.items.map((item: any, i: number) => (
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="SUPPLIER NAME *">
              <Input value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="e.g. Coca Cola Distributor" />
            </Field>
            <Field label="INVOICE NUMBER">
              <Input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="e.g. INV-00123" />
            </Field>
          </div>
          <Divider />
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-semibold">Items Purchased</div>
            <Btn variant="soft" size="sm" onClick={addItem}>+ Add Item</Btn>
          </div>

          {items.map((item, i) => (
            <div key={i} className="mb-4 p-3 bg-bg rounded-xl border border-border">
              <div className="grid gap-2.5 mb-2.5" style={{ gridTemplateColumns: '1fr 80px 36px' }}>
                <Field label="PRODUCT" className="mb-0">
                  <Select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                    <option value="">Select product</option>
                    {appState.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                </Field>
                <Field label="QTY" className="mb-0">
                  <Input type="number" min={1} value={item.qty} onChange={e => updateItem(i, 'qty', parseInt(e.target.value))} />
                </Field>
                <button onClick={() => removeItem(i)}
                  className="bg-red/10 border-none text-red w-9 h-10 rounded-lg text-base cursor-pointer hover:bg-red/20 self-end">×</button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="COST PRICE/UNIT (₦)" className="mb-0">
                  <Input type="number" value={item.pricePerUnit}
                    onChange={e => updateItem(i, 'pricePerUnit', e.target.value)} placeholder="What you paid" />
                </Field>
                <Field label="SELLING PRICE/UNIT (₦)" className="mb-0">
                  <Input type="number" value={item.sellingPrice}
                    onChange={e => updateItem(i, 'sellingPrice', e.target.value)} placeholder="Auto-filled from product" />
                </Field>
              </div>
              {item.sellingPrice && (
                <div className="text-xs text-accent mt-1.5 font-mono">
                  This will update the product's selling price to {fmt(parseFloat(item.sellingPrice) || 0)}
                </div>
              )}
            </div>
          ))}

          <div className="bg-surface rounded-lg px-4 py-3 flex justify-between font-mono mt-3 mb-5">
            <span className="text-muted">TOTAL COST</span>
            <span className="text-yellow font-medium">{fmt(totalCost)}</span>
          </div>
          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
            <Btn onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Record Purchase →'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
