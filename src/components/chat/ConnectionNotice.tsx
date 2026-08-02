interface ConnectionNoticeProps {
  isRetrying: boolean
  onRetry: () => void
}

export function ConnectionNotice({ isRetrying, onRetry }: ConnectionNoticeProps) {
  return (
    <section className="public-chat__connection" role="alert" aria-live="polite">
      <span className="public-chat__connection-icon" aria-hidden="true">!</span>
      <div>
        <strong>Sin conexión</strong>
        <p>No pudimos comunicarnos con el servidor. Revisá tu conexión a internet e intentá nuevamente.</p>
      </div>
      <button type="button" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? 'Reintentando…' : 'Reintentar'}
      </button>
    </section>
  )
}
