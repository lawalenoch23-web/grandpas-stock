import { Card, Tag, EmptyState } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import { today } from '../../lib/utils'

export default function StockView() {
  const { appState } = useAppState()
  const low = appState.products.filter(p => p.current_stock < p.minimum_stock)

  // Supply received today per product
  const todaySupplyByProduct: Record<number, number> = {}
  appState.supplies
    .filter(s => s.date === today())
    .forEach(supply => {
      supply.items.forEach(item => {
        todaySupplyByProduct[item.product_id] =
          (todaySupplyByProduct[item.product_id] || 0) + item.qty
      })
    })

  return (
    <div className="max-w-2xl">
      <div className="font-display font-bold text-2xl mb-6">Stock Levels</div>

      {low.length > 0 && (
        <div className="bg-red/10 border border-red/20 rounded-xl px-4 py-3 mb-5 text-red text-sm">
          ⚠️ {low.length} product{low.length > 1 ? 's' : ''} running low:{' '}
          {low.map(p => p.name).join(', ')}
        </div>
      )}

      <Card>
        {appState.products.length === 0
          ? <EmptyState icon="📦" text="No products yet — add one from the New Sale tab" />
          : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {['Product', 'Category', 'Unit', 'Stock', 'Supply Today', 'Status'].map(h => (
                    <th key={h} className="text-left px-3.5 py-2.5 text-[11px] text-muted font-mono uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appState.products.map(p => {
                  const supplyToday = todaySupplyByProduct[p.id] || 0
                  const isLow = p.current_stock < p.minimum_stock
                  return (
                    <tr key={p.id} className="border-b border-border/10 hover:bg-white/[0.02]">
                      <td className="px-3.5 py-3 font-medium">{p.name}</td>
                      <td className="px-3.5 py-3 text-soft text-sm">{p.category}</td>
                      <td className="px-3.5 py-3 text-soft text-sm">{p.unit_type}</td>
                      <td className="px-3.5 py-3 font-mono">{p.current_stock}</td>
                      <td className="px-3.5 py-3 font-mono">
                        {supplyToday > 0
                          ? <span className="text-accent">+{supplyToday}</span>
                          : <span className="text-muted">—</span>
                        }
                      </td>
                      <td className="px-3.5 py-3">
                        <Tag color={isLow ? 'red' : 'green'}>
                          {isLow ? 'LOW' : 'OK'}
                        </Tag>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        }
      </Card>
    </div>
  )
}
