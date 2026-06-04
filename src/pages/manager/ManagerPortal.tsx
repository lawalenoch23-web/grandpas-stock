import { useState } from 'react'
import { TopBar, TabBar } from '../../components/ui'
import ManagerOverview from './ManagerOverview'
import ManagerReports from './ManagerReports'
import ManagerSales from './ManagerSales'
import OutstandingBalances from './OutstandingBalances'
import ManagerExpenses from './ManagerExpenses'
import ManagerSupply from './ManagerSupply'
import ManagerFinancials from './ManagerFinancials'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'financials', label: 'Financials', icon: '💹' },
  { id: 'supply', label: 'Supply', icon: '🚚' },
  { id: 'reports', label: 'Daily Reports', icon: '📋' },
  { id: 'sales', label: 'All Sales', icon: '💰' },
  { id: 'outstanding', label: 'Outstanding', icon: '⏳' },
  { id: 'expenses', label: 'Expenses', icon: '🧾' },
]

interface ManagerPortalProps {
  onLogout: () => void
}

export default function ManagerPortal({ onLogout }: ManagerPortalProps) {
  const [tab, setTab] = useState('overview')

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar role="manager" onLogout={onLogout} />
      <TabBar tabs={TABS} active={tab} onChange={setTab} accentColor="text-yellow border-yellow" />
      <div className="flex-1 p-6 overflow-y-auto">
        {tab === 'overview'    && <ManagerOverview />}
        {tab === 'financials'  && <ManagerFinancials />}
        {tab === 'supply'      && <ManagerSupply />}
        {tab === 'reports'     && <ManagerReports />}
        {tab === 'sales'       && <ManagerSales />}
        {tab === 'outstanding' && <OutstandingBalances />}
        {tab === 'expenses'    && <ManagerExpenses />}
      </div>
    </div>
  )
}
