import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { key } = await req.json()

    if (!key || typeof key !== 'string' || key.trim().length < 8) {
      return new Response(
        JSON.stringify({ error: 'A valid API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const trimmedKey = key.trim()

    // Validate the key against Birdeye before saving
    const testRes = await fetch(
      'https://public-api.birdeye.so/defi/price?address=So11111111111111111111111111111111111111112',
      { headers: { 'X-API-KEY': trimmedKey, 'x-chain': 'solana' } }
    )

    if (!testRes.ok) {
      return new Response(
        JSON.stringify({ error: `Birdeye rejected the key (HTTP ${testRes.status}). Check that it is correct and has sufficient credits.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store in Supabase using service role — bypasses RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase
      .from('whale_settings')
      .upsert({ id: 1, birdeye_api_key: trimmedKey, updated_at: new Date().toISOString() }, { onConflict: 'id' })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
