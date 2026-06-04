import { useState } from 'react'
import { TopBar, TabBar } from '../../components/ui'
import SaleForm from './SaleForm'
import StockView from './StockView'
import ExpensesTab from './ExpensesTab'
import EndOfDayTab from './EndOfDayTab'

const TABS = [
  { id: 'pos', label: 'New Sale', icon: '💰' },
  { id: 'stock', label: 'Stock', icon: '📦' },
  { id: 'expenses', label: 'Expenses', icon: '🧾' },
  { id: 'report', label: 'End of Day', icon: '📋' },
]

interface StaffPortalProps {
  onLogout: () => void
}

export default function StaffPortal({ onLogout }: StaffPortalProps) {
  const [tab, setTab] = useState('pos')

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar role="staff" onLogout={onLogout} />
      <TabBar tabs={TABS} active={tab} onChange={setTab} accentColor="text-accent border-accent" />
      <div className="flex-1 p-6 overflow-y-auto">
        {tab === 'pos' && <SaleForm />}
        {tab === 'stock' && <StockView />}
        {tab === 'expenses' && <ExpensesTab />}
        {tab === 'report' && <EndOfDayTab />}
      </div>
    </div>
  )
}
