import { useState } from 'react'
import { Bell, BellOff, Plus, Trash2, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { formatUSD, formatAge } from '../utils/formatters.js'
import { Badge } from '../components/ui/Badge.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'

const ALERT_TYPES = [
  { id: 'whale_buy', label: 'Whale Buy', description: 'Alert when whale buys a token' },
  { id: 'whale_sell', label: 'Whale Sell', description: 'Alert when whale sells a token' },
  { id: 'price_spike', label: 'Price Spike', description: 'Alert on sudden price movement' },
  { id: 'volume_spike', label: 'Volume Spike', description: 'Alert on unusual volume surge' },
  { id: 'wallet_active', label: 'Wallet Active', description: 'Alert when watched wallet transacts' },
]

const MOCK_ALERT_HISTORY = [
  { id: 1, type: 'whale_buy', token: 'SOL', value: 850000, timestamp: Math.floor(Date.now() / 1000) - 180, triggered: true },
  { id: 2, type: 'whale_sell', token: 'BONK', value: 210000, timestamp: Math.floor(Date.now() / 1000) - 540, triggered: true },
  { id: 3, type: 'volume_spike', token: 'WIF', value: 0, timestamp: Math.floor(Date.now() / 1000) - 900, triggered: true },
  { id: 4, type: 'whale_buy', token: 'JUP', value: 75000, timestamp: Math.floor(Date.now() / 1000) - 1800, triggered: true },
  { id: 5, type: 'price_spike', token: 'POPCAT', value: 0, timestamp: Math.floor(Date.now() / 1000) - 3600, triggered: true },
]

function AlertRow({ alert, onRemove, onToggle }) {
  const typeInfo = ALERT_TYPES.find((t) => t.id === alert.type)
  return (
    <div className={clsx(
      'flex items-center gap-4 bg-whale-card border rounded-xl p-4 transition-all',
      alert.enabled ? 'border-whale-border' : 'border-whale-border/40 opacity-60'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-whale-text">{typeInfo?.label || alert.type}</span>
          {alert.token && <Badge variant="info">{alert.token}</Badge>}
          {alert.minValue && (
            <span className="text-xs text-whale-text-muted">&gt; {formatUSD(alert.minValue, true)}</span>
          )}
        </div>
        <p className="text-xs text-whale-text-muted">{typeInfo?.description}</p>
        {alert.createdAt && (
          <p className="text-[10px] text-whale-text-muted mt-1">Created {new Date(alert.createdAt).toLocaleDateString()}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onToggle(alert.id)}
          className={clsx(
            'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors',
            alert.enabled
              ? 'border-whale-green/30 text-whale-green bg-whale-green-dim'
              : 'border-whale-border text-whale-text-muted hover:bg-whale-muted'
          )}
        >
          {alert.enabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          {alert.enabled ? 'ON' : 'OFF'}
        </button>
        <button onClick={() => onRemove(alert.id)} className="text-whale-text-muted hover:text-whale-red transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function AddAlertModal({ onClose, onAdd }) {
  const [type, setType] = useState('whale_buy')
  const [token, setToken] = useState('')
  const [minValue, setMinValue] = useState('')
  const toast = useToast()

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({ type, token: token.toUpperCase().trim(), minValue: minValue ? parseFloat(minValue) : null })
    toast('Alert created', { type: 'success', title: 'Alert Added' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-whale-surface border border-whale-border rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-base font-bold text-whale-text mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-whale-accent" />
          Create New Alert
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-whale-text-muted mb-1.5">Alert Type *</label>
            <div className="space-y-2">
              {ALERT_TYPES.map((at) => (
                <label key={at.id} className={clsx(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  type === at.id ? 'border-whale-accent bg-whale-accent/10' : 'border-whale-border hover:border-whale-border/80'
                )}>
                  <input type="radio" value={at.id} checked={type === at.id} onChange={() => setType(at.id)} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-whale-text">{at.label}</p>
                    <p className="text-xs text-whale-text-muted">{at.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-whale-text-muted mb-1.5">Token Symbol (optional)</label>
            <input
              className="w-full bg-whale-card border border-whale-border rounded-lg px-3 py-2 text-sm text-whale-text placeholder-whale-text-muted focus:outline-none focus:border-whale-accent"
              placeholder="e.g. SOL, BONK, WIF"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-whale-text-muted mb-1.5">Minimum USD Value (optional)</label>
            <input
              type="number"
              className="w-full bg-whale-card border border-whale-border rounded-lg px-3 py-2 text-sm text-whale-text placeholder-whale-text-muted focus:outline-none focus:border-whale-accent"
              placeholder="e.g. 50000"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              min="0"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-whale-border text-whale-text-dim text-sm hover:bg-whale-muted transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-whale-accent text-white text-sm font-medium hover:bg-whale-accent/90 transition-colors">
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Alerts() {
  const { alerts, addAlert, removeAlert, toggleAlert, alertHistory } = useApp()
  const toast = useToast()
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('alerts')

  const history = alertHistory.length > 0 ? alertHistory : MOCK_ALERT_HISTORY

  const handleRemove = (id) => {
    removeAlert(id)
    toast('Alert deleted', { type: 'info' })
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-whale-text flex items-center gap-2">
            <Bell className="w-5 h-5 text-whale-accent" />
            Alerts
          </h1>
          <p className="text-sm text-whale-text-muted mt-0.5">
            {alerts.length} active alert{alerts.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-whale-accent hover:bg-whale-accent/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Alert
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-whale-card border border-whale-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono text-whale-accent">{alerts.length}</p>
          <p className="text-xs text-whale-text-muted mt-1">Total Alerts</p>
        </div>
        <div className="bg-whale-card border border-whale-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono text-whale-green">{alerts.filter((a) => a.enabled).length}</p>
          <p className="text-xs text-whale-text-muted mt-1">Active</p>
        </div>
        <div className="bg-whale-card border border-whale-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono text-whale-text">{history.length}</p>
          <p className="text-xs text-whale-text-muted mt-1">Triggered</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-whale-card border border-whale-border rounded-xl p-1 w-fit">
        {[{ id: 'alerts', label: 'My Alerts' }, { id: 'history', label: 'History' }].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id ? 'bg-whale-accent text-white' : 'text-whale-text-dim hover:text-whale-text'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'alerts' && (
        alerts.length === 0
          ? <EmptyState
              icon={Bell}
              title="No alerts configured"
              description="Create alerts to get notified of whale activity, price spikes, and more."
              action={
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-whale-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-whale-accent/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Alert</span>
                </button>
              }
            />
          : <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} onRemove={handleRemove} onToggle={toggleAlert} />
              ))}
            </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-whale-card border border-whale-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-whale-border bg-whale-surface">
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-whale-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((event) => {
                const typeInfo = ALERT_TYPES.find((t) => t.id === event.type)
                return (
                  <tr key={event.id} className="border-b border-whale-border/50 hover:bg-whale-muted/30">
                    <td className="px-4 py-3 text-xs font-mono text-whale-text-muted">{formatAge(event.timestamp)}</td>
                    <td className="px-4 py-3 text-sm text-whale-text">{typeInfo?.label || event.type}</td>
                    <td className="px-4 py-3">
                      {event.token && <Badge variant="info">{event.token}</Badge>}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-whale-text">
                      {event.value ? formatUSD(event.value, true) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-whale-green">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Triggered
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddAlertModal
          onClose={() => setShowModal(false)}
          onAdd={addAlert}
        />
      )}
    </div>
  )
}
