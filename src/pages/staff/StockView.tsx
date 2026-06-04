import { Card, Tag, EmptyState } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'

export default function StockView() {
  const { appState } = useAppState()
  const low = appState.products.filter(p => p.current_stock < p.minimum_stock)

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
          ? <EmptyState icon="📦" text="No products found" />
          : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {['Product', 'Category', 'Unit', 'Stock', 'Status'].map(h => (
                    <th key={h} className="text-left px-3.5 py-2.5 text-[11px] text-muted font-mono uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appState.products.map(p => (
                  <tr key={p.id} className="border-b border-border/10 hover:bg-white/[0.02]">
                    <td className="px-3.5 py-3 font-medium">{p.name}</td>
                    <td className="px-3.5 py-3 text-soft text-sm">{p.category}</td>
                    <td className="px-3.5 py-3 text-soft text-sm">{p.unit_type}</td>
                    <td className="px-3.5 py-3 font-mono">{p.current_stock}</td>
                    <td className="px-3.5 py-3">
                      <Tag color={p.current_stock < p.minimum_stock ? 'red' : 'green'}>
                        {p.current_stock < p.minimum_stock ? 'LOW' : 'OK'}
                      </Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </Card>
    </div>
  )
}
