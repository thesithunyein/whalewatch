import { useState, useEffect } from 'react'
import { Wallet, Plus, Trash2, ExternalLink, Search, Tag, Star, Copy, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { KNOWN_WHALE_WALLETS, SOLSCAN_ACCOUNT } from '../config.js'
import { formatAddress, formatUSD, formatNumber } from '../utils/formatters.js'
import { Badge } from '../components/ui/Badge.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Skeleton } from '../components/ui/Skeleton.jsx'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function fetchWalletPortfolio(address) {
  const url = new URL(`${SUPABASE_URL}/functions/v1/birdeye-proxy`)
  url.searchParams.set('path', '/v1/wallet/token_list')
  url.searchParams.set('wallet', address)
  const res = await fetch(url.toString(), { headers: { 'apikey': SUPABASE_ANON_KEY } })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  return json?.data
}

const TAG_COLORS = {
  'DeFi MM': 'text-whale-cyan',
  'NFT Trader': 'text-whale-purple',
  'Yield Farm': 'text-whale-green',
  'Arbitrage': 'text-whale-yellow',
  'Whale': 'text-whale-accent',
  'OG Degen': 'text-whale-red',
  'Token Sniper': 'text-whale-orange',
  'Memecoin': 'text-pink-400',
  'Solana OG': 'text-whale-accent',
  'LP Provider': 'text-whale-green',
  'Auto': 'text-whale-text-muted',
}

function WalletCard({ wallet, onRemove, isKnown }) {
  const toast = useToast()

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    toast('Address copied to clipboard', { type: 'success' })
  }

  return (
    <div className="bg-whale-card border border-whale-border rounded-xl p-4 hover:border-whale-accent/40 transition-all duration-150 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-whale-accent/30 to-whale-purple/30 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-whale-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-whale-text truncate">{wallet.label}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-mono text-whale-text-muted">{formatAddress(wallet.address, 6)}</span>
              <button onClick={copyAddress} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="w-3 h-3 text-whale-text-muted hover:text-whale-accent" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {wallet.tag && (
            <span className={clsx('text-[10px] font-semibold', TAG_COLORS[wallet.tag] || 'text-whale-text-muted')}>
              {wallet.tag}
            </span>
          )}
          {isKnown && <Star className="w-3.5 h-3.5 text-whale-yellow fill-whale-yellow" />}
          {onRemove && (
            <button
              onClick={() => onRemove(wallet.address)}
              className="text-whale-text-muted hover:text-whale-red transition-colors ml-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {/* Action row */}
      <div className="flex items-center gap-2 pt-3 border-t border-whale-border/50">
        <a
          href={SOLSCAN_ACCOUNT(wallet.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-whale-accent hover:bg-whale-accent/10 border border-whale-accent/30 hover:border-whale-accent/60 rounded-lg px-3 py-2 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Portfolio on Solscan
        </a>
      </div>
      {!isKnown && wallet.addedAt && (
        <p className="text-[10px] text-whale-text-muted mt-2 text-center">
          Added {new Date(wallet.addedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}

function AddWalletModal({ onClose, onAdd }) {
  const [address, setAddress] = useState('')
  const [label, setLabel] = useState('')
  const [tag, setTag] = useState('')
  const toast = useToast()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!address.trim() || address.length < 32) {
      toast('Please enter a valid Solana address', { type: 'error' })
      return
    }
    onAdd({ address: address.trim(), label: label.trim() || `Wallet ${formatAddress(address.trim())}`, tag: tag.trim(), addedAt: Date.now() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-whale-surface border border-whale-border rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-base font-bold text-whale-text mb-4">Add Wallet to Watchlist</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-whale-text-muted mb-1.5">Wallet Address *</label>
            <input
              className="w-full bg-whale-card border border-whale-border rounded-lg px-3 py-2 text-sm font-mono text-whale-text placeholder-whale-text-muted focus:outline-none focus:border-whale-accent"
              placeholder="Enter Solana address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-whale-text-muted mb-1.5">Label (optional)</label>
            <input
              className="w-full bg-whale-card border border-whale-border rounded-lg px-3 py-2 text-sm text-whale-text placeholder-whale-text-muted focus:outline-none focus:border-whale-accent"
              placeholder="e.g. Smart Money Alpha"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-whale-text-muted mb-1.5">Tag (optional)</label>
            <input
              className="w-full bg-whale-card border border-whale-border rounded-lg px-3 py-2 text-sm text-whale-text placeholder-whale-text-muted focus:outline-none focus:border-whale-accent"
              placeholder="e.g. DeFi, NFT Trader, Whale"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-whale-border text-whale-text-dim text-sm hover:bg-whale-muted transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-whale-accent text-white text-sm font-medium hover:bg-whale-accent/90 transition-colors">
              Add Wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SmartMoney() {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useApp()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('known')

  const filteredKnown = KNOWN_WHALE_WALLETS.filter((w) =>
    w.label.toLowerCase().includes(search.toLowerCase()) ||
    w.address.toLowerCase().includes(search.toLowerCase())
  )

  const filteredWatchlist = watchlist.filter((w) =>
    w.label?.toLowerCase().includes(search.toLowerCase()) ||
    w.address?.toLowerCase().includes(search.toLowerCase())
  )

  const handleRemove = (address) => {
    removeFromWatchlist(address)
    toast('Wallet removed from watchlist', { type: 'info' })
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-whale-text flex items-center gap-2">
            <Wallet className="w-5 h-5 text-whale-accent" />
            Smart Money Wallets
          </h1>
          <p className="text-sm text-whale-text-muted mt-0.5">
            Track known whale wallets and build your own watchlist
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-whale-accent hover:bg-whale-accent/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Wallet
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-whale-text-muted" />
        <input
          className="w-full bg-whale-card border border-whale-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-whale-text placeholder-whale-text-muted focus:outline-none focus:border-whale-accent transition-colors"
          placeholder="Search wallets by label or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-whale-card border border-whale-border rounded-xl p-1 w-fit">
        {[{ id: 'known', label: `Known Whales (${KNOWN_WHALE_WALLETS.length})` }, { id: 'watchlist', label: `My Watchlist (${watchlist.length})` }].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              activeTab === tab.id
                ? 'bg-whale-accent text-white'
                : 'text-whale-text-dim hover:text-whale-text'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Wallet grid */}
      {activeTab === 'known' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredKnown.map((w) => (
            <WalletCard key={w.address} wallet={w} isKnown={true} />
          ))}
        </div>
      )}

      {activeTab === 'watchlist' && (
        filteredWatchlist.length === 0
          ? <EmptyState
              icon={Wallet}
              title="No wallets in watchlist"
              description="Add wallets to track their activity, portfolio, and trades in real-time."
              action={
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-whale-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-whale-accent/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Wallet</span>
                </button>
              }
            />
          : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredWatchlist.map((w) => (
                <WalletCard key={w.address} wallet={w} isKnown={false} onRemove={handleRemove} />
              ))}
            </div>
      )}

      {showModal && (
        <AddWalletModal
          onClose={() => setShowModal(false)}
          onAdd={addToWatchlist}
        />
      )}
    </div>
  )
}
