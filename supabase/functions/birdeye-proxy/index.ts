import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BIRDEYE_BASE = 'https://public-api.birdeye.so'

// Paths allowed to proxy — safety allowlist
const ALLOWED_PATHS = [
  '/defi/tokenlist',
  '/defi/token_overview',
  '/defi/ohlcv',
  '/defi/txs/token',
  '/defi/token_trending',
  '/defi/token_security',
  '/defi/multi_price',
  '/defi/v3/all-time/list',
  '/defi/v3/search',
  '/defi/price',
  '/v1/wallet/token_list',
  '/v1/wallet/tx_list',
]

async function getApiKey(): Promise<string | null> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const { data } = await supabase
    .from('whale_settings')
    .select('birdeye_api_key')
    .eq('id', 1)
    .single()
  return data?.birdeye_api_key || null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const reqUrl = new URL(req.url)
    const path = reqUrl.searchParams.get('path') || ''

    if (!ALLOWED_PATHS.some((p) => path.startsWith(p))) {
      return new Response(
        JSON.stringify({ error: `Path "${path}" is not allowed` }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = await getApiKey()
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'No Birdeye API key configured. Add one in Settings.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build upstream URL — forward all query params except 'path'
    const birdeyeUrl = new URL(`${BIRDEYE_BASE}${path}`)
    reqUrl.searchParams.forEach((v, k) => {
      if (k !== 'path') birdeyeUrl.searchParams.set(k, v)
    })

    const upstreamRes = await fetch(birdeyeUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'x-chain': 'solana',
        'X-API-KEY': apiKey,
      },
    })

    const body = await upstreamRes.text()

    return new Response(body, {
      status: upstreamRes.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message || 'Proxy error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
