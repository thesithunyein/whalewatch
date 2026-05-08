import clsx from 'clsx'

export function Skeleton({ className }) {
  return (
    <div className={clsx('bg-whale-muted animate-pulse rounded', className)} />
  )
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr className="border-b border-whale-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function CardSkeleton({ className }) {
  return (
    <div className={clsx('bg-whale-card border border-whale-border rounded-xl p-4 space-y-3', className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}
