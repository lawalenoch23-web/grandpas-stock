import { ReactNode, ButtonHTMLAttributes } from 'react'

// ── Button ────────────────────────────────────────────────────────────────────
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Btn({ children, variant = 'primary', size = 'md', className = '', ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center rounded-xl font-sans font-medium transition-opacity disabled:opacity-40 cursor-pointer active:scale-95 transition-transform'
  const variants = {
    primary: 'bg-accent text-black font-semibold hover:opacity-85',
    ghost: 'bg-transparent text-soft border border-border hover:opacity-85',
    danger: 'bg-red/10 text-red border border-red/20 hover:opacity-85',
    soft: 'bg-accent/10 text-accent border border-accent/20 hover:opacity-85',
  }
  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-4 text-sm',
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-4 md:p-5 ${className}`}>
      {children}
    </div>
  )
}

// ── Tag ───────────────────────────────────────────────────────────────────────
interface TagProps { children: ReactNode; color?: 'green' | 'red' | 'yellow' | 'gray' }
export function Tag({ children, color = 'green' }: TagProps) {
  const colors = {
    green: 'bg-accent/10 text-accent border-accent/20',
    red: 'bg-red/10 text-red border-red/20',
    yellow: 'bg-yellow/10 text-yellow border-yellow/20',
    gray: 'bg-muted/10 text-muted border-muted/20',
  }
  return (
    <span className={`inline-block border rounded-lg px-2.5 py-0.5 text-[11px] font-mono font-medium tracking-wide ${colors[color]}`}>
      {children}
    </span>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
interface StatCardProps { label: string; value: string | number; sub?: string; accent?: string }
export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <Card>
      <div className="text-[10px] text-muted font-mono tracking-widest mb-2 uppercase">{label}</div>
      <div className={`text-xl md:text-2xl font-display font-bold ${accent || 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-soft mt-1">{sub}</div>}
    </Card>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps { title: string; onClose: () => void; children: ReactNode; width?: string }
export function Modal({ title, onClose, children, width = 'max-w-xl' }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center md:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`fade-up bg-surface border border-border rounded-t-3xl md:rounded-2xl w-full ${width} max-h-[92vh] overflow-y-auto p-6 md:p-7`}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5 md:hidden" />
        <div className="flex justify-between items-center mb-5">
          <div className="font-display font-bold text-lg">{title}</div>
          <button onClick={onClose} className="text-muted text-2xl leading-none bg-transparent border-none cursor-pointer w-8 h-8 flex items-center justify-center">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-[11px] text-muted font-mono mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={`w-full bg-bg border border-border text-white rounded-xl px-3.5 py-3 text-sm outline-none focus:border-accent transition-colors placeholder:text-muted ${props.className || ''}`}
    />
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props}
      className={`w-full bg-bg border border-border text-white rounded-xl px-3.5 py-3 text-sm outline-none focus:border-accent transition-colors ${props.className || ''}`}
    />
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-border my-5 ${className}`} />
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-14 text-muted">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-sm">{text}</div>
    </div>
  )
}

// ── TopBar ────────────────────────────────────────────────────────────────────
interface TopBarProps { role: 'staff' | 'manager'; onLogout: () => void }
export function TopBar({ role, onLogout }: TopBarProps) {
  return (
    <div className="bg-surface border-b border-border px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <span className="font-display font-extrabold text-lg">StockOS</span>
        <Tag color={role === 'manager' ? 'yellow' : 'green'}>{role.toUpperCase()}</Tag>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted text-xs hidden sm:block">{new Date().toLocaleDateString('en-NG')}</span>
        <Btn variant="ghost" size="sm" onClick={onLogout}>Sign Out</Btn>
      </div>
    </div>
  )
}

// ── TabBar — bottom on mobile, top on desktop ─────────────────────────────────
interface Tab { id: string; label: string; icon: string }
interface TabBarProps { tabs: Tab[]; active: string; onChange: (id: string) => void; accentColor?: string }

export function TabBar({ tabs, active, onChange, accentColor = 'text-accent border-accent' }: TabBarProps) {
  return (
    <>
      {/* Desktop: top tab bar */}
      <div className="hidden md:flex bg-surface border-b border-border px-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => onChange(t.id)}
            className={`px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all bg-transparent border-x-0 border-t-0 cursor-pointer
              ${active === t.id ? `${accentColor} font-semibold` : 'text-soft border-transparent hover:text-white'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Mobile: bottom nav bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border pb-safe">
        <div className="flex">
          {tabs.map(t => (
            <button key={t.id} onClick={() => onChange(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-mono uppercase bg-transparent border-none cursor-pointer transition-all
                ${active === t.id ? (accentColor.includes('yellow') ? 'text-yellow' : 'text-accent') : 'text-muted'}`}>
              <span className="text-xl leading-none">{t.icon}</span>
              <span className="leading-none">{t.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Spacer so content doesn't hide behind bottom nav on mobile */}
      <div className="md:hidden h-16" />
    </>
  )
}

// ── Loading screen ────────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-2xl mx-auto mb-4">📦</div>
        <div className="font-display font-bold text-lg mb-2">StockOS</div>
        <div className="text-muted text-sm">Loading...</div>
      </div>
    </div>
  )
}
