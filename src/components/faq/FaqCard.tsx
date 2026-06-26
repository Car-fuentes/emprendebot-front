import { useState } from 'react'
import type { FAQ } from '../../types'
import { Button } from '../ui/Button'

interface FaqCardProps {
  faq: FAQ
  busy?: boolean
  onEdit: (faq: FAQ) => void
  onDelete: (faqId: string) => Promise<void>
  onToggle: (faqId: string) => Promise<void>
}

const FAQ_PRIMARY = '#13A8A2'
const FAQ_TEXT = '#111827'
const FAQ_MUTED = '#6C738E'
const FAQ_BORDER = '#E5E7EB'
const FAQ_DANGER = '#EF4444'

export function FaqCard({
  faq,
  busy = false,
  onEdit,
  onDelete,
  onToggle,
}: FaqCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <article style={{
      padding: '14px 16px 12px',
      background: '#FFFFFF',
      border: `1px solid ${FAQ_BORDER}`,
      borderRadius: '12px',
      boxShadow: '0 3px 8px rgba(17, 24, 39, 0.06)',
      marginBottom: '10px',
      opacity: busy ? 0.7 : 1,
      transition: 'opacity var(--transition)',
    }}>
      <h2 style={{
        fontSize: '12px',
        fontWeight: 800,
        lineHeight: 1.35,
        marginBottom: '10px',
        color: FAQ_TEXT,
      }}>
        {faq.pregunta}
      </h2>

      {faq.categoria && (
        <p style={{
          fontSize: '11px',
          lineHeight: 1.45,
          marginBottom: '10px',
          color: FAQ_TEXT,
        }}>
          <strong style={{ fontWeight: 800 }}>Categoria:</strong>{' '}
          <span style={{ color: FAQ_MUTED, fontWeight: 500 }}>{faq.categoria}</span>
        </p>
      )}

      <p style={{
        color: FAQ_MUTED,
        fontSize: '11px',
        lineHeight: 1.45,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        marginBottom: '12px',
      }}>
        {faq.respuesta}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '10px',
      }}>
        <span style={{
          color: FAQ_MUTED,
          fontSize: '10px',
          lineHeight: 1.2,
          fontWeight: 600,
        }}>
          Mostrar en el chatbot
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={faq.activa}
          disabled={busy}
          aria-label={`${faq.activa ? 'Ocultar del chatbot' : 'Mostrar en el chatbot'}: ${faq.pregunta}`}
          onClick={() => void onToggle(faq.id)}
          style={{
            width: '42px',
            height: '24px',
            borderRadius: '999px',
            border: `2px solid ${faq.activa ? FAQ_PRIMARY : '#8A8391'}`,
            background: faq.activa ? 'rgba(19, 168, 162, 0.14)' : '#FFFFFF',
            position: 'relative',
            padding: 0,
            cursor: busy ? 'not-allowed' : 'pointer',
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: faq.activa ? FAQ_PRIMARY : '#8A8391',
              position: 'absolute',
              top: '2px',
              left: faq.activa ? '20px' : '3px',
              transition: 'left var(--transition)',
            }}
          />
        </button>
      </div>

      {confirmingDelete ? (
        <div style={{
          marginTop: '10px',
          paddingTop: '12px',
          borderTop: `1px solid ${FAQ_BORDER}`,
        }}>
          <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px', color: FAQ_TEXT }}>
            Seguro que queres eliminar esta FAQ?
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              disabled={busy}
              onClick={() => setConfirmingDelete(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              fullWidth
              loading={busy}
              onClick={() => void onDelete(faq.id)}
              style={{ background: FAQ_DANGER, borderColor: FAQ_DANGER }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: '22px',
          marginTop: '2px',
        }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => onEdit(faq)}
            aria-label={`Editar ${faq.pregunta}`}
            style={{
              width: '24px',
              height: '24px',
              padding: 0,
              background: 'transparent',
              border: 'none',
              color: FAQ_MUTED,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.5 : 1,
            }}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block' }}>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmingDelete(true)}
            aria-label={`Eliminar ${faq.pregunta}`}
            style={{
              width: '24px',
              height: '24px',
              padding: 0,
              background: 'transparent',
              border: 'none',
              color: FAQ_DANGER,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.5 : 1,
            }}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block' }}>
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>
          </button>
        </div>
      )}
    </article>
  )
}
