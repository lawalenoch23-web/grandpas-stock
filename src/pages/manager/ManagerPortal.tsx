import { useState } from 'react'
import { TopBar, TabBar } from '../../components/ui'
import ManagerOverview from './ManagerOverview'
import ManagerReports from './ManagerReports'
import ManagerSales from './ManagerSales'
import OutstandingBalances from './OutstandingBalances'
import ManagerExpenses from './ManagerExpenses'
import ManagerSupply from './ManagerSupply'
import ManagerFinancials from './ManagerFinancials'
import ManagerSettings from './ManagerSettings'
import ManageProducts from './ManageProducts'

const TABS = [
  { id: 'overview',    label: 'Overview',   icon: '📊' },
  { id: 'financials',  label: 'Financials', icon: '💹' },
  { id: 'supply',      label: 'Supply',     icon: '🚚' },
  { id: 'products',    label: 'Products',   icon: '📦' },
  { id: 'reports',     label: 'Reports',    icon: '📋' },
  { id: 'sales',       label: 'Sales',      icon: '💰' },
  { id: 'outstanding', label: 'Owed',       icon: '⏳' },
  { id: 'expenses',    label: 'Expenses',   icon: '🧾' },
  { id: 'settings',   label: 'Settings',   icon: '⚙️' },
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
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {tab === 'overview'    && <ManagerOverview />}
        {tab === 'financials'  && <ManagerFinancials />}
        {tab === 'supply'      && <ManagerSupply />}
        {tab === 'products'    && <ManageProducts />}
        {tab === 'reports'     && <ManagerReports />}
        {tab === 'sales'       && <ManagerSales />}
        {tab === 'outstanding' && <OutstandingBalances />}
        {tab === 'expenses'    && <ManagerExpenses />}
        {tab === 'settings'    && <ManagerSettings />}
      </div>
    </div>
  )
}
