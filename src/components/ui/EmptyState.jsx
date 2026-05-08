export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-whale-muted flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-whale-text-muted" />
        </div>
      )}
      <h3 className="text-base font-semibold text-whale-text mb-1">{title}</h3>
      {description && <p className="text-sm text-whale-text-muted max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
