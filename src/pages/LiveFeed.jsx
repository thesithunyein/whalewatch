import { useState, useEffect, useRef, useMemo } from 'react'
import { ExternalLink, Filter, ArrowUpRight, ArrowDownLeft, Zap, TrendingUp, TrendingDown, Activity, Radio, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { useWhaleTransactions } from '../hooks/useWhaleTransactions.js'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { formatUSD, formatNumber, formatAddress, formatAge } from '../utils/formatters.js'
import { SOLSCAN_TX } from '../config.js'
import { Badge } from '../components/ui/Badge.jsx'
import { StatCard } from '../components/ui/StatCard.jsx'

const FILTERS = ['All', 'Buy', 'Sell', '$10K+', '$100K+', '$500K+']

function TxRow({ tx, isNew, onWatchWallet }) {
  const { addToWatchlist, isWatched, settings } = useApp()
  const toast = useToast()
  const thresholdMet = tx.usdValue >= (settings?.whaleThreshold || 10000)
  const bigTx = tx.usdValue >= 100000

  const handleWatch = (e) => {
    e.stopPropagation()
    if (!isWatched(tx.from)) {
      addToWatchlist({ address: tx.from, label: `Whale ${formatAddress(tx.from)}`, tag: 'Auto', addedAt: Date.now() })
      toast(`Watching ${formatAddress(tx.from)}`, { type: 'success', title: 'Wallet Added' })
    }
  }

  return (
    <tr className={clsx(
      'border-b border-whale-border/50 transition-all duration-500 hover:bg-whale-muted/30 cursor-default group',
      isNew && 'animate-fade-in',
      bigTx && 'bg-whale-accent/3'
    )}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={clsx(
            'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
            tx.side === 'buy' ? 'bg-whale-green-dim' : 'bg-whale-red-dim'
          )}>
            {tx.side === 'buy'
              ? <ArrowUpRight className="w-3.5 h-3.5 text-whale-green" />
              : <ArrowDownLeft className="w-3.5 h-3.5 text-whale-red" />
            }
          </span>
          <div>
            <p className={clsx('text-xs font-bold', tx.side === 'buy' ? 'text-whale-green' : 'text-whale-red')}>
              {tx.side.toUpperCase()}
            </p>
            <p className="text-[10px] text-whale-text-muted font-mono">{formatAge(tx.timestamp)}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-whale-muted flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] font-bold text-whale-text">{tx.tokenSymbol?.[0]}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-whale-text">{tx.tokenSymbol}</p>
            <p className="text-[10px] text-whale-text-muted font-mono">{formatAddress(tx.tokenAddress, 3)}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-whale-text font-mono">{formatUSD(tx.usdValue, true)}</p>
        <p className="text-[10px] text-whale-text-muted">{formatNumber(tx.amount, 0)} tokens</p>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <p className="text-sm text-whale-text font-mono">{formatUSD(tx.price)}</p>
        {tx.priceImpact !== undefined && (
          <p className={clsx('text-[10px]', tx.priceImpact >= 0 ? 'text-whale-green' : 'text-whale-red')}>
            {tx.priceImpact >= 0 ? '+' : ''}{tx.priceImpact.toFixed(2)}% impact
          </p>
        )}
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <button
          onClick={handleWatch}
          className="group/btn flex items-center gap-1.5 hover:bg-whale-muted px-2 py-1 rounded-md transition-colors"
        >
          <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', isWatched(tx.from) ? 'bg-whale-green' : 'bg-whale-text-muted')} />
          <span className="text-xs font-mono text-whale-text-dim">{formatAddress(tx.from)}</span>
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {bigTx && <Badge variant="whale">MEGA</Badge>}
          {tx.isDemo && <Badge variant="neutral">DEMO</Badge>}
          <a
            href={SOLSCAN_TX(tx.signature)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-whale-text-muted hover:text-whale-accent transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </td>
    </tr>
  )
}

export default function LiveFeed() {
  const { settings, hasApiKey } = useApp()
  const [filter, setFilter] = useState('All')
  const [autoScroll, setAutoScroll] = useState(true)
  const [newIds, setNewIds] = useState(new Set())
  const prevCountRef = useRef(0)
  const { transactions, volume24h, activeWhales, isLive, isDemo, fetchError } = useWhaleTransactions(hasApiKey)

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter === 'Buy') return tx.side === 'buy'
      if (filter === 'Sell') return tx.side === 'sell'
      if (filter === '$10K+') return tx.usdValue >= 10000
      if (filter === '$100K+') return tx.usdValue >= 100000
      if (filter === '$500K+') return tx.usdValue >= 500000
      return true
    })
  }, [transactions, filter])

  const buyCount = transactions.filter((t) => t.side === 'buy').length
  const sellCount = transactions.filter((t) => t.side === 'sell').length
  const buyRatio = transactions.length ? (buyCount / transactions.length) * 100 : 50

  useEffect(() => {
    if (transactions.length > prevCountRef.current) {
      const newSet = new Set(transactions.slice(0, transactions.length - prevCountRef.current).map((t) => t.id))
      setNewIds(newSet)
      setTimeout(() => setNewIds(new Set()), 2000)
    }
    prevCountRef.current = transactions.length
  }, [transactions.length])

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-whale-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-whale-green" />
            Live Whale Feed
          </h1>
          <p className="text-sm text-whale-text-muted mt-0.5">
            Real-time transactions above ${(settings?.whaleThreshold || 10000).toLocaleString()} USD threshold
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Live / Demo badge */}
          {isLive ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-whale-green-dim border border-whale-green/30 text-whale-green text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-whale-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-whale-green" />
              </span>
              LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-whale-muted border border-whale-border text-whale-text-muted text-xs font-semibold">
              <Radio className="w-3 h-3" />
              DEMO
            </span>
          )}
          <button
            onClick={() => setAutoScroll((v) => !v)}
            className={clsx(
              'text-xs px-3 py-1.5 rounded-lg border transition-colors',
              autoScroll
                ? 'bg-whale-green-dim border-whale-green/30 text-whale-green'
                : 'border-whale-border text-whale-text-muted hover:bg-whale-muted'
            )}
          >
            Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* API error banner */}
      {fetchError && (
        <div className="flex items-start gap-3 bg-whale-red-dim border border-whale-red/30 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-whale-red flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-whale-red">Birdeye API error</p>
            <p className="text-xs text-whale-text-muted mt-0.5">{fetchError} — check your API key in Settings or verify it has sufficient credits.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label={isLive ? 'Live Transactions' : 'Simulated Txs'}
          value={transactions.length}
          subValue="in feed"
          icon={Zap}
          accent
        />
        <StatCard
          label="Feed Volume"
          value={formatUSD(volume24h, true)}
          subValue="current session"
          icon={TrendingUp}
        />
        <StatCard
          label="Active Wallets"
          value={activeWhales}
          subValue="unique addresses"
          icon={Activity}
        />
        <StatCard
          label="Buy Pressure"
          value={`${buyRatio.toFixed(0)}%`}
          subValue={`${buyCount} buys / ${sellCount} sells`}
          icon={buyRatio >= 50 ? TrendingUp : TrendingDown}
        />
      </div>

      {/* Buy/Sell pressure bar */}
      <div className="bg-whale-card border border-whale-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-whale-text-dim">Buy/Sell Pressure</span>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-whale-green">Buys {buyCount}</span>
            <span className="text-whale-red">Sells {sellCount}</span>
          </div>
        </div>
        <div className="h-2.5 bg-whale-red-dim rounded-full overflow-hidden">
          <div
            className="h-full bg-whale-green rounded-full transition-all duration-700"
            style={{ width: `${buyRatio}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-whale-text-muted" />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-150',
              filter === f
                ? 'bg-whale-accent text-white border-whale-accent'
                : 'border-whale-border text-whale-text-dim hover:border-whale-accent/50 hover:text-whale-text'
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-whale-text-muted">{filtered.length} transactions</span>
      </div>

      {/* Table */}
      <div className="bg-whale-card border border-whale-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-whale-border bg-whale-surface">
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider hidden md:table-cell">Price</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider hidden lg:table-cell">Wallet</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Info</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <TxRow
                  key={tx.id}
                  tx={tx}
                  isNew={newIds.has(tx.id)}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-whale-text-muted text-sm">
                    No whale transactions match the current filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-whale-text-muted text-center pb-4">
        {isLive
          ? 'Live data from Birdeye — top Solana tokens by all-time volume, whale transactions ≥ $10K. Refreshes every 15s.'
          : 'Demo mode — add a Birdeye API key in Settings to switch to live on-chain data.'}
      </p>
    </div>
  )
}
