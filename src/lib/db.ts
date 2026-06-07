import { supabase } from './supabase'
import { Product, Sale, Expense, DailyReport, OutstandingBalance } from '../types'
import { SupplyPurchase } from '../hooks/useAppState'

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data as Product[]
}

export const addProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()
  if (error) throw error
  return data as Product
}

export const updateProduct = async (id: number, updates: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Product
}

// ── SALES ─────────────────────────────────────────────────────────────────────
export const getSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Sale[]
}

export const addSale = async (sale: Omit<Sale, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('sales')
    .insert(sale)
    .select()
    .single()
  if (error) throw error
  return data as Sale
}

// ── OUTSTANDING BALANCES ──────────────────────────────────────────────────────
export const getOutstandingBalances = async () => {
  const { data, error } = await supabase
    .from('outstanding_balances')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as OutstandingBalance[]
}

export const addOutstandingBalance = async (balance: Omit<OutstandingBalance, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('outstanding_balances')
    .insert(balance)
    .select()
    .single()
  if (error) throw error
  return data as OutstandingBalance
}

export const updateOutstandingBalance = async (id: number, updates: Partial<OutstandingBalance>) => {
  const { data, error } = await supabase
    .from('outstanding_balances')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as OutstandingBalance
}

// ── EXPENSES ──────────────────────────────────────────────────────────────────
export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Expense[]
}

export const addExpense = async (expense: Omit<Expense, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single()
  if (error) throw error
  return data as Expense
}

// ── DAILY REPORTS ─────────────────────────────────────────────────────────────
export const getReports = async () => {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data as DailyReport[]
}

export const addReport = async (report: Omit<DailyReport, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('daily_reports')
    .upsert(report, { onConflict: 'date' })
    .select()
    .single()
  if (error) throw error
  return data as DailyReport
}

// ── SUPPLIES ──────────────────────────────────────────────────────────────────
export const getSupplies = async () => {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  // Map purchases table to SupplyPurchase shape
  return (data || []).map((p: any) => ({
    id: p.id,
    invoice_no: p.invoice_no || '',
    supplier_name: p.supplier_name || '',
    items: p.items || [],
    total_cost: p.total_cost || 0,
    date: p.created_at?.split('T')[0] || '',
    created_at: p.created_at,
  })) as SupplyPurchase[]
}

export const addSupply = async (supply: Omit<SupplyPurchase, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('purchases')
    .insert({
      invoice_no: supply.invoice_no,
      supplier_name: supply.supplier_name,
      items: supply.items,
      total_cost: supply.total_cost,
      payment_status: 'paid',
      amount_paid: supply.total_cost,
    })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    invoice_no: data.invoice_no || '',
    supplier_name: data.supplier_name || '',
    items: data.items || [],
    total_cost: data.total_cost || 0,
    date: data.created_at?.split('T')[0] || '',
    created_at: data.created_at,
  } as SupplyPurchase
}

// ── RESET (testing only — remove before production) ───────────────────────────
export const resetAllData = async () => {
  await supabase.from('outstanding_balances').delete().gte('id', 0)
  await supabase.from('sales').delete().gte('id', 0)
  await supabase.from('expenses').delete().gte('id', 0)
  await supabase.from('daily_reports').delete().gte('id', 0)
  await supabase.from('purchases').delete().gte('id', 0)
  await supabase.from('stock_adjustments').delete().gte('id', 0)
  // Reset all product stock to 0
  await supabase.from('products').update({ current_stock: 0 }).gte('id', 0)
}

// ── INITIAL STOCK SETUP ───────────────────────────────────────────────────────
export const setInitialStock = async (stockMap: Record<number, number>) => {
  await Promise.all(
    Object.entries(stockMap).map(([id, qty]) =>
      supabase.from('products').update({ current_stock: qty }).eq('id', parseInt(id))
    )
  )
  const totalStock = Object.values(stockMap).reduce((a: number, b: number) => a + b, 0)

  // Save baseline report dated TODAY with closing stock = the stock entered
  // Tomorrow morning this becomes the opening stock automatically
  const todayStr = new Date().toISOString().split('T')[0]

  // Delete any existing report for today first
  await supabase.from('daily_reports').delete().eq('date', todayStr)

  await supabase.from('daily_reports').insert({
    date: todayStr,
    opening_stock: totalStock,
    supply_received: 0,
    total_stock: totalStock,
    closing_stock: totalStock,
    total_sales_value: 0,
    total_expenses: 0,
    submitted_by: 'Manager (Initial Setup)',
  })
}
