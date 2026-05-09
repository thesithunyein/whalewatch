# 🐋 WhaleWatch — Real-Time Solana Whale Intelligence

> The trading intelligence cockpit that surfaces $10K+ Solana mainnet swaps, smart-money wallet flows, and token-level signal — powered by deep Birdeye integration.

**🌐 Live App:** https://whalewatch-frontier.vercel.app
**📦 GitHub:** https://github.com/thesithunyein/whalewatch
**�️ Built on:** [Eitherway](https://eitherway.ai)
**🔌 Primary Partner:** [Birdeye](https://birdeye.so) · **Secondary:** [QuickNode](https://www.quicknode.com)
**⛓️ Network:** Solana **mainnet-beta** (live data, real on-chain transactions)

---

## 🎯 The Problem We Solve

> *"Crypto traders lose alpha every minute they aren't watching the on-chain whale flow."*

Solana produces tens of thousands of DEX swaps per minute. The few that move markets — whale buys, smart-money rotations, liquidity flips — are buried in noise. WhaleWatch surfaces only the ones that matter: $10K+ swaps, scored, filtered, and one click from Solscan.

**Target user:** active Solana traders, on-chain analysts, copy-traders, alpha-callers.
**Daily use case:** open WhaleWatch → see what whales bought in the last 15 seconds → act.

---

## ✨ Six Production-Ready Pages

| Page | What It Does | Birdeye Endpoints |
|---|---|---|
| **Live Feed** | $10K+ Solana swaps streaming every 15s with "Updated Xs ago" indicator | `/defi/tokenlist` + `/defi/txs/token` |
| **Smart Money** | 10 curated whale wallets + private watchlist, one-click Solscan portfolio | `/v1/wallet/*` (where available) |
| **Token Screener** | Every Solana token sorted by 24h volume, liquidity, market cap | `/defi/tokenlist` |
| **Heatmap** | Top-50 token grid colored by 24h % change, sized by volume | `/defi/tokenlist` |
| **Alerts** | Configurable rule engine (whale buys, price spikes, wallet activity) — Public Beta | Triggered by Live Feed stream |
| **Settings** | Encrypted server-side Birdeye key with live validation | `/defi/price` |

---

## 🔬 Why This Is a *Deep* Birdeye Integration

The Birdeye track judges look for products where **"data is the core product engine, not just a display layer."** WhaleWatch hits all five of Birdeye's own example deep-integration patterns:

| Birdeye Example | WhaleWatch Page |
|---|---|
| ✅ Whale tracking dashboards | Live Feed |
| ✅ Smart money movement monitoring | Smart Money |
| ✅ Custom token screeners | Token Screener |
| ✅ Real-time trading alert systems | Alerts |
| ✅ Market intelligence tools (liquidity, volume, anomalies) | Heatmap |

**Endpoints integrated** (server-side, allowlist-gated):
`/defi/tokenlist` · `/defi/txs/token` · `/defi/price` · `/defi/multi_price` · `/defi/ohlcv` · `/defi/token_overview` · `/defi/token_trending` · `/defi/token_security` · `/defi/v3/search` · `/v1/wallet/token_list` · `/v1/wallet/tx_list`

📄 **[INTEGRATION.md](./INTEGRATION.md)** — full endpoint-by-endpoint architectural deep dive.

---

## 🏗️ Architecture

```
┌──────────────────┐    ┌──────────────────────┐    ┌──────────────┐
│  React + Vite    │───▶│  Supabase Edge Fns   │───▶│   Birdeye    │
│  (Vercel CDN)    │    │  (Deno · Auth proxy) │    │   API        │
└──────────────────┘    └──────────┬───────────┘    └──────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  whale_settings │
                          │  (Postgres RLS) │
                          └─────────────────┘
```

### Production-grade engineering

- **API key never exposed to the browser** — server-side Deno Edge Functions read the encrypted Birdeye key from Postgres on every request
- **Rate-limit aware** — sequential 1.2s-spaced fetches keep us under Birdeye Standard's 1 req/s cap, with graceful degradation if any single token times out
- **CORS-safe** — `OPTIONS` preflight handled, all responses return `Access-Control-Allow-Origin: *`
- **Field-name resilient** — handles both `v24hChangePercent` and `priceChange24hPercent` Birdeye response variants
- **Live-mode auto-detection** — frontend polls `check-birdeye-key`; switches from demo seed to live stream the moment a key is saved

### Edge Functions (Deno)

| Function | Lines | Purpose |
|---|---|---|
| `birdeye-whale-feed` | ~110 | Aggregates whales: tokenlist → txs/token (sequential) → ≥$10K filter |
| `birdeye-proxy` | ~70 | Allowlist-gated generic proxy (12 permitted Birdeye paths) |
| `check-birdeye-key` | ~30 | Returns `{ hasKey: boolean }` to drive UI state |
| `save-birdeye-key` | ~50 | Validates a candidate key against `/defi/price` before persisting |

---

## 📊 Judging-Criteria Alignment

### 1. Real-world utility (30%)
- Solves an active pain: **whale alpha discovery on Solana**
- Daily-active utility for traders, not a one-time toy
- 10 pre-curated whale wallets so the value is visible on first load

### 2. Product quality (30%)
- 6 fully-functional pages, mobile-responsive
- Loading skeletons, error banners, graceful demo-mode fallback
- Live "Updated Xs ago" indicator + pulsing LIVE badge
- Toast notifications, copy-to-clipboard, Solscan deep-links everywhere
- Custom favicon, OG meta tags, SEO-friendly title

### 3. Integration depth (25%)
- **7+ Birdeye endpoints** in active use
- Server-side proxy with **allowlist + rate-limiting + key vaulting**
- Field-name fallback chains for API resilience
- Detailed [`INTEGRATION.md`](./INTEGRATION.md) explaining each touchpoint

### 4. Adoption potential (15%)
- Zero-config landing experience (works without API key in demo mode)
- Self-serve API-key onboarding with live validation
- Free tier compatible (Birdeye Standard plan is sufficient)
- MIT license, public GitHub, ready for forks/contributions

---

## 🧪 Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 18 · Vite 5 · TailwindCSS 3 · React Router 6 · Lucide |
| **Backend** | Supabase Postgres + Deno Edge Functions |
| **Data** | Birdeye API (primary) · QuickNode RPC (Solana mainnet) |
| **Hosting** | Vercel (auto-deploy from `main`) |
| **Build platform** | [Eitherway](https://eitherway.ai) |

---

## 🚀 Run Locally

```bash
git clone https://github.com/thesithunyein/whalewatch.git
cd whalewatch
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Open http://localhost:5173 → add your Birdeye API key in **Settings** → live mode activates instantly.

---

## 🛠️ Built on Eitherway

WhaleWatch was scaffolded with **Eitherway** ("Build a Solana whale tracker integrating Birdeye") and iterated through ~six rounds of refinement. Custom layers (Edge Functions, allowlist proxy, rate-limiting, server-side key vault) were added on top via standard GitHub → Vercel deployment.

Eitherway delivered a working multi-page React + Supabase application in under an hour — proving the platform's "idea to live Solana dApp in minutes" promise.

---

## ⏳ Built to Survive Past Judging

Per the bounty brief: *"Build something that still exists 30 days after submission."*

- ✅ Hosted on Vercel free tier — no recurring cost
- ✅ Supabase free tier handles realistic traffic
- ✅ Birdeye Standard plan is free + sufficient for current load
- ✅ MIT license + public repo so contributors can fork or extend
- ✅ No paid dependencies, no expiring API keys

This dApp will keep running long after May 27.

---

## 📜 License

MIT — fork it, ship it, build on it.
