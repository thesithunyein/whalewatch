import Fastify from 'fastify'
import cors from '@fastify/cors'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const app = Fastify({ logger: false })
await app.register(cors, { origin: true })

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || ''
const BIRDEYE_BASE = 'https://public-api.birdeye.so'

// Simple in-memory cache
const cache = new Map<string, { data: unknown; ts: number }>()
function getCache(key: string, ttlMs: number) {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.ts < ttlMs) return entry.data
  return null
}
function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() })
}

async function birdeyeFetch(path: string, params: Record<string, string> = {}, ttlMs = 30000, clientKey?: string) {
  const url = new URL(`${BIRDEYE_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const effectiveKey = clientKey || BIRDEYE_API_KEY
  const cacheKey = `${effectiveKey?.slice(-8) || 'nokey'}:${url.toString()}`
  const cached = getCache(cacheKey, ttlMs)
  if (cached) return cached

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'x-chain': 'solana',
  }
  if (effectiveKey) headers['X-API-KEY'] = effectiveKey

  const res = await fetch(url.toString(), { headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Birdeye ${res.status}: ${text}`)
  }
  const data = await res.json()
  setCache(cacheKey, data)
  return data
}

// Helper: extract client API key from request headers
function clientKey(req: any): string | undefined {
  return (req.headers['x-birdeye-key'] as string) || undefined
}

// Health check
app.get('/api/health', async () => ({ status: 'ok', birdeye: !!BIRDEYE_API_KEY, ts: Date.now() }))

// Token list with volume/liquidity
app.get('/api/birdeye/token-list', async (req) => {
  const q = req.query as Record<string, string>
  return birdeyeFetch('/defi/tokenlist', {
    sort_by: q.sort_by || 'v24hUSD',
    sort_type: q.sort_type || 'desc',
    offset: q.offset || '0',
    limit: q.limit || '50',
    min_liquidity: q.min_liquidity || '50000',
  }, 60000, clientKey(req))
})

// v3 all-time token list sorted by volume — used to discover top whale tokens
app.get('/api/birdeye/v3/token-list', async (req) => {
  const q = req.query as Record<string, string>
  return birdeyeFetch('/defi/v3/all-time/list', {
    chain: 'solana',
    sort_by: q.sort_by || 'volume_usd',
    sort_type: 'desc',
    offset: q.offset || '0',
    limit: q.limit || '20',
  }, 60000, clientKey(req))
})

// Whale feed: fetch top tokens by volume, then pull large trades for each
app.get('/api/birdeye/whale-feed', async (req) => {
  const key = clientKey(req)

  // Step 1 – top 8 tokens by all-time volume
  let tokenAddresses: { address: string; symbol: string }[] = []
  try {
    const listRes = await birdeyeFetch('/defi/v3/all-time/list', {
      chain: 'solana',
      sort_by: 'volume_usd',
      sort_type: 'desc',
      offset: '0',
      limit: '8',
    }, 120000, key) as any
    const items = listRes?.data?.items || listRes?.data || []
    tokenAddresses = items.slice(0, 8).map((t: any) => ({
      address: t.address,
      symbol: t.symbol || t.name || '???',
    }))
  } catch (e: any) {
    return { success: false, error: `token-list: ${e.message}` }
  }

  if (!tokenAddresses.length) {
    return { success: false, error: 'no tokens returned from all-time list' }
  }

  // Step 2 – fetch recent swaps for each token (parallel, best-effort)
  const WHALE_MIN = 10000
  const tradePromises = tokenAddresses.map(async (tok) => {
    try {
      const res = await birdeyeFetch('/defi/txs/token', {
        address: tok.address,
        tx_type: 'swap',
        sort_type: 'desc',
        offset: '0',
        limit: '30',
      }, 15000, key) as any
      const items: any[] = res?.data?.items || res?.data?.trades || []
      return items
        .filter((tx: any) => {
          const val = tx.volumeUSD ?? tx.volume ?? tx.value ?? 0
          return val >= WHALE_MIN
        })
        .map((tx: any) => ({
          id: tx.txHash || tx.signature || `${tok.address}-${tx.blockUnixTime}`,
          signature: tx.txHash || tx.signature || '',
          tokenSymbol: tok.symbol,
          tokenAddress: tok.address,
          side: tx.side === 'sell' ? 'sell' : 'buy',
          amount: tx.tokenAmount ?? tx.baseAmount ?? 0,
          usdValue: tx.volumeUSD ?? tx.volume ?? tx.value ?? 0,
          price: tx.priceUSD ?? tx.price ?? 0,
          priceImpact: tx.priceImpact ?? 0,
          from: tx.source ?? tx.owner ?? tx.fromAddress ?? '',
          to: tx.destination ?? tx.toAddress ?? '',
          timestamp: tx.blockUnixTime ?? Math.floor(Date.now() / 1000),
          isDemo: false,
        }))
    } catch {
      return []
    }
  })

  const results = await Promise.all(tradePromises)
  const allTrades = results
    .flat()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 100)

  return { success: true, data: allTrades, tokenCount: tokenAddresses.length }
})

// Token overview (price, volume, liquidity)
app.get('/api/birdeye/token/:address', async (req) => {
  const { address } = req.params as { address: string }
  return birdeyeFetch('/defi/token_overview', { address }, 15000, clientKey(req))
})

// Token price history (OHLCV)
app.get('/api/birdeye/ohlcv/:address', async (req) => {
  const { address } = req.params as { address: string }
  const q = req.query as Record<string, string>
  return birdeyeFetch('/defi/ohlcv', {
    address,
    type: q.type || '15m',
    time_from: q.time_from || String(Math.floor(Date.now() / 1000) - 86400),
    time_to: q.time_to || String(Math.floor(Date.now() / 1000)),
  }, 30000, clientKey(req))
})

// Wallet portfolio
app.get('/api/birdeye/wallet/:address', async (req) => {
  const { address } = req.params as { address: string }
  return birdeyeFetch('/v1/wallet/token_list', { wallet: address }, 60000, clientKey(req))
})

// Wallet transaction history
app.get('/api/birdeye/wallet/:address/txs', async (req) => {
  const { address } = req.params as { address: string }
  const q = req.query as Record<string, string>
  return birdeyeFetch('/v1/wallet/tx_list', {
    wallet: address,
    limit: q.limit || '50',
    offset: q.offset || '0',
  }, 30000, clientKey(req))
})

// Token trades (large txs)
app.get('/api/birdeye/trades/:address', async (req) => {
  const { address } = req.params as { address: string }
  const q = req.query as Record<string, string>
  return birdeyeFetch('/defi/txs/token', {
    address,
    tx_type: q.tx_type || 'swap',
    sort_type: 'desc',
    offset: q.offset || '0',
    limit: q.limit || '50',
  }, 10000, clientKey(req))
})

// Trending tokens
app.get('/api/birdeye/trending', async (req) => {
  return birdeyeFetch('/defi/token_trending', { sort_by: 'rank', sort_type: 'asc', offset: '0', limit: '20' }, 60000, clientKey(req))
})

// Token security info
app.get('/api/birdeye/security/:address', async (req) => {
  const { address } = req.params as { address: string }
  return birdeyeFetch('/defi/token_security', { address }, 120000, clientKey(req))
})

// Price multiple tokens
app.get('/api/birdeye/multi-price', async (req) => {
  const q = req.query as Record<string, string>
  const list_address = q.addresses || ''
  return birdeyeFetch('/defi/multi_price', { list_address }, 10000, clientKey(req))
})

// Solana token metadata search
app.get('/api/birdeye/search', async (req) => {
  const q = req.query as Record<string, string>
  return birdeyeFetch('/defi/v3/search', {
    keyword: q.q || '',
    target: 'token',
    sort_by: 'volume_24h_usd',
    sort_type: 'desc',
    offset: '0',
    limit: '20',
  }, 30000, clientKey(req))
})

const port = Number(process.env.PORT) || 3001
await app.listen({ port, host: '0.0.0.0' })
console.log(`\n🐋 WhaleWatch backend running on port ${port}`)
console.log(`   Birdeye API key: ${BIRDEYE_API_KEY ? '✅ configured' : '⚠️  not set — add BIRDEYE_API_KEY to .env.local'}`)
