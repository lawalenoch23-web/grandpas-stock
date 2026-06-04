import { createContext, useContext, useState, ReactNode } from 'react'
import { Role } from '../types'

interface AuthContextType {
  role: Role | null
  login: (role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)

  const login = (r: Role) => setRole(r)
  const logout = () => setRole(null)

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
