import clsx from 'clsx'

const variants = {
  buy: 'bg-whale-green-dim text-whale-green border-whale-green/30',
  sell: 'bg-whale-red-dim text-whale-red border-whale-red/30',
  whale: 'bg-whale-purple-dim text-whale-purple border-whale-purple/30',
  warning: 'bg-whale-yellow-dim text-whale-yellow border-whale-yellow/30',
  info: 'bg-whale-accent/10 text-whale-accent border-whale-accent/30',
  neutral: 'bg-whale-muted text-whale-text-dim border-whale-border',
  green: 'bg-whale-green-dim text-whale-green border-whale-green/30',
  red: 'bg-whale-red-dim text-whale-red border-whale-red/30',
  live: 'bg-whale-green text-white border-transparent',
}

export function Badge({ children, variant = 'neutral', className }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
