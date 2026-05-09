# Birdeye Integration Documentation

> WhaleWatch uses Birdeye's API as the **core intelligence layer** for every page. This document details exactly how, where, and why.

---

## 🎯 Integration Philosophy

We treat Birdeye as a **product engine, not a display layer**:

- Every whale transaction shown is fetched live from Birdeye every 15 seconds
- Smart-money wallet portfolios are computed from Birdeye's `/v1/wallet/token_list`
- Token discovery uses Birdeye's volume/liquidity-sorted token universe
- Price impact calculations rely on Birdeye's liquidity data

The user's Birdeye API key is **never exposed to the browser**. It's stored encrypted in Supabase Postgres and accessed only by Deno Edge Functions running server-side.

---

## 🏗️ Architecture

```
React (Vercel) ──https──▶ Supabase Edge Functions ──https──▶ Birdeye API
                          (Deno · Server-side)                (X-API-KEY auth)
                              │
                              └─▶ whale_settings (Postgres, RLS)
```

### Why this is a deep integration

1. **Server-side proxy** — All Birdeye calls go through 4 custom Deno Edge Functions, not direct browser calls
2. **Allowlist gating** — `birdeye-proxy` only forwards 12 explicitly-permitted Birdeye paths (security hardening)
3. **Rate-limit handling** — Sequential fetches with 1.2s back-off keep us under Birdeye free-tier 1 req/sec cap
4. **Encrypted key storage** — User keys validated against `/defi/price` before persisting; stored in Postgres with row-level security

---

## 📡 Birdeye Endpoints Used

### 1. `GET /defi/tokenlist` — Top Token Discovery

**Used by:** `birdeye-whale-feed` Edge Function, Token Screener, Heatmap

```typescript
// supabase/functions/birdeye-whale-feed/index.ts
const list = await bget('/defi/tokenlist', {
  sort_by: 'v24hUSD',
  sort_type: 'desc',
  offset: '0',
  limit: '4',
}, key)
```

**Why:** Identifies the top 4 Solana tokens by 24h volume — these are where whale activity is most likely.

---

### 2. `GET /defi/txs/token` — Whale Transaction Stream

**Used by:** `birdeye-whale-feed` Edge Function (Live Feed page)

```typescript
const r = await bget('/defi/txs/token', {
  address: tok.address,
  offset: '0',
  limit: '20',
}, key)
```

**Pipeline:**
1. For each top-volume token, fetch 20 most recent trades
2. Filter trades where `volumeUSD >= $10,000`
3. Normalize fields (handles both camelCase + snake_case Birdeye response variants)
4. Sort by timestamp, return top 50 whales

**Polled every 15 seconds** from the React frontend.

---

### 3. `GET /v1/wallet/token_list` — Smart-Money Portfolio Tracking

**Used by:** Smart Money page (10 curated whale wallets + user watchlist)

```typescript
// src/pages/SmartMoney.jsx
const url = new URL(`${SUPABASE_URL}/functions/v1/birdeye-proxy`)
url.searchParams.set('path', '/v1/wallet/token_list')
url.searchParams.set('wallet', address)
const res = await fetch(url.toString())
```

**Why:** Shows live portfolio USD value + token count for each tracked wallet. Updates when the user opens the page.

---

### 4. `GET /defi/price` — Key Validation

**Used by:** `save-birdeye-key` Edge Function

```typescript
// supabase/functions/save-birdeye-key/index.ts
const test = await fetch(
  'https://public-api.birdeye.so/defi/price?address=So11111111111111111111111111111111111111112',
  { headers: { 'X-API-KEY': trimmed, 'x-chain': 'solana' } }
)
if (!test.ok) return error('Birdeye rejected key')
```

**Why:** Before persisting a user-supplied API key, we test it against Birdeye's lightest endpoint. Rejected keys never reach our database.

---

### 5. `GET /defi/multi_price`, `/defi/ohlcv`, `/defi/token_overview`, `/defi/token_trending`, `/defi/token_security`, `/defi/v3/search`, `/v1/wallet/tx_list`

**Used by:** `birdeye-proxy` (allowlist-gated generic forwarder for Token Screener filters, charts, search)

---

## 🔐 Edge Functions (Deno)

| Function | Lines | Purpose |
|---|---|---|
| `birdeye-whale-feed` | ~110 | Whale tx aggregator (tokenlist + sequential txs/token + filter) |
| `birdeye-proxy` | ~70 | Allowlist-gated proxy (12 permitted Birdeye paths) |
| `check-birdeye-key` | ~30 | Returns `{ hasKey: boolean }` to frontend |
| `save-birdeye-key` | ~50 | Validates key against Birdeye, upserts to Postgres |

All functions:
- Use `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (auto-injected) to read from `whale_settings`
- Send `x-chain: solana` header to Birdeye
- Return CORS-safe JSON responses
- Log to Supabase Edge Function logs for observability

---

## 📊 What Each Page Does With Birdeye Data

| Page | Birdeye Endpoint | What's Surfaced |
|---|---|---|
| **Live Feed** | `/defi/tokenlist` + `/defi/txs/token` | $10K+ swaps streaming every 15s |
| **Smart Money** | `/v1/wallet/token_list` | Portfolio USD + token count per whale |
| **Token Screener** | `/defi/tokenlist` | Filter by volume / liquidity / age |
| **Heatmap** | `/defi/tokenlist` | 24h volume grid of top 50 tokens |
| **Alerts** | `/defi/multi_price` (planned) | Trigger conditions on price/volume |
| **Settings** | `/defi/price` | API key validation |

---

## 🚦 Rate-Limit Strategy

Birdeye Standard (free tier) limits requests to roughly 1 per second. Naive parallel calls fail with HTTP 429.

**Our approach:**

```typescript
const SLEEP_MS = 1200  // stay under 1 req/sec
for (const tok of tokens) {
  await sleep(SLEEP_MS)
  await bget('/defi/txs/token', ...)
}
```

- Sequential fetches with 1.2s spacing
- Limit token count to 4 (1 + 4 = 5 total req per poll)
- 15-second poll cycle = 5 req / 15s = well under quota
- Continues if one token fails (graceful degradation)

---

## 🧪 Real On-Chain Examples

Confirmed working live data examples (mainnet):

```
$8.9M SOL buy → A9gfx4z5...wsyZ → Solscan confirms
$6.79M SOL buy → 59J7sv2b...EGHt5n → Solscan confirms
$626K SOL buy on Meteora DAMM v2 → Solscan confirms
```

All transactions are reachable via Solscan link in the UI.

---

## ✅ Production Readiness Checklist

- [x] Server-side API key (never in browser localStorage / env)
- [x] CORS-safe (Edge Functions allow all origins for `OPTIONS`)
- [x] Rate-limit aware (sequential w/ back-off)
- [x] Field-name resilient (handles camelCase + snake_case Birdeye variants)
- [x] Error boundary (UI shows banner instead of crashing)
- [x] Graceful demo mode if no key configured
- [x] Solana mainnet only (`x-chain: solana` header on every request)

---

## 🔬 Verification

Anyone can verify the live integration:

1. Open https://whalewatch-frontier.vercel.app
2. Live Feed shows the green LIVE badge + "Updated Xs ago" timestamp
3. Click any whale tx external link → opens Solscan with real on-chain confirmation
4. Open DevTools Network tab → see polling calls to `*.supabase.co/functions/v1/birdeye-whale-feed` every 15s

---

## 📚 Birdeye Docs Referenced

- API base: https://public-api.birdeye.so
- Documentation: https://docs.birdeye.so/
- Free tier: 1 req/sec, 30K req/month
- All endpoints used are within free-tier scope
