import { ReactNode, ButtonHTMLAttributes } from 'react'

// ── Button ────────────────────────────────────────────────────────────────────
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Btn({ children, variant = 'primary', size = 'md', className = '', ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center rounded-lg font-sans font-medium transition-opacity disabled:opacity-40 cursor-pointer'

  const variants = {
    primary: 'bg-accent text-black font-semibold hover:opacity-85',
    ghost: 'bg-transparent text-soft border border-border hover:opacity-85',
    danger: 'bg-red/10 text-red border border-red/20 hover:opacity-85',
    soft: 'bg-accent/10 text-accent border border-accent/20 hover:opacity-85',
  }

  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-sm',
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
    <div className={`bg-card border border-border rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  )
}

// ── Tag ───────────────────────────────────────────────────────────────────────
interface TagProps {
  children: ReactNode
  color?: 'green' | 'red' | 'yellow' | 'gray'
}

export function Tag({ children, color = 'green' }: TagProps) {
  const colors = {
    green: 'bg-accent/10 text-accent border-accent/20',
    red: 'bg-red/10 text-red border-red/20',
    yellow: 'bg-yellow/10 text-yellow border-yellow/20',
    gray: 'bg-muted/10 text-muted border-muted/20',
  }
  return (
    <span className={`inline-block border rounded-md px-2.5 py-0.5 text-[11px] font-mono font-medium tracking-wide ${colors[color]}`}>
      {children}
    </span>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <Card>
      <div className="text-[11px] text-muted font-mono tracking-widest mb-2 uppercase">{label}</div>
      <div className={`text-2xl font-display font-bold ${accent || 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-soft mt-1">{sub}</div>}
    </Card>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  width?: string
}

export function Modal({ title, onClose, children, width = 'max-w-xl' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={`fade-up bg-surface border border-border rounded-2xl w-full ${width} max-h-[90vh] overflow-y-auto p-7`}>
        <div className="flex justify-between items-center mb-6">
          <div className="font-display font-bold text-lg">{title}</div>
          <button onClick={onClose} className="text-muted text-xl leading-none bg-transparent border-none cursor-pointer hover:text-white">×</button>
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
    <input
      {...props}
      className={`w-full bg-bg border border-border text-white rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors placeholder:text-muted ${props.className || ''}`}
    />
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-bg border border-border text-white rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors ${props.className || ''}`}
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
    <div className="text-center py-16 text-muted">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-sm">{text}</div>
    </div>
  )
}

// ── TopBar ────────────────────────────────────────────────────────────────────
interface TopBarProps {
  role: 'staff' | 'manager'
  onLogout: () => void
}

export function TopBar({ role, onLogout }: TopBarProps) {
  return (
    <div className="bg-surface border-b border-border px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="font-display font-extrabold text-lg">StockOS</span>
        <Tag color={role === 'manager' ? 'yellow' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted text-sm">{new Date().toLocaleDateString('en-NG')}</span>
        <Btn variant="ghost" size="sm" onClick={onLogout}>Sign Out</Btn>
      </div>
    </div>
  )
}

// ── TabBar ────────────────────────────────────────────────────────────────────
interface Tab {
  id: string
  label: string
  icon: string
}

interface TabBarProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
  accentColor?: string
}

export function TabBar({ tabs, active, onChange, accentColor = 'text-accent border-accent' }: TabBarProps) {
  return (
    <div className="bg-surface border-b border-border flex px-6 overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all bg-transparent border-x-0 border-t-0 cursor-pointer
            ${active === t.id
              ? `${accentColor} font-semibold`
              : 'text-soft border-transparent hover:text-white'
            }`}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  )
}
