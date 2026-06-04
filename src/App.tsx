import { useState } from 'react'
import { Role } from './types'
import { AppStateProvider } from './hooks/useAppState'
import LoginPage from './pages/LoginPage'
import StaffPortal from './pages/staff/StaffPortal'
import ManagerPortal from './pages/manager/ManagerPortal'

export default function App() {
  const [role, setRole] = useState<Role | null>(null)

  return (
    <AppStateProvider>
      {!role && <LoginPage onLogin={setRole} />}
      {role === 'staff' && <StaffPortal onLogout={() => setRole(null)} />}
      {role === 'manager' && <ManagerPortal onLogout={() => setRole(null)} />}
    </AppStateProvider>
  )
}
