import type { Message } from '../../types'

interface MessageBubbleProps {
  message: Message
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.role === 'bot'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      marginBottom: '4px',
    }}>
      <div style={{
        maxWidth: '82%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isBot ? 'flex-start' : 'flex-end',
        gap: '4px',
      }}>
        <div style={{
          padding: '10px 14px',
          borderRadius: isBot
            ? '4px var(--radius-md) var(--radius-md) var(--radius-md)'
            : 'var(--radius-md) 4px var(--radius-md) var(--radius-md)',
          background: isBot ? 'var(--color-bg)' : 'var(--color-secondary)',
          color: isBot ? 'var(--color-text-primary)' : '#fff',
          fontSize: '14px',
          lineHeight: '1.5',
          boxShadow: 'var(--shadow-sm)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {message.text}
        </div>
        <span style={{
          fontSize: '11px',
          color: 'var(--color-text-secondary)',
          padding: '0 4px',
        }}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '4px' }}>
      <div style={{
        padding: '12px 16px',
        borderRadius: '4px var(--radius-md) var(--radius-md) var(--radius-md)',
        background: 'var(--color-bg)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: 'var(--color-text-secondary)',
            display: 'inline-block',
            animation: `bounce 1s ease infinite ${i * 0.15}s`,
          }} />
        ))}
        <style>{`
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-6px); }
          }
        `}</style>
      </div>
    </div>
  )
}
