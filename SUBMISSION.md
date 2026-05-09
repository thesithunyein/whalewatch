# Hackathon Submission — Copy/Paste Ready

## 📝 SUBMISSION TITLE
```
WhaleWatch — Real-Time Solana Whale Intelligence Dashboard
```

## 🏷️ TAGLINE (one liner, ~140 chars)
```
The all-in-one Solana whale cockpit: streaming $10K+ swaps, smart-money wallet tracking, token screener, and custom alerts — built on Eitherway.
```

## 🔗 LINKS
- **Live App:** https://whalewatch-frontier.vercel.app
- **GitHub:** https://github.com/thesithunyein/whalewatch
- **Demo Video:** _(paste YouTube/Loom link after recording)_

## 🎯 PRIMARY TRACK
**Birdeye** — for the deepest API integration (token list, trades, wallet portfolio, OHLCV)

Secondary: QuickNode (Solana RPC), Eitherway (build platform)

---

## 📖 DESCRIPTION (paste into submission form)

```
Crypto traders lose alpha every minute they're not watching whale flow. WhaleWatch is the production-grade intelligence cockpit they need.

Six pages, one mission — surface every $10K+ Solana DEX swap in real time, track curated smart-money wallets with live portfolio data, screen the entire Solana token universe by volume/liquidity/age, and fire custom alerts when whales make moves.

WHAT MAKES IT DIFFERENT:
• Real-time live data — Birdeye API key is stored server-side in Supabase (never in the browser), proxied through Deno Edge Functions with rate-limit-aware sequential calls
• Beautiful dark UI built mobile-first with Tailwind + Lucide icons
• Six fully functional pages — Live Feed, Smart Money, Token Screener, Alerts, Heatmap, Settings
• Production architecture: React + Vite frontend on Vercel CDN, Supabase Postgres backend, Deno Edge Functions for API proxy

BUILT WITH EITHERWAY:
The entire scaffold — multi-page routing, context providers, page components, Supabase client, edge functions — was generated through Eitherway prompts. We then layered custom code (Vercel deployment, manual edge-function tuning for Birdeye free-tier rate limits) on top.

INTEGRATIONS:
🥇 Birdeye — /defi/tokenlist, /defi/txs/token, /v1/wallet/token_list, /defi/price, /defi/multi_price, /defi/ohlcv
🥈 QuickNode — Solana RPC for fallback metadata fetches
🥉 Eitherway — code generation + GitHub deployment

TRY IT:
1. Open https://whalewatch-frontier.vercel.app
2. Watch real $100K+ Solana whale swaps stream in
3. Click any tx → opens Solscan with the real on-chain confirmation

This isn't a demo — it's a tool I'd actually pay for, built in a single weekend on Eitherway.
```

---

## 📸 SCREENSHOTS TO INCLUDE

1. **Live Feed page** with LIVE badge + real $1M+ whale tx
2. **Smart Money page** with whale wallet cards
3. **Token Screener** with filter chips
4. **Solscan tx** confirming a real whale swap
5. **Settings page** showing "API key configured — live data active"

---

## 🎤 ELEVATOR PITCH (60 sec — for video opening)

```
"Solana moves $5 billion daily, and 90% of retail traders have no idea where the smart money is going.

WhaleWatch is the cockpit that fixes that — six pages of real-time on-chain intelligence, $10K+ whale swaps streaming live, smart-money wallets tracked, every token in Solana screenable.

Built end-to-end on Eitherway, integrated with Birdeye for live data, deployed on Vercel.

This isn't a hackathon prototype. It's a tool you can use right now."
```
