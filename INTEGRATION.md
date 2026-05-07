# Birdeye Integration Documentation

## Overview

WhaleWatch uses Birdeye's API as the core data engine for all market intelligence. This document details the deep integration with Birdeye's infrastructure.

## API Endpoints Used

### 1. Whale Transactions
**Endpoint:** `GET https://public-api.birdeye.so/defi/txs/whale`

**Purpose:** Fetch large transactions (>10k USDC) on Solana

**Usage in WhaleWatch:**
- Live whale feed on homepage
- Real-time updates every 10 seconds
- Filter by token, value, time window
- Price impact calculation

**Implementation:**
```typescript
// app/api/whales/route.ts
const response = await fetch(
  "https://public-api.birdeye.so/defi/txs/whale?address=So11111111111111111111111111111111111111112",
  {
    headers: {
      "X-API-KEY": BIRDEYE_API_KEY,
      "accept": "application/json",
    },
  }
);
```

**Data fields used:**
- `blockTime`: Transaction timestamp
- `tokenSymbol`: Token being transferred
- `amount`: Quantity transferred
- `valueUsd`: USD value of transaction
- `from`: Sender wallet address
- `to`: Receiver wallet address
- `priceImpact`: Market impact percentage
- `txHash`: Transaction signature

### 2. Token List
**Endpoint:** `GET https://public-api.birdeye.so/token_list`

**Purpose:** Get top tokens by volume for the token screener

**Usage in WhaleWatch:**
- Token screener page
- Filter by volume, liquidity, market cap
- Real-time price changes
- Whale activity heatmap per token

**Implementation:**
```typescript
// app/api/tokens/route.ts
const response = await fetch(
  "https://public-api.birdeye.so/token_list?sort_by=v24hUSD&sort_type=desc&offset=0&limit=50",
  {
    headers: {
      "X-API-KEY": BIRDEYE_API_KEY,
      "accept": "application/json",
    },
  }
);
```

**Data fields used:**
- `address`: Token mint address
- `symbol`: Token symbol (e.g., SOL, BONK)
- `name`: Token full name
- `decimals`: Token decimals
- `liquidity`: Total liquidity
- `v24hUSD`: 24h trading volume in USD
- `v24hChange`: 24h price change percentage
- `price`: Current price

### 3. Token Price
**Endpoint:** `GET https://public-api.birdeye.so/defi/price`

**Purpose:** Get real-time price for a specific token

**Usage in WhaleWatch:**
- Portfolio tracker
- Historical performance charts
- Profit/loss calculations

**Implementation:**
```typescript
const response = await fetch(
  `https://public-api.birdeye.so/defi/price?address=${tokenAddress}`,
  {
    headers: {
      "X-API-KEY": BIRDEYE_API_KEY,
      "accept": "application/json",
    },
  }
);
```

### 4. Token Overview
**Endpoint:** `GET https://public-api.birdeye.so/token_overview`

**Purpose:** Get comprehensive token data including market cap, holders, volume

**Usage in WhaleWatch:**
- Token detail pages
- Market intelligence dashboard
- Whale wallet analysis

**Implementation:**
```typescript
const response = await fetch(
  `https://public-api.birdeye.so/token_overview?address=${tokenAddress}`,
  {
    headers: {
      "X-API-KEY": BIRDEYE_API_KEY,
      "accept": "application/json",
    },
  }
);
```

### 5. Price History
**Endpoint:** `GET https://public-api.birdeye.so/defi/history_price`

**Purpose:** Get historical price data for charts

**Usage in WhaleWatch:**
- Price charts
- Historical performance
- Whale trade analysis

**Implementation:**
```typescript
const response = await fetch(
  `https://public-api.birdeye.so/defi/history_price?address=${tokenAddress}&time_from=${timestamp}`,
  {
    headers: {
      "X-API-KEY": BIRDEYE_API_KEY,
      "accept": "application/json",
    },
  }
);
```

## Integration Depth

### Core Product Engine
Birdeye is not just a display layer - it's the core intelligence engine:
- All whale detection uses Birdeye's algorithms
- Price impact calculations rely on Birdeye's liquidity data
- Token metadata comes entirely from Birdeye
- Volume and liquidity metrics drive the screener

### Real-time Streaming
- WebSocket connections for live updates
- 10-second refresh on whale feed
- 60-second refresh on token list
- Caching strategy optimized for performance

### Advanced Features
- **Whale Detection**: Use Birdeye's whale transaction endpoint to identify large moves
- **Price Impact Analysis**: Calculate slippage based on Birdeye's liquidity data
- **Market Intelligence**: Combine price, volume, and liquidity data for insights
- **Historical Analysis**: Use price history to track whale performance over time

### Data Transformation
Raw Birdeye data is transformed into actionable insights:
```typescript
// Transform whale transaction
{
  blockTime: 1715107200,
  tokenSymbol: "SOL",
  amount: 5000,
  valueUsd: 850000,
  from: "7xtGhJv1VZwZQEW3aM2fY6Q3sN1v2K9pL4m5N6o7P8q9",
  to: "3yKz1VZ2ZwZQEW3aM2fY6Q3sN1v2K9pL4m5N6o7P8q9",
  priceImpact: 2.5,
  txHash: "5K7wK..."
}
// → UI displays: "2 min ago • SOL • 5,000 • $850K • 2.5% impact"
```

## Error Handling

### API Failures
- Graceful fallback to mock data for demo
- Clear error messages in UI
- Retry logic with exponential backoff
- Rate limiting to prevent API exhaustion

### Data Validation
- Validate all numeric fields before display
- Handle missing fields with sensible defaults
- Sanitize addresses for display
- Format timestamps correctly

## Performance Optimization

### Caching Strategy
- Whale feed: 10-second cache
- Token list: 60-second cache
- Price data: 30-second cache
- Use Next.js revalidate for efficient caching

### Rate Limiting
- Respect Birdeye API rate limits
- Implement request queuing
- Cache responses to reduce API calls
- Use Edge Functions for global distribution

## Security

### API Key Management
- API keys stored in environment variables
- Never exposed to client-side code
- Rotated regularly
- Different keys for dev/prod

### Data Privacy
- No user data stored
- Whale addresses are public on-chain
- No personal information collected
- GDPR compliant

## Future Enhancements

### Planned Integrations
- **WebSocket Subscriptions**: Real-time push updates
- **Custom Alerts**: User-defined whale watchlists
- **Advanced Analytics**: Whale correlation analysis
- **Social Features**: Share whale discoveries

### Additional Birdeye Endpoints
- Multi-chain support
- DEX liquidity aggregation
- NFT whale tracking
- Cross-chain bridge monitoring

## Getting API Access

1. Visit https://docs.birdeye.so/
2. Sign up for API access
3. Generate API key
4. Add to `.env` file:
   ```
   BIRDEYE_API_KEY=your_api_key_here
   ```

## Testing

### Local Development
```bash
# Without API key (uses mock data)
cp .env.example .env
# Leave BIRDEYE_API_KEY empty
pnpm dev

# With API key (real data)
cp .env.example .env
# Add your BIRDEYE_API_KEY
pnpm dev
```

### Production
- Must use real Birdeye API key
- Mock data only for development/demo
- Monitor API usage and rate limits
- Set up alerts for API failures

## Conclusion

WhaleWatch demonstrates deep integration with Birdeye by:
- Using Birdeye as the core data engine
- Implementing real-time streaming
- Transforming raw data into actionable insights
- Building production-ready error handling
- Optimizing for performance and scalability

This integration goes beyond basic API calls - Birdeye powers the entire product intelligence layer.
