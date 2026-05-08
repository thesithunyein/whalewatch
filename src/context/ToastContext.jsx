import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'

const ToastContext = createContext(null)

let toastId = 0

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'border-whale-green text-whale-green',
  error: 'border-whale-red text-whale-red',
  warning: 'border-whale-yellow text-whale-yellow',
  info: 'border-whale-accent text-whale-accent',
}

function Toast({ toast, onDismiss }) {
  const Icon = icons[toast.type] || Info
  return (
    <div className={`flex items-start gap-3 bg-whale-card border ${colors[toast.type]} border-l-4 rounded-lg p-4 shadow-xl min-w-[300px] max-w-sm animate-slide-up`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-sm text-whale-text">{toast.title}</p>}
        <p className="text-sm text-whale-text-dim">{toast.message}</p>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="text-whale-text-muted hover:text-whale-text transition-colors flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message, options = {}) => {
    const id = ++toastId
    const t = { id, message, type: 'info', duration: 4000, ...options }
    setToasts((prev) => [...prev.slice(-4), t])
    if (t.duration > 0) {
      setTimeout(() => dismiss(id), t.duration)
    }
    return id
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
