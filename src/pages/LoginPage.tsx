import { useState } from 'react'
import { Role } from '../types'
import { Btn, Card, Field, Input } from '../components/ui'

const PASSWORDS: Record<Role, string> = {
  staff: 'staff123',
  manager: 'manager123',
}

interface LoginPageProps {
  onLogin: (role: Role) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [role, setRole] = useState<Role>('staff')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  const handleLogin = () => {
    if (pass === PASSWORDS[role]) {
      onLogin(role)
    } else {
      setErr('Incorrect password. Try again.')
      setTimeout(() => setErr(''), 2500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="fade-up w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 bg-card border border-accent/20 rounded-2xl px-6 py-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-base">📦</div>
            <span className="font-display font-extrabold text-xl">StockOS</span>
          </div>
          <div className="text-muted text-sm mt-2.5">Drinks Warehouse Management</div>
        </div>

        <Card>
          <div className="font-display font-bold text-xl mb-6">Sign In</div>

          <Field label="ROLE">
            <div className="flex gap-2.5">
              {(['staff', 'manager'] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setPass('') }}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-display font-semibold capitalize transition-all cursor-pointer
                    ${role === r
                      ? r === 'manager'
                        ? 'border-yellow bg-yellow/10 text-yellow'
                        : 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-transparent text-soft hover:border-soft'
                    }`}
                >
                  {r === 'staff' ? '👤' : '🏢'} {r}
                </button>
              ))}
            </div>
          </Field>

          <Field label="PASSWORD">
            <Input
              type="password"
              placeholder="Enter password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </Field>

          {err && (
            <div className="bg-red/10 border border-red/20 rounded-lg px-4 py-2.5 text-red text-sm mb-4">
              {err}
            </div>
          )}

          <Btn onClick={handleLogin} className="w-full py-3.5 text-base">
            Continue →
          </Btn>

          <div className="text-center text-muted text-[11px] mt-4 font-mono">
            staff: staff123 · manager: manager123
          </div>
        </Card>
      </div>
    </div>
  )
}
