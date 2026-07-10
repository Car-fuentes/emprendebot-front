import type { FAQ } from '../../types'

interface FaqListMessageProps {
  faqs: FAQ[]
  onSelect: (question: string) => void
}

export function FaqListMessage({ faqs, onSelect }: FaqListMessageProps) {
  return (
    <div style={{ paddingLeft: 44, paddingBottom: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {faqs.map(faq => (
        <button
          key={faq.id}
          onClick={() => onSelect(faq.pregunta)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            padding: '12px 14px',
            background: '#fff',
            border: '1.5px solid #E5E7EB',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'var(--font-family)',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(19,171,162,0.04)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'
            ;(e.currentTarget as HTMLButtonElement).style.background = '#fff'
          }}
        >
          {/* Círculo vacío */}
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            border: '1.5px solid #D1D5DB',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 14, color: '#111', lineHeight: 1.4 }}>
            {faq.pregunta}
          </span>
        </button>
      ))}
    </div>
  )
}
