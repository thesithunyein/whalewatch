import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Activity, Radio } from 'lucide-react'
import clsx from 'clsx'
import { formatUSD, formatPercent, changeColor } from '../utils/formatters.js'
import { useApp } from '../context/AppContext.jsx'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const TOKENS = [
  { symbol: 'SOL', change: 3.21, volume: 1_240_000_000, size: 4, sector: 'L1' },
  { symbol: 'BONK', change: -8.45, volume: 320_000_000, size: 3, sector: 'Meme' },
  { symbol: 'WIF', change: 12.7, volume: 450_000_000, size: 3, sector: 'Meme' },
  { symbol: 'JUP', change: 2.34, volume: 180_000_000, size: 2, sector: 'DeFi' },
  { symbol: 'POPCAT', change: -15.4, volume: 520_000_000, size: 3, sector: 'Meme' },
  { symbol: 'RNDR', change: 5.67, volume: 210_000_000, size: 2, sector: 'AI' },
  { symbol: 'PYTH', change: -1.23, volume: 95_000_000, size: 2, sector: 'Oracle' },
  { symbol: 'BOME', change: 4.56, volume: 89_000_000, size: 2, sector: 'Meme' },
  { symbol: 'DRIFT', change: 7.23, volume: 45_000_000, size: 1, sector: 'DeFi' },
  { symbol: 'JITO', change: -0.89, volume: 72_000_000, size: 1, sector: 'LST' },
  { symbol: 'RAY', change: -2.1, volume: 156_000_000, size: 2, sector: 'DeFi' },
  { symbol: 'MSOL', change: 3.15, volume: 28_000_000, size: 1, sector: 'LST' },
  { symbol: 'SAMO', change: 1.5, volume: 14_000_000, size: 1, sector: 'Meme' },
  { symbol: 'STEP', change: -4.2, volume: 8_000_000, size: 1, sector: 'DeFi' },
  { symbol: 'MNT', change: 0.8, volume: 19_000_000, size: 1, sector: 'Other' },
  { symbol: 'GENE', change: -6.1, volume: 6_500_000, size: 1, sector: 'Gaming' },
  { symbol: 'DFL', change: 2.9, volume: 11_000_000, size: 1, sector: 'DeFi' },
  { symbol: 'ATLAS', change: -3.3, volume: 7_200_000, size: 1, sector: 'Gaming' },
]

function getHeatColor(change) {
  if (change >= 10) return 'bg-emerald-600 text-white'
  if (change >= 5) return 'bg-emerald-700/80 text-white'
  if (change >= 2) return 'bg-emerald-800/70 text-white'
  if (change >= 0) return 'bg-emerald-900/60 text-white'
  if (change >= -2) return 'bg-red-900/60 text-white'
  if (change >= -5) return 'bg-red-800/70 text-white'
  if (change >= -10) return 'bg-red-700/80 text-white'
  return 'bg-red-600 text-white'
}

function getSizeClass(size) {
  if (size >= 4) return 'col-span-2 row-span-2 h-40'
  if (size >= 3) return 'col-span-2 h-28'
  if (size >= 2) return 'h-24'
  return 'h-20'
}

const TIMEFRAMES = ['1H', '4H', '24H', '7D']
const SECTORS = ['All', 'Meme', 'DeFi', 'L1', 'AI', 'LST', 'Oracle', 'Gaming']

function mapLiveToken(t) {
  const vol = Number(t.v24hUSD ?? t.volume24hUSD ?? t.volume24h ?? 0)
  let size = 1
  if (vol >= 1_000_000_000) size = 4
  else if (vol >= 400_000_000) size = 3
  else if (vol >= 80_000_000) size = 2
  // Birdeye tokenlist uses v24hChangePercent in current API; keep fallbacks for resilience
  const change = Number(
    t.v24hChangePercent ??
    t.priceChange24hPercent ??
    t.priceChange24h ??
    t.change24h ??
    t.priceChangePercent24h ??
    0
  )
  return {
    symbol: t.symbol || '???',
    change,
    volume: vol,
    size,
    sector: 'Other',
  }
}

async function fetchLiveHeatmap() {
  const url = new URL(`${SUPABASE_URL}/functions/v1/birdeye-proxy`)
  url.searchParams.set('path', '/defi/tokenlist')
  url.searchParams.set('sort_by', 'v24hUSD')
  url.searchParams.set('sort_type', 'desc')
  url.searchParams.set('offset', '0')
  url.searchParams.set('limit', '30')
  const res = await fetch(url.toString(), { headers: { 'apikey': SUPABASE_ANON_KEY } })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  const tokens = json?.data?.tokens || json?.data || []
  return tokens.map(mapLiveToken)
}

export default function Heatmap() {
  const { hasApiKey } = useApp()
  const [timeframe, setTimeframe] = useState('24H')
  const [sector, setSector] = useState('All')
  const [liveTokens, setLiveTokens] = useState(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveError, setLiveError] = useState(null)

  const isLive = hasApiKey && liveTokens !== null && liveTokens.length > 0
  const displayTokens = isLive ? liveTokens : TOKENS

  useEffect(() => {
    if (!hasApiKey) { setLiveTokens(null); return }
    let cancelled = false
    setLiveLoading(true)
    setLiveError(null)
    fetchLiveHeatmap()
      .then((data) => { if (!cancelled) setLiveTokens(data) })
      .catch((e) => { if (!cancelled) setLiveError(e.message) })
      .finally(() => { if (!cancelled) setLiveLoading(false) })
    return () => { cancelled = true }
  }, [hasApiKey])

  const filtered = displayTokens.filter((t) => sector === 'All' || t.sector === sector)
  const gainers = [...displayTokens].sort((a, b) => b.change - a.change).slice(0, 3)
  const losers = [...displayTokens].sort((a, b) => a.change - b.change).slice(0, 3)

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-whale-text flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-whale-accent" />
            Whale Heatmap
          </h1>
          <p className="text-sm text-whale-text-muted mt-0.5">
            Token performance colored by price change and sized by whale volume
          </p>
        </div>
        <div className="flex items-center gap-2">
          {liveLoading && <span className="w-3.5 h-3.5 border-2 border-whale-accent border-t-transparent rounded-full animate-spin" />}
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

      {/* Top movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-whale-card border border-whale-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-whale-green" />
            <h3 className="text-sm font-semibold text-whale-text">Top Gainers</h3>
          </div>
          <div className="space-y-2">
            {gainers.map((t) => (
              <div key={t.symbol} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-whale-text">{t.symbol}</span>
                <span className="text-sm font-bold font-mono text-whale-green">{formatPercent(t.change)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-whale-card border border-whale-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-whale-red" />
            <h3 className="text-sm font-semibold text-whale-text">Top Losers</h3>
          </div>
          <div className="space-y-2">
            {losers.map((t) => (
              <div key={t.symbol} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-whale-text">{t.symbol}</span>
                <span className="text-sm font-bold font-mono text-whale-red">{formatPercent(t.change)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-whale-card border border-whale-border rounded-xl p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                timeframe === tf ? 'bg-whale-accent text-white' : 'text-whale-text-dim hover:text-whale-text'
              )}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                sector === s
                  ? 'bg-whale-accent text-white border-whale-accent'
                  : 'border-whale-border text-whale-text-dim hover:border-whale-accent/50'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-whale-text-muted">Price change:</span>
        {[
          { label: '>10%', cls: 'bg-emerald-600' },
          { label: '2–10%', cls: 'bg-emerald-800/70' },
          { label: '0–2%', cls: 'bg-emerald-900/60' },
          { label: '0 to -2%', cls: 'bg-red-900/60' },
          { label: '-2 to -10%', cls: 'bg-red-800/70' },
          { label: '<-10%', cls: 'bg-red-600' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={clsx('w-3 h-3 rounded', l.cls)} />
            <span className="text-[10px] text-whale-text-muted">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="bg-whale-card border border-whale-border rounded-xl p-4">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 auto-rows-auto">
          {filtered.map((token) => (
            <div
              key={token.symbol}
              className={clsx(
                'rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-lg select-none',
                getHeatColor(token.change),
                getSizeClass(token.size)
              )}
              title={`${token.symbol}: ${formatPercent(token.change)}`}
            >
              <span className="text-xs font-bold leading-tight">{token.symbol}</span>
              <span className={clsx('text-[10px] font-semibold leading-tight mt-0.5', token.change >= 0 ? 'text-emerald-200' : 'text-red-200')}>
                {formatPercent(token.change)}
              </span>
              {token.size >= 2 && (
                <span className="text-[9px] opacity-70 mt-0.5">{formatUSD(token.volume, true)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-whale-text-muted text-center pb-4">
        {isLive
          ? `Live data from Birdeye — ${displayTokens.length} tokens by 24h volume. Updates on page load.`
          : 'Demo data shown. Connect a Birdeye API key in Settings for live market data.'}
      </p>
    </div>
  )
}
