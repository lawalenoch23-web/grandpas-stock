import { useState } from 'react'
import { Btn, Card, Field, Input, Select, Modal, Divider, EmptyState, Tag } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { fmt } from '../../lib/utils'
import * as db from '../../lib/db'

export default function ManageProducts() {
  const { appState, refresh } = useAppState()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editMinStock, setEditMinStock] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editUnit, setEditUnit] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const openEdit = (p: typeof appState.products[0]) => {
    setEditingId(p.id)
    setEditName(p.name)
    setEditPrice(p.retail_price.toString())
    setEditMinStock(p.minimum_stock.toString())
    setEditCategory(p.category)
    setEditUnit(p.unit_type)
  }

  const handleSave = async () => {
    if (!editingId) return
    setSaving(true)
    try {
      await db.updateProduct(editingId, {
        name: editName.trim(),
        retail_price: parseFloat(editPrice) || 0,
        minimum_stock: parseInt(editMinStock) || 5,
        category: editCategory,
        unit_type: editUnit,
      })
      await refresh()
      setEditingId(null)
    } catch {
      alert('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const categories = ['Soda', 'Water', 'Juice', 'Energy', 'Beer', 'Wine', 'Spirit', 'Other',
    ...Array.from(new Set(appState.products.map(p => p.category)))
  ].filter((v, i, a) => a.indexOf(v) === i)

  const filtered = appState.products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-2xl">
      <div className="font-display font-bold text-2xl mb-6">Manage Products</div>

      <div className="mb-5">
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..." className="max-w-xs" />
      </div>

      {filtered.length === 0
        ? <EmptyState icon="📦" text="No products found" />
        : filtered.map(p => {
          const isLow = p.current_stock < p.minimum_stock
          return (
            <Card key={p.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-display font-semibold">{p.name}</div>
                    <Tag color={isLow ? 'red' : 'gray'}>{p.category}</Tag>
                    {isLow && <Tag color="red">LOW</Tag>}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <div className="text-[10px] text-muted font-mono uppercase">Selling Price</div>
                      <div className="font-mono text-accent font-medium">{fmt(p.retail_price)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted font-mono uppercase">Stock</div>
                      <div className={`font-mono font-medium ${isLow ? 'text-red' : ''}`}>
                        {p.current_stock} {p.unit_type}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted font-mono uppercase">Min Alert</div>
                      <div className="font-mono text-muted">{p.minimum_stock}</div>
                    </div>
                  </div>
                </div>
                <Btn variant="ghost" size="sm" onClick={() => openEdit(p)}>Edit</Btn>
              </div>
            </Card>
          )
        })
      }

      {editingId && (
        <Modal title="Edit Product" onClose={() => setEditingId(null)}>
          <Field label="PRODUCT NAME">
            <Input value={editName} onChange={e => setEditName(e.target.value)} />
          </Field>
          <Field label="SELLING PRICE (₦)">
            <Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CATEGORY">
              <Select value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="UNIT TYPE">
              <Select value={editUnit} onChange={e => setEditUnit(e.target.value)}>
                {['Crate', 'Pack', 'Carton', 'Piece', 'Bottle', 'Can'].map(u =>
                  <option key={u} value={u}>{u}</option>
                )}
              </Select>
            </Field>
          </div>
          <Field label="MIN STOCK ALERT">
            <Input type="number" value={editMinStock} onChange={e => setEditMinStock(e.target.value)} />
          </Field>
          <Divider />
          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={() => setEditingId(null)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
