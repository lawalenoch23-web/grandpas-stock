export const fmt = (n: number, currency = '₦') =>
  `${currency}${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`

export const today = () => new Date().toISOString().split('T')[0]

export const nowTime = () =>
  new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })

export const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
