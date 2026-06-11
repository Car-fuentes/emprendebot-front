import { Avatar } from '../ui/Avatar'
import type { Business } from '../../types'

interface ChatHeaderProps {
  business: Business
  onRefresh?: () => void
  onClose?: () => void
}

export function ChatHeader({ business, onRefresh, onClose }: ChatHeaderProps) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 16px',
      background: 'var(--color-secondary)',
      borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      flexShrink: 0,
    }}>
      <Avatar name={business.nombre} src={business.logo} size={40} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 600,
          fontSize: '15px',
          color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {business.nombre}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
          <span style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: '#22c55e',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
            Asistente · en línea
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Reiniciar conversación"
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ↺
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            title="Cerrar"
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        )}
      </div>
    </header>
  )
}
