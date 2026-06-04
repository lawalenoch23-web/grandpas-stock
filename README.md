# StockOS — Drinks Warehouse Management System

Built by **Grandpa's Dream OS**

---

## Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **Supabase** (database + auth)
- **React Router v6** (routing)

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/stockos.git
cd stockos
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase
- Create a new project at [supabase.com](https://supabase.com)
- Run the SQL schema in `supabase/schema.sql` in your Supabase SQL editor
- Copy your project URL and anon key

### 4. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the dev server
```bash
npm run dev
```

---

## Default Passwords

| Role    | Password     |
|---------|-------------|
| Staff   | `staff123`   |
| Manager | `manager123` |

> Change these in Supabase → `system_settings` table after setup.

---

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page-level components
│   ├── LoginPage.tsx
│   ├── staff/      # Staff portal pages
│   └── manager/    # Manager portal pages
├── lib/            # Supabase client + helpers
├── types/          # TypeScript interfaces
└── hooks/          # Custom React hooks
supabase/
└── schema.sql      # Full database schema
```

---

## Features (Phase 1)

### Staff Portal
- Record sales (full payment / half credit / full credit)
- Track outstanding balances per customer
- Log daily expenses
- End-of-day report (opening stock, supply, closing stock)
- Submit daily report to manager

### Manager Portal
- Overview dashboard (revenue, outstanding, expenses, low stock)
- View all daily reports
- Full sales history
- Outstanding balances with payment recording
- Staff expenses by date

---

## Roadmap

- [ ] Phase 2: Supplier purchases + invoice tracking
- [ ] Phase 3: Manager purchases from suppliers (with invoice no., quantities, costs)
- [ ] Phase 4: Advanced profit/revenue reports
- [ ] Phase 5: Multi-branch support
- [ ] Phase 6: Incentives & bonuses system
