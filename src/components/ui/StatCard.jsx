import clsx from 'clsx'

export function StatCard({ label, value, subValue, icon: Icon, accent = false, className }) {
  return (
    <div className={clsx(
      'bg-whale-card border border-whale-border rounded-xl p-4 flex flex-col gap-1',
      accent && 'border-whale-accent/40',
      className
    )}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-whale-text-muted uppercase tracking-wider">{label}</p>
        {Icon && <Icon className={clsx('w-4 h-4', accent ? 'text-whale-accent' : 'text-whale-text-muted')} />}
      </div>
      <p className={clsx('text-2xl font-bold font-mono', accent ? 'text-whale-accent' : 'text-whale-text')}>
        {value}
      </p>
      {subValue && <p className="text-xs text-whale-text-muted">{subValue}</p>}
    </div>
  )
}
