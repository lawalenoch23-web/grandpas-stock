import { useState } from 'react'
import { Role } from './types'
import { AppStateProvider, useAppState } from './hooks/useAppState'
import LoginPage from './pages/LoginPage'
import StaffPortal from './pages/staff/StaffPortal'
import ManagerPortal from './pages/manager/ManagerPortal'
import { LoadingScreen } from './components/ui'

function AppInner() {
  const [role, setRole] = useState<Role | null>(null)
  const { appState } = useAppState()

  if (appState.loading) return <LoadingScreen />
  if (!role) return <LoginPage onLogin={setRole} />
  if (role === 'staff') return <StaffPortal onLogout={() => setRole(null)} />
  return <ManagerPortal onLogout={() => setRole(null)} />
}

export default function App() {
  return (
    <AppStateProvider>
      <AppInner />
    </AppStateProvider>
  )
}
