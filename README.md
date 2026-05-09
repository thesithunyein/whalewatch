# 🐋 WhaleWatch — Real-Time Solana Whale Intelligence Dashboard

> Production-grade trading intelligence platform that surfaces $10K+ Solana DEX swaps, tracks smart money wallets, and screens trending tokens — all in real time.

**🌐 Live App:** https://whalewatch-frontier.vercel.app
**🎥 Demo Video:** _Coming soon_
**📦 Built with:** [Eitherway](https://eitherway.ai) · [Birdeye](https://birdeye.so) · [QuickNode](https://www.quicknode.com) · [Helius](https://helius.dev) · [Supabase](https://supabase.com)

---

## ⚡ What It Does

Crypto traders lose alpha every minute they aren't watching the on-chain whale flow. WhaleWatch is the all-in-one intelligence cockpit:

| Page | What It Shows |
|---|---|
| **Live Feed** | Streaming swaps ≥ $10K USD across top Solana tokens, polling Birdeye every 15s |
| **Smart Money** | Curated whale wallet roster + your private watchlist with live portfolio data |
| **Token Screener** | Filter every Solana token by volume / liquidity / holders / age |
| **Alerts** | Custom triggers ("alert me when SOL drops 5% in 1h") with browser + sound notifications |
| **Heatmap** | 24h volume heatmap of the top 50 Solana tokens |
| **Settings** | Encrypted Birdeye API key store (server-side only — never in browser) |

---

## 🏗️ Architecture

```
┌──────────────────┐    ┌─────────────────────┐    ┌──────────────┐
│  React + Vite    │───▶│  Supabase Edge Fns  │───▶│   Birdeye    │
│  (Vercel CDN)    │    │  (Deno · Sec proxy) │    │   API        │
└──────────────────┘    └──────────┬──────────┘    └──────────────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │  whale_settings│
                          │  (Postgres)    │
                          └────────────────┘
```

### Why this is a real production architecture

- **API key never exposed to the browser** — Supabase Edge Functions act as an authenticated proxy, fetching the user's encrypted Birdeye key server-side on every request
- **CORS-clean & rate-limit-aware** — sequential requests with 1.2s back-off keep us under Birdeye's free-tier 1 req/sec cap
- **Stateless frontend** — no localStorage secrets, no leaky env vars; the only client-side env vars are `VITE_SUPABASE_URL` and the public anon key

### Edge Functions (Deno)

| Function | Purpose |
|---|---|
| `birdeye-whale-feed` | Fetches top 4 tokens by 24h volume → pulls recent trades for each → filters ≥ $10K |
| `birdeye-proxy` | Allowlist-gated generic proxy for token overview, OHLCV, wallet portfolios, etc. |
| `check-birdeye-key` | Tells the frontend whether a key is configured (controls demo/live mode) |
| `save-birdeye-key` | Validates a key against Birdeye's `/defi/price` endpoint, then upserts into Postgres |

---

## 🧪 Tech Stack

**Frontend**
- React 18 · Vite 5 · TailwindCSS 3
- React Router 6 · Recharts · Lucide icons
- date-fns · clsx

**Backend**
- Supabase (Postgres + Edge Functions on Deno)
- Birdeye API (token list, trades, prices)
- QuickNode (Solana RPC fallback)

**Infrastructure**
- Built end-to-end with **Eitherway**
- Hosted on **Vercel** (free tier)
- CI/CD via GitHub → Vercel auto-deploy

---

## 🚀 Run Locally

```bash
git clone https://github.com/thesithunyein/whalewatch.git
cd whalewatch
npm install
cp .env.example .env  # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Then open http://localhost:5173 and add your Birdeye API key in Settings.

---

## 🎯 Built for Hackathon

This project was built end-to-end with **Eitherway** — from initial scaffolding ("Build a Solana whale tracker") through six iteration rounds that added live data, server-side key vaulting, and production polish.

**Why Eitherway won here:** Generated a working multi-page React app with a real Supabase backend in under an hour. Custom integrations layered on top via standard GitHub → Vercel deployment.

### Submission tracks
- 🥇 **Birdeye** — primary integration (trades, token list, wallet portfolio)
- 🥈 **QuickNode** — Solana RPC for token metadata fallback
- 🥉 **Helius** — alert webhooks (UI ready, hookup pending)

---

## 📜 License

MIT — fork it, ship it, make money.
