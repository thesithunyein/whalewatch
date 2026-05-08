import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, TrendingUp, TrendingDown, ExternalLink, BarChart3, RefreshCw, Radio } from 'lucide-react'
import clsx from 'clsx'
import { formatUSD, formatNumber, formatPercent, changeColor } from '../utils/formatters.js'
import { SOLSCAN_TOKEN } from '../config.js'
import { Badge } from '../components/ui/Badge.jsx'
import { useApp } from '../context/AppContext.jsx'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const DEMO_TOKENS = [
  { symbol: 'SOL', name: 'Solana', price: 182.45, change24h: 3.21, volume24h: 1_240_000_000, marketCap: 86_000_000_000, whaleActivity: 'High', address: 'So11111111111111111111111111111111111111112', whaleTxs: 142, category: 'L1' },
  { symbol: 'BONK', name: 'Bonk', price: 0.0000342, change24h: -8.45, volume24h: 320_000_000, marketCap: 2_100_000_000, whaleActivity: 'Very High', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', whaleTxs: 234, category: 'Meme' },
  { symbol: 'WIF', name: 'dogwifhat', price: 3.18, change24h: 12.7, volume24h: 450_000_000, marketCap: 3_180_000_000, whaleActivity: 'High', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', whaleTxs: 89, category: 'Meme' },
  { symbol: 'JUP', name: 'Jupiter', price: 1.12, change24h: 2.34, volume24h: 180_000_000, marketCap: 1_450_000_000, whaleActivity: 'Medium', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', whaleTxs: 56, category: 'DeFi' },
  { symbol: 'PYTH', name: 'Pyth Network', price: 0.432, change24h: -1.23, volume24h: 95_000_000, marketCap: 750_000_000, whaleActivity: 'Low', address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', whaleTxs: 18, category: 'Oracle' },
  { symbol: 'RNDR', name: 'Render', price: 8.91, change24h: 5.67, volume24h: 210_000_000, marketCap: 4_200_000_000, whaleActivity: 'Medium', address: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof', whaleTxs: 43, category: 'AI' },
  { symbol: 'JITO', name: 'Jito', price: 4.23, change24h: -0.89, volume24h: 72_000_000, marketCap: 620_000_000, whaleActivity: 'Low', address: 'jtojtomepa8bdgrqq1d2nm1maz1dm64j8h5a6jq91pt', whaleTxs: 12, category: 'LST' },
  { symbol: 'DRIFT', name: 'Drift Protocol', price: 0.862, change24h: 7.23, volume24h: 45_000_000, marketCap: 290_000_000, whaleActivity: 'Medium', address: 'DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7', whaleTxs: 27, category: 'DeFi' },
  { symbol: 'POPCAT', name: 'Popcat', price: 1.24, change24h: -15.4, volume24h: 520_000_000, marketCap: 1_240_000_000, whaleActivity: 'Very High', address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', whaleTxs: 178, category: 'Meme' },
  { symbol: 'BOME', name: 'Book of Meme', price: 0.0124, change24h: 4.56, volume24h: 89_000_000, marketCap: 495_000_000, whaleActivity: 'High', address: 'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82', whaleTxs: 95, category: 'Meme' },
  { symbol: 'MSOL', name: 'Marinade SOL', price: 209.8, change24h: 3.15, volume24h: 28_000_000, marketCap: 890_000_000, whaleActivity: 'Low', address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', whaleTxs: 9, category: 'LST' },
  { symbol: 'RAY', name: 'Raydium', price: 5.43, change24h: -2.1, volume24h: 156_000_000, marketCap: 1_560_000_000, whaleActivity: 'Medium', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', whaleTxs: 38, category: 'DeFi' },
]

const ACTIVITY_COLORS = {
  'Very High': 'text-whale-red',
  'High': 'text-whale-orange',
  'Medium': 'text-whale-yellow',
  'Low': 'text-whale-text-muted',
}

const CATEGORIES = ['All', 'Meme', 'DeFi', 'L1', 'AI', 'LST', 'Oracle']
const SORTS = [
  { key: 'whaleTxs', label: 'Whale Txs' },
  { key: 'volume24h', label: 'Volume' },
  { key: 'change24h', label: 'Change' },
  { key: 'marketCap', label: 'Market Cap' },
]

const SECTOR_MAP = {
  'So11111111111111111111111111111111111111112': 'L1',
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'Meme',
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': 'Meme',
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'DeFi',
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': 'Oracle',
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': 'AI',
  'jtojtomepa8bdgrqq1d2nm1maz1dm64j8h5a6jq91pt': 'LST',
  'DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7': 'DeFi',
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr': 'Meme',
  'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82': 'Meme',
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'LST',
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'DeFi',
}

function whaleActivityFromVolume(v) {
  if (v >= 500_000_000) return 'Very High'
  if (v >= 200_000_000) return 'High'
  if (v >= 50_000_000) return 'Medium'
  return 'Low'
}

function mapBirdeyeToken(t) {
  const vol = t.v24hUSD ?? t.volume24h ?? 0
  return {
    address: t.address,
    symbol: t.symbol || '???',
    name: t.name || t.symbol || '???',
    price: t.price ?? 0,
    change24h: t.priceChange24hPercent ?? t.change24h ?? 0,
    volume24h: vol,
    marketCap: t.mc ?? t.marketCap ?? 0,
    whaleTxs: Math.max(1, Math.round(vol / 5_000_000)),
    whaleActivity: whaleActivityFromVolume(vol),
    category: SECTOR_MAP[t.address] || 'Other',
  }
}

async function fetchLiveTokens() {
  const url = new URL(`${SUPABASE_URL}/functions/v1/birdeye-proxy`)
  url.searchParams.set('path', '/defi/tokenlist')
  url.searchParams.set('sort_by', 'v24hUSD')
  url.searchParams.set('sort_type', 'desc')
  url.searchParams.set('offset', '0')
  url.searchParams.set('limit', '50')
  const res = await fetch(url.toString(), { headers: { 'apikey': SUPABASE_ANON_KEY } })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  const tokens = json?.data?.tokens || json?.data || []
  return tokens.map(mapBirdeyeToken)
}

export default function TokenScreener() {
  const { hasApiKey } = useApp()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('whaleTxs')
  const [sortAsc, setSortAsc] = useState(false)
  const [liveTokens, setLiveTokens] = useState(null) // null = not fetched yet
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveError, setLiveError] = useState(null)

  const isLive = hasApiKey && liveTokens !== null && liveTokens.length > 0
  const tokens = isLive ? liveTokens : DEMO_TOKENS

  useEffect(() => {
    if (!hasApiKey) { setLiveTokens(null); return }
    let cancelled = false
    setLiveLoading(true)
    setLiveError(null)
    fetchLiveTokens()
      .then((data) => { if (!cancelled) setLiveTokens(data) })
      .catch((e) => { if (!cancelled) setLiveError(e.message) })
      .finally(() => { if (!cancelled) setLiveLoading(false) })
    return () => { cancelled = true }
  }, [hasApiKey])

  const toggleSort = (key) => {
    if (sortBy === key) setSortAsc((v) => !v)
    else { setSortBy(key); setSortAsc(false) }
  }

  const filtered = useMemo(() => {
    let list = tokens.filter((t) => {
      const matchSearch = t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'All' || t.category === category
      return matchSearch && matchCat
    })
    list.sort((a, b) => {
      const av = a[sortBy] ?? 0, bv = b[sortBy] ?? 0
      return sortAsc ? av - bv : bv - av
    })
    return list
  }, [tokens, search, category, sortBy, sortAsc])

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-whale-text flex items-center gap-2">
            <Search className="w-5 h-5 text-whale-accent" />
            Token Screener
          </h1>
          <p className="text-sm text-whale-text-muted mt-0.5">
            Tokens ranked by whale activity and on-chain signals
          </p>
        </div>
        <div className="flex items-center gap-2">
          {liveLoading && (
            <span className="w-3.5 h-3.5 border-2 border-whale-accent border-t-transparent rounded-full animate-spin" />
          )}
          {isLive ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-whale-green-dim border border-whale-green/30 text-whale-green text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-whale-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-whale-green" />
              </span>
              LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-whale-muted border border-whale-border text-whale-text-muted text-xs font-semibold">
              <Radio className="w-3 h-3" />
              DEMO
            </span>
          )}
        </div>
      </div>

      {liveError && (
        <div className="text-xs text-whale-red bg-whale-red-dim border border-whale-red/30 rounded-lg px-3 py-2">
          Live data error: {liveError}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-whale-text-muted" />
          <input
            className="w-full bg-whale-card border border-whale-border rounded-xl pl-9 pr-4 py-2 text-sm text-whale-text placeholder-whale-text-muted focus:outline-none focus:border-whale-accent"
            placeholder="Search tokens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={clsx(
                'px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                category === cat
                  ? 'bg-whale-accent text-white border-whale-accent'
                  : 'border-whale-border text-whale-text-dim hover:border-whale-accent/50'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-whale-card border border-whale-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-whale-border bg-whale-surface">
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider w-8">#</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Price</th>
                {SORTS.map((s) => (
                  <th
                    key={s.key}
                    className={clsx(
                      'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider cursor-pointer hover:text-whale-accent transition-colors select-none',
                      sortBy === s.key ? 'text-whale-accent' : 'text-whale-text-muted'
                    )}
                    onClick={() => toggleSort(s.key)}
                  >
                    {s.label} {sortBy === s.key ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                ))}
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Activity</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((token, i) => (
                <tr key={token.symbol} className="border-b border-whale-border/50 hover:bg-whale-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-whale-text-muted font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-whale-accent/20 to-whale-purple/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-whale-text">{token.symbol[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-whale-text">{token.symbol}</p>
                        <p className="text-[10px] text-whale-text-muted">{token.name}</p>
                      </div>
                      <Badge variant="neutral">{token.category}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono text-whale-text">{formatUSD(token.price)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {token.whaleTxs > 100 && <BarChart3 className="w-3 h-3 text-whale-red flex-shrink-0" />}
                      <span className={clsx('text-sm font-bold font-mono', token.whaleTxs > 100 ? 'text-whale-red' : 'text-whale-text')}>
                        {token.whaleTxs}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-whale-text">{formatUSD(token.volume24h, true)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {token.change24h >= 0
                        ? <TrendingUp className="w-3 h-3 text-whale-green" />
                        : <TrendingDown className="w-3 h-3 text-whale-red" />
                      }
                      <span className={clsx('text-sm font-mono font-semibold', changeColor(token.change24h))}>
                        {formatPercent(token.change24h)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-whale-text">{formatUSD(token.marketCap, true)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs font-semibold', ACTIVITY_COLORS[token.whaleActivity])}>
                      {token.whaleActivity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={SOLSCAN_TOKEN(token.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-whale-text-muted hover:text-whale-accent transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-whale-text-muted text-center pb-4">
        {isLive
          ? `Live data from Birdeye — ${tokens.length} Solana tokens by 24h volume. Updates on page load.`
          : 'Demo data shown. Add a Birdeye API key in Settings to load live token data.'}
      </p>
    </div>
  )
}
