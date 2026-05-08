import { useState } from 'react'
import { Settings, Key, Bell, Sliders, Save, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink, Shield, Loader } from 'lucide-react'
import clsx from 'clsx'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-whale-card border border-whale-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-whale-border bg-whale-surface">
        <Icon className="w-4 h-4 text-whale-accent" />
        <h2 className="text-sm font-semibold text-whale-text">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-whale-text">{label}</p>
        {description && <p className="text-xs text-whale-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0',
          checked ? 'bg-whale-accent' : 'bg-whale-muted'
        )}
      >
        <span className={clsx(
          'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )} />
      </button>
    </label>
  )
}

export default function SettingsPage() {
  const { hasApiKey, apiKeyLoading, saveApiKey, settings, setSettings } = useApp()
  const toast = useToast()
  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [threshold, setThreshold] = useState(settings.whaleThreshold || 10000)
  const [telegramWebhook, setTelegramWebhook] = useState(settings.telegramWebhook || '')

  const handleSaveKey = async () => {
    if (!keyInput.trim()) {
      toast('Enter an API key first', { type: 'error' })
      return
    }
    setSaving(true)
    try {
      const result = await saveApiKey(keyInput.trim())
      if (result?.success) {
        toast('API key validated and saved securely', { type: 'success', title: 'Saved' })
        setKeyInput('') // Never keep the key in the browser after save
      } else {
        toast(result?.error || 'Failed to save API key', { type: 'error', title: 'Error' })
      }
    } catch (e) {
      toast(e.message || 'Network error', { type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = () => {
    setSettings({
      ...settings,
      whaleThreshold: Number(threshold),
      telegramWebhook,
    })
    toast('Settings saved', { type: 'success', title: 'Saved' })
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-whale-text flex items-center gap-2">
          <Settings className="w-5 h-5 text-whale-accent" />
          Settings
        </h1>
        <p className="text-sm text-whale-text-muted mt-0.5">Configure your whale tracker preferences</p>
      </div>

      {/* API Key */}
      <Section title="Birdeye API Key" icon={Key}>
        <div className="space-y-4">
          {/* Security notice */}
          <div className="flex items-start gap-3 bg-whale-accent/5 border border-whale-accent/20 rounded-lg p-3">
            <Shield className="w-4 h-4 text-whale-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-whale-text-dim">
                Your API key is sent directly to a server-side Edge Function, validated against Birdeye,
                and stored encrypted in Supabase. It is <strong className="text-whale-text">never stored in your browser</strong>.
              </p>
              <a
                href="https://birdeye.so/api"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-whale-accent mt-2 hover:underline"
              >
                Get a free API key at birdeye.so <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Current key status */}
          <div className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border',
            apiKeyLoading
              ? 'border-whale-border text-whale-text-muted'
              : hasApiKey
                ? 'bg-whale-green/5 border-whale-green/30 text-whale-green'
                : 'bg-whale-muted border-whale-border text-whale-text-muted'
          )}>
            {apiKeyLoading ? (
              <Loader className="w-3.5 h-3.5 animate-spin" />
            ) : hasApiKey ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            {apiKeyLoading
              ? 'Checking key status…'
              : hasApiKey
                ? 'API key configured — live data active'
                : 'No API key set — dashboard running in demo mode'}
          </div>

          <div>
            <label className="block text-xs text-whale-text-muted mb-1.5">
              {hasApiKey ? 'Replace API Key' : 'API Key'}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="w-full bg-whale-bg border border-whale-border rounded-lg px-3 py-2 pr-10 text-sm font-mono text-whale-text placeholder-whale-text-muted focus:outline-none focus:border-whale-accent"
                placeholder={hasApiKey ? 'Enter new key to replace…' : 'Enter your Birdeye API key…'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                autoComplete="off"
                data-1p-ignore
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-whale-text-muted hover:text-whale-text"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-whale-text-muted mt-1">
              The key is validated against Birdeye then sent to a secure Edge Function. Your browser never retains it.
            </p>
          </div>
          <button
            onClick={handleSaveKey}
            disabled={saving || !keyInput.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-whale-accent text-white text-sm font-medium hover:bg-whale-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <><Loader className="w-3.5 h-3.5 animate-spin" /> Validating &amp; Saving…</>
            ) : (
              <><Save className="w-3.5 h-3.5" /> {hasApiKey ? 'Replace Key' : 'Save Key'}</>
            )}
          </button>
        </div>
      </Section>

      {/* Detection settings */}
      <Section title="Detection Settings" icon={Sliders}>
        <div className="space-y-5">
          <div>
            <label className="block text-xs text-whale-text-muted mb-1.5">
              Whale Threshold (USD)
              <span className="ml-2 text-whale-accent font-mono">${Number(threshold).toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="1000"
              max="500000"
              step="1000"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full accent-whale-accent"
            />
            <div className="flex justify-between text-[10px] text-whale-text-muted mt-1">
              <span>$1K</span>
              <span>$10K</span>
              <span>$50K</span>
              <span>$100K</span>
              <span>$500K</span>
            </div>
            <p className="text-xs text-whale-text-muted mt-2">
              Only transactions above this USD value will appear in the live feed
            </p>
          </div>
        </div>
      </Section>

      {/* Notification settings */}
      <Section title="Notifications" icon={Bell}>
        <div className="space-y-4">
          <Toggle
            checked={settings.notifyToast}
            onChange={(v) => setSettings({ ...settings, notifyToast: v })}
            label="In-App Notifications"
            description="Show toast notifications for triggered alerts"
          />
          <Toggle
            checked={settings.notifySound}
            onChange={(v) => setSettings({ ...settings, notifySound: v })}
            label="Sound Alerts"
            description="Play a sound when a whale transaction is detected"
          />
          <div className="pt-2 border-t border-whale-border">
            <label className="block text-xs text-whale-text-muted mb-1.5">Telegram Webhook URL (optional)</label>
            <input
              type="url"
              className="w-full bg-whale-bg border border-whale-border rounded-lg px-3 py-2 text-sm text-whale-text placeholder-whale-text-muted focus:outline-none focus:border-whale-accent"
              placeholder="https://api.telegram.org/bot<token>/sendMessage"
              value={telegramWebhook}
              onChange={(e) => setTelegramWebhook(e.target.value)}
            />
            <p className="text-xs text-whale-text-muted mt-1">
              Send whale alerts to a Telegram chat via bot
            </p>
          </div>
        </div>
      </Section>

      <button
        onClick={handleSaveSettings}
        className="w-full flex items-center justify-center gap-2 bg-whale-accent hover:bg-whale-accent/90 text-white py-3 rounded-xl text-sm font-medium transition-colors"
      >
        <Save className="w-4 h-4" />
        Save All Settings
      </button>

      {/* About */}
      <div className="bg-whale-card border border-whale-border rounded-xl p-5 space-y-2">
        <h3 className="text-sm font-semibold text-whale-text">About WhaleWatch</h3>
        <p className="text-xs text-whale-text-muted leading-relaxed">
          WhaleWatch is a real-time Solana whale intelligence dashboard powered by Birdeye API.
          Track large on-chain transactions, monitor smart money wallets, screen tokens by whale activity,
          and configure custom alerts.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href="https://birdeye.so" target="_blank" rel="noopener noreferrer" className="text-xs text-whale-accent hover:underline flex items-center gap-1">
            Birdeye API <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://solscan.io" target="_blank" rel="noopener noreferrer" className="text-xs text-whale-cyan hover:underline flex items-center gap-1">
            Solscan <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-[10px] text-whale-text-muted pt-1">v1.0.0 · Demo mode active</p>
      </div>
    </div>
  )
}
