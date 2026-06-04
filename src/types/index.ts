export type Role = 'staff' | 'manager'

export interface Product {
  id: number
  name: string
  category: string
  unit_type: string
  units_per_crate: number
  cost_price: number
  wholesale_price: number
  retail_price: number
  current_stock: number
  minimum_stock: number
  image_url?: string
  supplier_id?: number
  is_active: boolean
  created_at: string
}

export interface SaleItem {
  product_id: number
  product_name: string
  qty: number
  unit: string
  price: number
  cost: number
}

export type PaymentType = 'full' | 'half' | 'credit'

export interface Sale {
  id: number
  customer_name: string
  customer_phone?: string
  customer_type: 'retail' | 'wholesale'
  items: SaleItem[]
  subtotal: number
  discount_amount: number
  total_price: number
  total_cost: number
  gross_profit: number
  payment_type: PaymentType
  payment_method: string
  payment_status: string
  amount_paid: number
  outstanding: number
  notes?: string
  staff_name?: string
  created_at: string
}

export interface OutstandingBalance {
  id: number
  sale_id: number
  customer_name: string
  customer_phone?: string
  amount: number
  amount_paid: number
  is_paid: boolean
  date: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: number
  description: string
  amount: number
  logged_by?: string
  date: string
  created_at: string
}

export interface DailyReport {
  id: number
  date: string
  opening_stock: number
  supply_received: number
  total_stock: number
  closing_stock: number
  total_sales_value: number
  total_expenses: number
  submitted_by?: string
  created_at: string
}

export interface Supplier {
  id: number
  name: string
  phone?: string
  address?: string
  notes?: string
  created_at: string
}

export interface SystemSettings {
  id: number
  business_name: string
  logo_url?: string
  address?: string
  phone?: string
  staff_password: string
  manager_password: string
  currency: string
  low_stock_alert: boolean
}
