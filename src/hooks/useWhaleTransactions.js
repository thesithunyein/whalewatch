import { useState, useEffect, useCallback, useRef } from 'react'
import { WHALE_THRESHOLD_USD } from '../config.js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const DEMO_TOKENS = [
  { symbol: 'SOL', address: 'So11111111111111111111111111111111111111112', price: 180 },
  { symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', price: 0.000035 },
  { symbol: 'WIF', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', price: 3.2 },
  { symbol: 'JUP', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', price: 1.15 },
  { symbol: 'PYTH', address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', price: 0.45 },
  { symbol: 'RNDR', address: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof', price: 8.9 },
  { symbol: 'JITO', address: 'jtojtomepa8bdgrqq1d2nm1maz1dm64j8h5a6jq91pt', price: 4.2 },
  { symbol: 'DRIFT', address: 'DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7', price: 0.85 },
]

function randomHex(len = 64) {
  return Array.from({ length: len }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
}

function randomAddress() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function generateDemoTx(id) {
  const token = DEMO_TOKENS[Math.floor(Math.random() * DEMO_TOKENS.length)]
  const side = Math.random() > 0.5 ? 'buy' : 'sell'
  const usdValue = WHALE_THRESHOLD_USD + Math.random() * 490000
  const amount = usdValue / token.price
  const priceImpact = Math.random() * 6 - 0.5
  return {
    id: `demo-${id}-${Date.now()}`,
    signature: randomHex(64),
    tokenSymbol: token.symbol,
    tokenAddress: token.address,
    side,
    amount,
    usdValue,
    price: token.price * (1 + priceImpact / 100),
    priceImpact,
    from: randomAddress(),
    to: randomAddress(),
    timestamp: Math.floor(Date.now() / 1000),
    blockTime: Math.floor(Date.now() / 1000),
    isDemo: true,
  }
}

/**
 * @param {boolean} hasApiKey  Whether a Birdeye API key is configured server-side.
 */
export function useWhaleTransactions(hasApiKey = false) {
  const [transactions, setTransactions] = useState(() =>
    Array.from({ length: 20 }, (_, i) => generateDemoTx(i))
  )
  const [liveMode, setLiveMode] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [totalVolume, setTotalVolume] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const counterRef = useRef(20)
  const mounted = useRef(true)
  const seenIds = useRef(new Set())

  // ─── Live fetch from Supabase Edge Function ────────────────────────────────
  const fetchLiveFeed = useCallback(async () => {
    if (!mounted.current) return
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/birdeye-whale-feed`, {
        headers: { 'apikey': SUPABASE_ANON_KEY },
      })
      const json = await res.json()
      if (!json.success) {
        const msg = json?.error || `HTTP ${res.status}`
        if (mounted.current) setFetchError(msg)
        return
      }
      const trades = json.data || []
      if (!mounted.current) return

      // Filter for trades above threshold that we haven't seen yet
      const newTrades = trades.filter((tx) => {
        if (seenIds.current.has(tx.id)) return false
        if ((tx.usdValue || 0) < WHALE_THRESHOLD_USD) return false
        seenIds.current.add(tx.id)
        return true
      })

      if (newTrades.length > 0) {
        setTransactions((prev) => {
          // On first successful load, replace demo seed data entirely
          const prevHasDemo = prev.some((t) => t.isDemo)
          const base = prevHasDemo ? [] : prev
          return [...newTrades, ...base].slice(0, 200)
        })
      }

      if (trades.length > 0) {
        setLiveMode(true)
        setFetchError(null)
        setLastUpdated(Date.now())
      }
    } catch (err) {
      if (mounted.current) setFetchError(err.message || 'Network error')
    }
  }, [])

  // ─── Effect: live polling or demo mode ────────────────────────────────────
  useEffect(() => {
    mounted.current = true
    seenIds.current = new Set()

    if (hasApiKey) {
      // Seed with demo data while the first fetch is in-flight
      setTransactions(Array.from({ length: 20 }, (_, i) => generateDemoTx(i)))
      setLiveMode(false)
      setFetchError(null)

      fetchLiveFeed()
      const interval = setInterval(fetchLiveFeed, 15000)
      return () => {
        mounted.current = false
        clearInterval(interval)
      }
    }

    // Demo mode — inject a new simulated tx every 3–8 seconds
    setLiveMode(false)
    setFetchError(null)
    const timerRef = { current: null }

    const schedule = () => {
      const delay = 3000 + Math.random() * 5000
      timerRef.current = setTimeout(() => {
        if (!mounted.current) return
        const tx = generateDemoTx(counterRef.current++)
        setTransactions((prev) => [tx, ...prev].slice(0, 200))
        setTotalVolume((v) => v + tx.usdValue)
        schedule()
      }, delay)
    }

    schedule()
    return () => {
      mounted.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [hasApiKey, fetchLiveFeed])

  const volume24h = transactions.reduce((s, t) => s + (t.usdValue || 0), 0) + totalVolume
  const activeWhales = new Set(transactions.map((t) => t.from).filter(Boolean)).size

  return {
    transactions,
    volume24h,
    activeWhales,
    isLive: liveMode,
    isDemo: !liveMode,
    fetchError,
    lastUpdated,
  }
}
