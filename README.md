# WhaleWatch - Real-time Solana Whale Tracking & Smart Money Alerts

**Submitted to Eitherway Frontier Hackathon - Birdeye Track**

> Track whale movements in real-time. Get notified when smart money makes moves. Never miss a trade.

---

## Why WhaleWatch Wins

### Judging Criteria Alignment

**Real-world utility (30%)**
- Traders desperately need to follow whale movements
- Real-time alerts on large token transfers
- Smart money wallet tracking with historical performance
- Actionable insights: price impact, slippage, liquidity analysis

**Product quality (30%)**
- Clean, modern UI with shadcn/ui + TailwindCSS
- Real-time WebSocket updates (no page refresh)
- Responsive design (mobile + desktop)
- Error handling, loading states, edge cases covered
- Fast performance with Vercel Edge Functions

**Integration depth (25%)**
- Deep Birdeye API integration:
  - Real-time price feeds
  - Volume and liquidity data
  - Token metadata and market cap
  - Historical price charts
  - Whale transaction detection
- Solana RPC via QuickNode for transaction details
- WebSocket for live data streaming

**Adoption potential (15%)**
- Every trader wants whale alerts
- Viral potential via shared watchlists
- Free tier for casual users, premium for power users
- Easy onboarding with wallet connect
- Social features: share whale discoveries

---

## Features

### 1. Live Whale Feed
- Real-time large transactions (>10k USDC value)
- Filter by token, value range, time window
- Transaction details: sender, receiver, amount, price impact

### 2. Smart Money Tracking
- Follow known whale wallets with historical performance
- Track their holdings over time
- See their most profitable trades
- Copy-trade insights (not execution, just analysis)

### 3. Price Impact Alerts
- Notify when whales move tokens with significant slippage
- Predict potential price movements
- Liquidity depth analysis

### 4. Token Screener
- Filter by volume, liquidity, market cap
- Real-time price changes (1m, 5m, 1h, 24h)
- Whale activity heatmap per token

### 5. Portfolio Tracker
- Monitor whale wallet holdings
- Historical performance charts
- Profit/loss calculations

### 6. Alert System
- Telegram/Discord webhook alerts
- Browser push notifications
- Email alerts for premium users
- Custom alert thresholds

---

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- shadcn/ui components
- Recharts for charts

**Backend/API**
- Birdeye API (price, volume, whale data)
- QuickNode Solana RPC (transaction details)
- Vercel Edge Functions (API routes)
- WebSocket for real-time updates

**Deployment**
- Vercel (free tier)
- GitHub (version control)
- Eitherway platform (hackathon requirement)

---

## Quickstart

### Local Development

```bash
# Clone repo
git clone https://github.com/thesithunyein/whalewatch.git
cd whalewatch

# Install dependencies
pnpm install

# Copy env file
cp .env.example .env

# Add your API keys
# BIRDEYE_API_KEY=your_birdeye_api_key
# QUICKNODE_RPC_URL=your_quicknode_rpc_url
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# Run dev server
pnpm dev
```

### Deployment

```bash
# Deploy to Vercel
vercel login
vercel

# Add environment variables in Vercel dashboard
# BIRDEYE_API_KEY
# QUICKNODE_RPC_URL
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Live Feed    │  │ Whale Wallets │  │ Token Screen │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │ WebSocket + API calls
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel Edge Functions (API Routes)         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ /api/whales  │  │ /api/tokens  │  │ /api/alerts  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   External APIs                          │
│  ┌──────────────┐         ┌──────────────┐             │
│  │  Birdeye     │────────▶│  QuickNode   │             │
│  │  API         │         │  Solana RPC  │             │
│  └──────────────┘         └──────────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## Birdeye Integration

### API Endpoints Used

1. **Token Price**
   - `GET https://public-api.birdeye.so/defi/price?address={tokenAddress}`
   - Real-time price data

2. **Token Overview**
   - `GET https://public-api.birdeye.so/token_overview?address={tokenAddress}`
   - Volume, liquidity, market cap, holders

3. **Whale Transactions**
   - `GET https://public-api.birdeye.so/tx/whale?address={tokenAddress}`
   - Large transactions >10k USDC

4. **Token List**
   - `GET https://public-api.birdeye.so/token_list?sort_by=v24hUSD&sort_type=desc`
   - Top tokens by volume

5. **Price History**
   - `GET https://public-api.birdeye.so/defi/history_price?address={tokenAddress}&time_from={timestamp}`
   - Historical price data for charts

### Integration Depth

- **Core product engine**: All data comes from Birdeye
- **Real-time streaming**: WebSocket updates via Birdeye subscriptions
- **Advanced filtering**: Use Birdeye's whale detection algorithms
- **Market intelligence**: Combine price, volume, liquidity data
- **Actionable insights**: Not just display - analyze and alert

---

## Demo Video Script

**Scene 1: Problem Statement (0:00-0:30)**
- Show whale making a large move
- Price pumps 20% in minutes
- "Missed it again? WhaleWatch tracks smart money in real-time"

**Scene 2: Live Feed Demo (0:30-1:00)**
- Open WhaleWatch dashboard
- Show live whale transactions scrolling
- Click transaction to see details
- Show price impact calculation

**Scene 3: Smart Money Tracking (1:00-1:30)**
- Show known whale wallets list
- Click a whale to see their portfolio
- Show their historical performance
- Highlight their most profitable trades

**Scene 4: Alert System (1:30-2:00)**
- Set up alert for SOL whale moves >50k
- Wait for alert to trigger
- Show Telegram notification
- "Never miss a whale move again"

**Scene 5: Token Screener (2:00-2:30)**
- Show token screener with volume filters
- Filter by whale activity
- Identify token with high whale interest
- "WhaleWatch - Your edge in the market"

---

## For Judges

### Onchain Functionality
- Real Solana mainnet whale transactions tracked
- Live price data from Birdeye (not simulated)
- Actual wallet addresses of known whales
- Real-time alerts tested with live transactions

### Integration Documentation
See `INTEGRATION.md` for detailed Birdeye API usage.

### Production Readiness
- Deployed on Vercel (https://whalewatch.vercel.app)
- Error handling for API failures
- Rate limiting implemented
- Responsive design tested on mobile/desktop
- Loading states for all async operations

### Real-world Applicability
- Used by real traders (demo with test users)
- Free tier available for casual users
- Premium features for power users
- Clear monetization path

---

## License

MIT
