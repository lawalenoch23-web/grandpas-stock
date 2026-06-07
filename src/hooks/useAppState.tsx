import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, Sale, Expense, DailyReport, OutstandingBalance } from '../types'
import * as db from '../lib/db'
import { supabase } from '../lib/supabase'

export interface SupplyItem {
  product_id: number
  product_name: string
  qty: number
  unit: string
  price_per_unit: number
  total_cost: number
}

export interface SupplyPurchase {
  id: number
  invoice_no: string
  supplier_name: string
  items: SupplyItem[]
  total_cost: number
  date: string
  created_at: string
}

export interface AppState {
  products: Product[]
  sales: Sale[]
  expenses: Expense[]
  reports: DailyReport[]
  outstandingBalances: OutstandingBalance[]
  supplies: SupplyPurchase[]
  loading: boolean
}

interface AppStateContextType {
  appState: AppState
  setAppState: React.Dispatch<React.SetStateAction<AppState>>
  refresh: () => Promise<void>
}

const AppStateContext = createContext<AppStateContextType | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>({
    products: [], sales: [], expenses: [], reports: [],
    outstandingBalances: [], supplies: [], loading: true,
  })

  const refresh = async () => {
    try {
      const [products, sales, expenses, reports, outstandingBalances, supplies] = await Promise.all([
        db.getProducts(), db.getSales(), db.getExpenses(),
        db.getReports(), db.getOutstandingBalances(), db.getSupplies(),
      ])
      setAppState(prev => ({
        ...prev, products, sales, expenses, reports,
        outstandingBalances, supplies, loading: false,
      }))
    } catch (err) {
      console.error('Failed to load data:', err)
      setAppState(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    refresh()

    // Realtime subscriptions — refresh on any change
    const tables = ['products', 'sales', 'expenses', 'daily_reports', 'outstanding_balances', 'purchases']
    const channels = tables.map(table =>
      supabase
        .channel(`realtime:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          refresh()
        })
        .subscribe()
    )

    return () => {
      channels.forEach(c => supabase.removeChannel(c))
    }
  }, [])

  return (
    <AppStateContext.Provider value={{ appState, setAppState, refresh }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
