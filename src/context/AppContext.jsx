import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext(null)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const STORAGE_KEYS = {
  watchlist: 'ww_watchlist',
  alerts: 'ww_alerts',
  alertHistory: 'ww_alert_history',
  settings: 'ww_settings',
}

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

function edgeFn(name, options = {}) {
  const { method = 'GET', body } = options
  return fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json())
}

export function AppProvider({ children }) {
  const [watchlist, setWatchlistState] = useState(() => load(STORAGE_KEYS.watchlist, []))
  const [alerts, setAlertsState] = useState(() => load(STORAGE_KEYS.alerts, []))
  const [alertHistory, setAlertHistoryState] = useState(() => load(STORAGE_KEYS.alertHistory, []))
  const [settings, setSettingsState] = useState(() => load(STORAGE_KEYS.settings, {
    whaleThreshold: 10000,
    telegramWebhook: '',
    notifySound: true,
    notifyToast: true,
    refreshInterval: 10,
  }))

  // API key stored server-side in Supabase — never in localStorage
  const [hasApiKey, setHasApiKey] = useState(false)
  const [apiKeyLoading, setApiKeyLoading] = useState(true)

  useEffect(() => {
    edgeFn('check-birdeye-key')
      .then((json) => setHasApiKey(json?.hasKey === true))
      .catch(() => setHasApiKey(false))
      .finally(() => setApiKeyLoading(false))
  }, [])

  const saveApiKey = useCallback(async (key) => {
    const json = await edgeFn('save-birdeye-key', { method: 'POST', body: { key } })
    if (json?.success) setHasApiKey(true)
    return json
  }, [])

  const setWatchlist = useCallback((v) => { setWatchlistState(v); save(STORAGE_KEYS.watchlist, v) }, [])
  const setAlerts = useCallback((v) => { setAlertsState(v); save(STORAGE_KEYS.alerts, v) }, [])
  const setAlertHistory = useCallback((v) => { setAlertHistoryState(v); save(STORAGE_KEYS.alertHistory, v) }, [])
  const setSettings = useCallback((v) => { setSettingsState(v); save(STORAGE_KEYS.settings, v) }, [])

  const addToWatchlist = useCallback((wallet) => {
    setWatchlist((prev) => prev.find((w) => w.address === wallet.address) ? prev : [...prev, wallet])
  }, [setWatchlist])

  const removeFromWatchlist = useCallback((address) => {
    setWatchlist((prev) => prev.filter((w) => w.address !== address))
  }, [setWatchlist])

  const isWatched = useCallback((address) => {
    return watchlist.some((w) => w.address === address)
  }, [watchlist])

  const addAlert = useCallback((alert) => {
    const newAlert = { ...alert, id: Date.now(), createdAt: Date.now(), enabled: true }
    setAlerts((prev) => [...prev, newAlert])
    return newAlert.id
  }, [setAlerts])

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [setAlerts])

  const toggleAlert = useCallback((id) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, enabled: !a.enabled } : a))
  }, [setAlerts])

  const addAlertEvent = useCallback((event) => {
    setAlertHistory((prev) => [{ ...event, id: Date.now() }, ...prev].slice(0, 500))
  }, [setAlertHistory])

  return (
    <AppContext.Provider value={{
      watchlist, addToWatchlist, removeFromWatchlist, isWatched,
      alerts, addAlert, removeAlert, toggleAlert,
      alertHistory, addAlertEvent,
      hasApiKey, apiKeyLoading, saveApiKey,
      settings, setSettings,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
