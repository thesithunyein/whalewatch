export function formatUSD(value, compact = false) {
  if (value === null || value === undefined || isNaN(value)) return '$—'
  if (compact) {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`
  return value.toFixed(decimals)
}

export function formatPercent(value, showSign = true) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatAddress(addr, chars = 4) {
  if (!addr) return '—'
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`
}

export function formatAge(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function priceImpactColor(impact) {
  const abs = Math.abs(impact)
  if (abs < 1) return 'text-whale-green'
  if (abs < 3) return 'text-whale-yellow'
  return 'text-whale-red'
}

export function priceImpactBg(impact) {
  const abs = Math.abs(impact)
  if (abs < 1) return 'bg-whale-green-dim text-whale-green'
  if (abs < 3) return 'bg-whale-yellow-dim text-whale-yellow'
  return 'bg-whale-red-dim text-whale-red'
}

export function changeColor(value) {
  if (!value) return 'text-whale-text-dim'
  return value >= 0 ? 'text-whale-green' : 'text-whale-red'
}
