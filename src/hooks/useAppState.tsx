import { createContext, useContext, useState, ReactNode } from 'react'
import { Product, Sale, Expense, DailyReport, OutstandingBalance } from '../types'

const PRODUCTS_SEED: Product[] = [
  { id: 1, name: 'Coca Cola', category: 'Soda', unit_type: 'Crate', units_per_crate: 12, cost_price: 2800, wholesale_price: 3200, retail_price: 3500, current_stock: 40, minimum_stock: 10, is_active: true, created_at: new Date().toISOString() },
  { id: 2, name: 'Pepsi', category: 'Soda', unit_type: 'Crate', units_per_crate: 12, cost_price: 2600, wholesale_price: 3000, retail_price: 3300, current_stock: 25, minimum_stock: 8, is_active: true, created_at: new Date().toISOString() },
  { id: 3, name: 'Eva Water', category: 'Water', unit_type: 'Pack', units_per_crate: 12, cost_price: 800, wholesale_price: 1000, retail_price: 1200, current_stock: 60, minimum_stock: 15, is_active: true, created_at: new Date().toISOString() },
  { id: 4, name: 'Malt', category: 'Energy', unit_type: 'Crate', units_per_crate: 24, cost_price: 3500, wholesale_price: 4000, retail_price: 4500, current_stock: 18, minimum_stock: 5, is_active: true, created_at: new Date().toISOString() },
  { id: 5, name: 'Fanta', category: 'Soda', unit_type: 'Crate', units_per_crate: 12, cost_price: 2800, wholesale_price: 3200, retail_price: 3500, current_stock: 7, minimum_stock: 10, is_active: true, created_at: new Date().toISOString() },
  { id: 6, name: 'Sprite', category: 'Soda', unit_type: 'Crate', units_per_crate: 12, cost_price: 2800, wholesale_price: 3200, retail_price: 3500, current_stock: 30, minimum_stock: 8, is_active: true, created_at: new Date().toISOString() },
  { id: 7, name: 'Predator Energy', category: 'Energy', unit_type: 'Pack', units_per_crate: 24, cost_price: 4500, wholesale_price: 5200, retail_price: 5800, current_stock: 3, minimum_stock: 6, is_active: true, created_at: new Date().toISOString() },
  { id: 8, name: 'Hollandia Juice', category: 'Juice', unit_type: 'Pack', units_per_crate: 12, cost_price: 1800, wholesale_price: 2200, retail_price: 2500, current_stock: 20, minimum_stock: 5, is_active: true, created_at: new Date().toISOString() },
]

export interface AppState {
  products: Product[]
  sales: Sale[]
  expenses: Expense[]
  reports: DailyReport[]
  outstandingBalances: OutstandingBalance[]
}

interface AppStateContextType {
  appState: AppState
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
}

const AppStateContext = createContext<AppStateContextType | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>({
    products: PRODUCTS_SEED,
    sales: [],
    expenses: [],
    reports: [],
    outstandingBalances: [],
  })

  return (
    <AppStateContext.Provider value={{ appState, setAppState }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
