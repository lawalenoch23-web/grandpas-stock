import { useState } from 'react'
import { Btn, Card, Field, Input, Divider, EmptyState } from '../../components/ui'
import { useAppState } from '../../hooks/useAppState'
import * as db from '../../lib/db'

export default function ManagerSettings() {
  const { appState, refresh } = useAppState()
  const [stockMap, setStockMap] = useState<Record<number, string>>({})
  const [setupSaving, setSetupSaving] = useState(false)
  const [setupDone, setSetupDone] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  const hasReports = appState.reports.length > 0

  const handleSetInitialStock = async () => {
    setSetupSaving(true)
    try {
      const map: Record<number, number> = {}
      appState.products.forEach(p => {
        map[p.id] = parseInt(stockMap[p.id] || '0') || 0
      })
      await db.setInitialStock(map)
      await refresh()
      setSetupDone(true)
    } catch (err) {
      alert('Failed to set initial stock')
    } finally {
      setSetupSaving(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      await db.resetAllData()
      await refresh()
      setStockMap({})
      setSetupDone(false)
      setConfirmReset(false)
      setResetDone(true)
      setTimeout(() => setResetDone(false), 3000)
    } catch (err) {
      alert('Reset failed')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="font-display font-bold text-2xl mb-6">Settings</div>

      {/* Initial Stock Setup */}
      <Card className="mb-5">
        <div className="font-display font-semibold mb-1">Initial Stock Setup</div>
        <div className="text-sm text-muted mb-4">
          Set the current stock count for each product before staff start using the app.
          {hasReports && ' A baseline has already been set.'}
        </div>

        {setupDone && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-accent text-sm mb-4">
            ✅ Initial stock set! Staff can now start recording sales.
          </div>
        )}

        {appState.products.length === 0
          ? <EmptyState icon="📦" text="No products yet — add products first from the New Sale tab" />
          : (
            <>
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {appState.products.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="flex-1 text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted w-12 text-right">{p.unit_type}</div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min={0}
                        value={stockMap[p.id] ?? p.current_stock}
                        onChange={e => setStockMap(prev => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Btn onClick={handleSetInitialStock} disabled={setupSaving}>
                {setupSaving ? 'Saving...' : hasReports ? 'Update Stock Baseline' : 'Set Initial Stock →'}
              </Btn>
            </>
          )
        }
      </Card>

      {/* ── RESET SECTION — REMOVE BEFORE PRODUCTION ── */}
      <Card className="border-red/30">
        <div className="font-display font-semibold text-red mb-1">🧪 Testing: Reset All Data</div>
        <div className="text-sm text-muted mb-4">
          Clears all sales, expenses, reports, supplies, and outstanding balances. Resets stock to 0.
          <br />
          <span className="text-red text-xs font-mono">REMOVE THIS SECTION BEFORE GOING LIVE</span>
        </div>

        {resetDone && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-accent text-sm mb-4">
            ✅ All data cleared. Fresh start!
          </div>
        )}

        {!confirmReset ? (
          <Btn variant="danger" onClick={() => setConfirmReset(true)}>
            Reset All Data
          </Btn>
        ) : (
          <div className="bg-red/10 border border-red/20 rounded-xl p-4">
            <div className="text-sm text-red font-semibold mb-3">
              ⚠️ This will delete everything. Are you sure?
            </div>
            <div className="flex gap-3">
              <Btn variant="danger" onClick={handleReset} disabled={resetting}>
                {resetting ? 'Resetting...' : 'Yes, delete everything'}
              </Btn>
              <Btn variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Btn>
            </div>
          </div>
        )}
      </Card>
      {/* ── END RESET SECTION ── */}
    </div>
  )
}
