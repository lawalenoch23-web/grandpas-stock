import { useState } from 'react'
import { Btn, Card, Field, Input, Select, Modal, Divider } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt, today } from '../../lib/utils'
import { PaymentType, SaleItem } from '../../types'

interface SaleLineItem {
  productId: string
  qty: number
  price: string
}

export default function SaleForm() {
  const { appState, setAppState } = useAppState()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentType, setPaymentType] = useState<PaymentType>('full')
  const [amountPaid, setAmountPaid] = useState('')
  const [items, setItems] = useState<SaleLineItem[]>([{ productId: '', qty: 1, price: '' }])
  const [success, setSuccess] = useState(false)

  // Add product modal
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newCustomCategory, setNewCustomCategory] = useState('')
  const [newUnit, setNewUnit] = useState('Crate')
  const [newMinStock, setNewMinStock] = useState('5')
  const [newPrice, setNewPrice] = useState('')

  const categories = ['Soda', 'Water', 'Juice', 'Energy', 'Beer', 'Wine', 'Spirit', 'Other',
    ...Array.from(new Set(appState.products.map(p => p.category)))
  ].filter((v, i, a) => a.indexOf(v) === i)

  const addItem = () => setItems([...items, { productId: '', qty: 1, price: '' }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))

  const updateItem = (i: number, field: keyof SaleLineItem, val: string | number) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: val }
    // Auto-fill price from product's fixed retail_price when product is selected
    if (field === 'productId') {
      const prod = appState.products.find(p => p.id === parseInt(val as string))
      if (prod && prod.retail_price > 0) {
        updated[i].price = prod.retail_price.toString()
      }
    }
    setItems(updated)
  }

  const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.price) || 0) * (it.qty || 0), 0)
  const paid = parseFloat(amountPaid) || 0
  const outstanding =
    paymentType === 'full' ? 0 :
    paymentType === 'half' ? subtotal - paid :
    subtotal

  const handleAddProduct = () => {
    const category = newCategory === 'Other' ? newCustomCategory : newCategory
    if (!newName.trim() || !category) return alert('Enter product name and category')
    const newProduct = {
      id: Date.now(),
      name: newName.trim(),
      category,
      unit_type: newUnit,
      units_per_crate: 12,
      cost_price: 0,
      wholesale_price: 0,
      retail_price: parseFloat(newPrice) || 0,
      current_stock: 0,
      minimum_stock: parseInt(newMinStock) || 5,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    setAppState(prev => ({ ...prev, products: [...prev.products, newProduct] }))
    setNewName(''); setNewCategory(''); setNewCustomCategory('')
    setNewUnit('Crate'); setNewMinStock('5'); setNewPrice('')
    setShowAddProduct(false)
  }

  const handleSubmit = () => {
    if (!customerName.trim()) return alert('Enter customer name')
    const validItems = items.filter(it => it.productId && it.qty > 0 && it.price)
    if (!validItems.length) return alert('Add at least one product')

    const saleItems: SaleItem[] = validItems.map(it => ({
      product_id: parseInt(it.productId),
      product_name: appState.products.find(p => p.id === parseInt(it.productId))?.name || '',
      qty: it.qty,
      unit: appState.products.find(p => p.id === parseInt(it.productId))?.unit_type || '',
      price: parseFloat(it.price),
      cost: appState.products.find(p => p.id === parseInt(it.productId))?.cost_price || 0,
    }))

    const amtPaid = paymentType === 'full' ? subtotal : paid
    const outstandingAmt = paymentType === 'full' ? 0 : paymentType === 'credit' ? subtotal : subtotal - paid

    const sale = {
      id: Date.now(),
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_type: 'retail' as const,
      items: saleItems,
      subtotal,
      discount_amount: 0,
      total_price: subtotal,
      total_cost: saleItems.reduce((s, i) => s + i.cost * i.qty, 0),
      gross_profit: subtotal - saleItems.reduce((s, i) => s + i.cost * i.qty, 0),
      payment_type: paymentType,
      payment_method: 'cash',
      payment_status: paymentType === 'full' ? 'paid' : paymentType === 'credit' ? 'unpaid' : 'partial',
      amount_paid: amtPaid,
      outstanding: outstandingAmt,
      staff_name: 'Staff',
      created_at: new Date().toISOString(),
    }

    const updatedProducts = appState.products.map(p => {
      const item = validItems.find(it => parseInt(it.productId) === p.id)
      if (item) return { ...p, current_stock: Math.max(0, p.current_stock - item.qty) }
      return p
    })

    setAppState(prev => ({
      ...prev,
      sales: [...prev.sales, sale],
      products: updatedProducts,
      outstandingBalances: outstandingAmt > 0
        ? [...prev.outstandingBalances, {
            id: Date.now(),
            sale_id: sale.id,
            customer_name: customerName,
            customer_phone: customerPhone,
            amount: outstandingAmt,
            amount_paid: amtPaid,
            is_paid: false,
            date: today(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]
        : prev.outstandingBalances,
    }))

    setSuccess(true)
    setCustomerName(''); setCustomerPhone(''); setPaymentType('full')
    setAmountPaid(''); setItems([{ productId: '', qty: 1, price: '' }])
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="font-display font-bold text-2xl">Record a Sale</div>
        <Btn variant="soft" size="sm" onClick={() => setShowAddProduct(true)}>+ Add Product</Btn>
      </div>

      {success && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-accent text-sm mb-5">
          ✅ Sale recorded successfully!
        </div>
      )}

      <Card className="mb-5">
        <div className="font-display font-semibold mb-4">Customer Info</div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="CUSTOMER NAME *">
            <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Emeka Eze" />
          </Field>
          <Field label="PHONE (OPTIONAL)">
            <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="080..." />
          </Field>
        </div>
      </Card>

      <Card className="mb-5">
        <div className="flex justify-between items-center mb-4">
          <div className="font-display font-semibold">Items</div>
          <Btn variant="soft" size="sm" onClick={addItem}>+ Add Item</Btn>
        </div>

        {items.map((item, i) => (
          <div key={i} className="grid gap-2.5 mb-2.5 items-end" style={{ gridTemplateColumns: '1fr 80px 140px 36px' }}>
            <Field label={i === 0 ? 'PRODUCT' : ''} className="mb-0">
              <Select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                <option value="">Select product</option>
                {appState.products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.current_stock} left)</option>
                ))}
              </Select>
            </Field>
            <Field label={i === 0 ? 'QTY' : ''} className="mb-0">
              <Input type="number" min={1} value={item.qty}
                onChange={e => updateItem(i, 'qty', parseInt(e.target.value))} />
            </Field>
            <Field label={i === 0 ? 'PRICE/UNIT (₦)' : ''} className="mb-0">
              <Input
                type="number"
                value={item.price}
                onChange={e => updateItem(i, 'price', e.target.value)}
                placeholder="Auto-filled"
              />
            </Field>
            <button onClick={() => removeItem(i)}
              className="bg-red/10 border-none text-red w-9 h-10 rounded-lg text-base cursor-pointer hover:bg-red/20 transition-colors self-end"
            >×</button>
          </div>
        ))}

        <div className="bg-bg rounded-lg px-4 py-3 flex justify-between font-mono mt-2">
          <span className="text-muted">SUBTOTAL</span>
          <span className="text-accent font-medium">{fmt(subtotal)}</span>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="font-display font-semibold mb-4">Payment</div>
        <div className="flex gap-2.5 mb-4">
          {([
            { id: 'full', label: 'Full Payment' },
            { id: 'half', label: 'Half Credit' },
            { id: 'credit', label: 'Full Credit' },
          ] as { id: PaymentType; label: string }[]).map(p => (
            <button key={p.id} onClick={() => setPaymentType(p.id)}
              className={`flex-1 py-2.5 px-2 rounded-lg border text-sm transition-all cursor-pointer
                ${paymentType === p.id
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-transparent text-soft hover:border-soft'
                }`}
            >{p.label}</button>
          ))}
        </div>

        {paymentType === 'half' && (
          <Field label="AMOUNT PAID NOW (₦)">
            <Input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="0" />
          </Field>
        )}

        {paymentType !== 'full' && (
          <div className="bg-red/10 border border-red/20 rounded-lg px-4 py-2.5 text-red text-sm font-mono">
            OUTSTANDING: {fmt(outstanding)}
          </div>
        )}
      </Card>

      <Btn onClick={handleSubmit} size="lg" className="w-full">Record Sale →</Btn>

      {showAddProduct && (
        <Modal title="Add New Product" onClose={() => setShowAddProduct(false)}>
          <Field label="PRODUCT NAME *">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Amstel Malt" />
          </Field>
          <Field label="FIXED SELLING PRICE (₦) *">
            <Input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="e.g. 3500" />
          </Field>
          <Field label="CATEGORY *">
            <Select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          {newCategory === 'Other' && (
            <Field label="CUSTOM CATEGORY NAME">
              <Input value={newCustomCategory} onChange={e => setNewCustomCategory(e.target.value)} placeholder="Enter category name" />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="UNIT TYPE">
              <Select value={newUnit} onChange={e => setNewUnit(e.target.value)}>
                <option value="Crate">Crate</option>
                <option value="Pack">Pack</option>
                <option value="Carton">Carton</option>
                <option value="Piece">Piece</option>
                <option value="Bottle">Bottle</option>
                <option value="Can">Can</option>
              </Select>
            </Field>
            <Field label="MIN STOCK ALERT">
              <Input type="number" value={newMinStock} onChange={e => setNewMinStock(e.target.value)} placeholder="5" />
            </Field>
          </div>
          <Divider />
          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={() => setShowAddProduct(false)}>Cancel</Btn>
            <Btn onClick={handleAddProduct}>Add Product</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
