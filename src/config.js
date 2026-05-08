const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.eitherway.ai'

export const QN_SOLANA_RPC = `${API_BASE_URL}/api/quicknode/rpc/solana`

export const BIRDEYE_API = (path) => `/api/birdeye${path}`

export const SOLSCAN_TX = (sig) => `https://solscan.io/tx/${sig}`
export const SOLSCAN_ACCOUNT = (addr) => `https://solscan.io/account/${addr}`
export const SOLSCAN_TOKEN = (addr) => `https://solscan.io/token/${addr}`

export const WHALE_THRESHOLD_USD = 10_000
export const SOL_MINT = 'So11111111111111111111111111111111111111112'

export const KNOWN_WHALE_WALLETS = [
  { address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', label: 'Whale Alpha', tag: 'DeFi MM' },
  { address: 'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh', label: 'Whale Beta', tag: 'NFT Trader' },
  { address: 'CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq', label: 'Smart Money 1', tag: 'Yield Farm' },
  { address: 'GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp', label: 'Smart Money 2', tag: 'Arbitrage' },
  { address: '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT', label: 'Whale Gamma', tag: 'Whale' },
  { address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH', label: 'Smart Money 3', tag: 'OG Degen' },
  { address: 'rFqFJ9g7TGBD8Ed7TPDnvGKZ5pWLGxPFgPyoSn5oEDz', label: 'Whale Delta', tag: 'Token Sniper' },
  { address: 'MfDuWeqSHEqTFVYZ7LoexgUubpSMoR7LuMHHoKiBwMH', label: 'Smart Money 4', tag: 'Memecoin' },
  { address: 'CVE8rFBHfTX6YLj47jnEbDHGa7pNSd2u7tTPNfbzaHBb', label: 'Whale Epsilon', tag: 'Solana OG' },
  { address: 'Fabb6oj3n81sWCXQEBnCVDFuMwCGKRdvdKgmSjNgFrXy', label: 'Smart Money 5', tag: 'LP Provider' },
]
