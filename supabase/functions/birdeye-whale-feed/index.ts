import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BIRDEYE_BASE = 'https://public-api.birdeye.so'
const WHALE_MIN_USD = 10000

async function getApiKey(): Promise<string | null> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!
  )
  const { data } = await supabase
    .from('whale_settings')
    .select('birdeye_api_key')
    .eq('id', 1)
    .single()
  return data?.birdeye_api_key || null
}

async function birdeyeGet(path: string, params: Record<string, string>, apiKey: string) {
  const url = new URL(`${BIRDEYE_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json', 'x-chain': 'solana', 'X-API-KEY': apiKey },
  })
  if (!res.ok) throw new Error(`Birdeye ${res.status} for ${path}`)
  return res.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const apiKey = await getApiKey()
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'No Birdeye API key configured. Add one in Settings.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1 — top 8 Solana tokens by all-time volume
    let tokenList: { address: string; symbol: string }[] = []
    try {
      const listData = await birdeyeGet('/defi/v3/all-time/list', {
        chain: 'solana',
        sort_by: 'volume_usd',
        sort_type: 'desc',
        offset: '0',
        limit: '8',
      }, apiKey) as any

      const items = listData?.data?.items || listData?.data || []
      tokenList = items.slice(0, 8).map((t: any) => ({
        address: t.address,
        symbol: t.symbol || t.name || '???',
      }))
    } catch (e: any) {
      return new Response(
        JSON.stringify({ success: false, error: `token-list fetch failed: ${e.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!tokenList.length) {
      return new Response(
        JSON.stringify({ success: false, error: 'Birdeye returned no tokens' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2 — parallel fetch of recent swaps for each token
    const tradePromises = tokenList.map(async (tok) => {
      try {
        const res = await birdeyeGet('/defi/txs/token', {
          address: tok.address,
          tx_type: 'swap',
          sort_type: 'desc',
          offset: '0',
          limit: '30',
        }, apiKey) as any

        const items: any[] = res?.data?.items || res?.data?.trades || []
        return items
          .filter((tx: any) => {
            const val = tx.volumeUSD ?? tx.volume ?? tx.value ?? 0
            return Number(val) >= WHALE_MIN_USD
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
      .sort((a: any, b: any) => b.timestamp - a.timestamp)
      .slice(0, 100)

    return new Response(
      JSON.stringify({ success: true, data: allTrades, tokenCount: tokenList.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e: any) {
    return new Response(
      JSON.stringify({ success: false, error: e.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
