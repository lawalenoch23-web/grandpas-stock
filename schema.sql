-- ============================================================
-- StockOS — Drinks Warehouse Management System
-- Database Schema v1.0
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Products
create table if not exists products (
  id bigserial primary key,
  name text not null,
  category text,
  unit_type text default 'crate',        -- crate, PET, can, pack
  units_per_crate integer default 12,    -- how many PETs in a crate
  cost_price numeric default 0,          -- what you pay supplier
  wholesale_price numeric default 0,     -- price for bulk buyers
  retail_price numeric default 0,        -- price for walk-in customers
  current_stock numeric default 0,       -- in base unit (crate or PET)
  minimum_stock numeric default 5,       -- low stock alert threshold
  image_url text,
  supplier_id bigint,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. Suppliers
create table if not exists suppliers (
  id bigserial primary key,
  name text not null,
  phone text,
  address text,
  notes text,
  created_at timestamptz default now()
);

-- 3. Sales
create table if not exists sales (
  id bigserial primary key,
  customer_name text,
  customer_phone text,
  customer_type text default 'retail',   -- retail or wholesale
  items jsonb not null default '[]',     -- [{product_id, name, qty, unit, price, cost}]
  subtotal numeric default 0,
  discount_amount numeric default 0,
  total_price numeric not null default 0,
  total_cost numeric default 0,          -- COGS for this sale
  gross_profit numeric default 0,        -- total_price - total_cost
  payment_type text default 'full',      -- full, half, credit
  payment_method text default 'cash',    -- cash, transfer, credit
  payment_status text default 'paid',    -- paid, unpaid, partial
  amount_paid numeric default 0,
  outstanding numeric default 0,
  notes text,
  staff_name text,
  created_at timestamptz default now()
);

-- 4. Outstanding Balances
create table if not exists outstanding_balances (
  id bigserial primary key,
  sale_id bigint references sales(id),
  customer_name text not null,
  customer_phone text,
  amount numeric not null default 0,
  amount_paid numeric default 0,
  is_paid boolean default false,
  date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Purchases (from suppliers)
create table if not exists purchases (
  id bigserial primary key,
  supplier_id bigint references suppliers(id),
  supplier_name text,
  invoice_no text,
  items jsonb not null default '[]',     -- [{product_id, name, qty, unit, cost_price}]
  total_cost numeric default 0,
  payment_method text default 'cash',
  payment_status text default 'paid',
  amount_paid numeric default 0,
  notes text,
  received_by text,
  created_at timestamptz default now()
);

-- 6. Stock Adjustments (damages, losses, corrections)
create table if not exists stock_adjustments (
  id bigserial primary key,
  product_id bigint references products(id),
  product_name text,
  adjustment_type text,                  -- damage, loss, correction, return
  quantity_change numeric not null,      -- negative = decrease, positive = increase
  reason text,
  adjusted_by text,
  created_at timestamptz default now()
);

-- 7. Expenses
create table if not exists expenses (
  id bigserial primary key,
  description text not null,
  amount numeric not null default 0,
  logged_by text,
  date date default current_date,
  created_at timestamptz default now()
);

-- 8. Daily Reports
create table if not exists daily_reports (
  id bigserial primary key,
  date date not null unique,
  opening_stock numeric default 0,
  supply_received numeric default 0,
  total_stock numeric default 0,
  closing_stock numeric default 0,
  total_sales_value numeric default 0,
  total_expenses numeric default 0,
  submitted_by text,
  created_at timestamptz default now()
);

-- 9. System Settings
create table if not exists system_settings (
  id bigserial primary key,
  business_name text default 'My Warehouse',
  logo_url text,
  address text,
  phone text,
  staff_password text default 'staff123',
  manager_password text default 'manager123',
  currency text default '₦',
  low_stock_alert boolean default true,
  created_at timestamptz default now()
);

-- Insert default settings
insert into system_settings (business_name, staff_password, manager_password)
values ('My Drinks Warehouse', 'staff123', 'manager123')
on conflict do nothing;

-- ============================================================
-- Row Level Security (enable after testing)
-- ============================================================
-- alter table products enable row level security;
-- alter table sales enable row level security;
-- alter table expenses enable row level security;
-- alter table daily_reports enable row level security;
