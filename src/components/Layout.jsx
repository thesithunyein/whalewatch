import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Activity, Wallet, Search, Bell, BarChart3, Settings,
  Menu, X, Waves, TrendingUp, ExternalLink, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { path: '/', icon: Activity, label: 'Live Feed', badge: 'LIVE' },
  { path: '/wallets', icon: Wallet, label: 'Smart Money' },
  { path: '/screener', icon: Search, label: 'Token Screener' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/heatmap', icon: BarChart3, label: 'Heatmap' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-whale-green opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-whale-green" />
    </span>
  )
}

export default function Layout({ children, stats }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-whale-bg text-whale-text font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-40 w-60 bg-whale-surface border-r border-whale-border flex flex-col transition-transform duration-300',
        'lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-whale-border">
          <div className="w-8 h-8 bg-gradient-to-br from-whale-accent to-whale-purple rounded-lg flex items-center justify-center flex-shrink-0">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-whale-text tracking-wide">WhaleWatch</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <LiveDot />
              <span className="text-xs text-whale-green font-medium">Live</span>
            </div>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-whale-text-muted" />
          </button>
        </div>

        {/* Stats strip */}
        <div className="px-4 py-3 border-b border-whale-border grid grid-cols-2 gap-2">
          <div className="bg-whale-card rounded-md px-2 py-1.5">
            <p className="text-[10px] text-whale-text-muted uppercase tracking-wider">24h Vol</p>
            <p className="text-xs font-bold text-whale-text font-mono">{stats?.volume || '$—'}</p>
          </div>
          <div className="bg-whale-card rounded-md px-2 py-1.5">
            <p className="text-[10px] text-whale-text-muted uppercase tracking-wider">Whales</p>
            <p className="text-xs font-bold text-whale-green font-mono">{stats?.whales || '—'}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ path, icon: Icon, label, badge }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-whale-accent/15 text-whale-accent border border-whale-accent/30'
                  : 'text-whale-text-dim hover:bg-whale-muted hover:text-whale-text'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge === 'LIVE' && (
                <span className="text-[9px] font-bold bg-whale-green text-white px-1.5 py-0.5 rounded-full tracking-wider">
                  LIVE
                </span>
              )}
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-whale-border">
          <p className="text-[10px] text-whale-text-muted text-center">
            Powered by{' '}
            <a href="https://birdeye.so" target="_blank" rel="noopener noreferrer" className="text-whale-accent hover:underline">Birdeye</a>
            {' · '}
            <a href="https://quicknode.com" target="_blank" rel="noopener noreferrer" className="text-whale-cyan hover:underline">QuickNode</a>
          </p>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-14 flex items-center gap-4 px-4 border-b border-whale-border bg-whale-surface flex-shrink-0">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-whale-text-dim" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TrendingUp className="w-4 h-4 text-whale-accent flex-shrink-0" />
            <span className="text-sm text-whale-text-dim hidden sm:block">Solana Whale Intelligence Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 text-xs text-whale-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-whale-green animate-pulse-slow" />
                {stats?.txCount || 0} whale txs today
              </span>
              <span className="text-whale-border">|</span>
              <span>{stats?.alerts || 0} alerts</span>
            </div>
            <a
              href="https://birdeye.so"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-whale-accent border border-whale-border px-2.5 py-1 rounded-md hover:bg-whale-accent/10 transition-colors"
            >
              Birdeye <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
