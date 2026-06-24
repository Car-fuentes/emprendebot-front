import { useState } from 'react'
import type { FAQ } from '../../types'
import { Button } from '../ui/Button'
import { Switch } from '../ui/Switch'

interface FaqCardProps {
  faq: FAQ
  busy?: boolean
  onEdit: (faq: FAQ) => void
  onDelete: (faqId: string) => Promise<void>
  onToggle: (faqId: string) => Promise<void>
}

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
      padding: '26px 0 24px',
      background: 'transparent',
      borderBottom: '1px solid var(--color-border)',
      opacity: busy ? 0.7 : 1,
      transition: 'opacity var(--transition)',
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 800,
        lineHeight: 1.25,
        marginBottom: '10px',
        color: 'var(--color-text-primary)',
      }}>
        {faq.pregunta}
      </h2>

      {faq.categoria && (
        <p style={{
          fontSize: '13px',
          lineHeight: 1.45,
          marginBottom: '14px',
          color: 'var(--color-text-primary)',
        }}>
          <strong style={{ fontWeight: 700 }}>Categoría:</strong>{' '}
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{faq.categoria}</span>
        </p>
      )}

      <p style={{
        color: 'var(--color-text-secondary)',
        fontSize: '14px',
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        marginBottom: '16px',
      }}>
        {faq.respuesta}
      </p>

      <div style={{
        marginTop: '2px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <Switch
          checked={faq.activa}
          label="Mostrar en el chatbot"
          disabled={busy}
          aria-label={`${faq.activa ? 'Ocultar del chatbot' : 'Mostrar en el chatbot'}: ${faq.pregunta}`}
          onChange={() => void onToggle(faq.id)}
          style={{ fontSize: '13px', fontWeight: 700 }}
        />
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '12px',
          lineHeight: 1.45,
          maxWidth: '560px',
        }}>
          Cuando está activada, esta pregunta estará disponible para que el chatbot la use en las conversaciones con clientes.
        </p>
      </div>

      {confirmingDelete ? (
        <div style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid var(--color-border)',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
            Seguro que querés eliminar esta FAQ?
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
              style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: '32px',
          marginTop: '18px',
        }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => onEdit(faq)}
            style={{
              padding: 0,
              background: 'transparent',
              border: 'none',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-family)',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.5 : 1,
            }}
          >
            Editar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmingDelete(true)}
            style={{
              padding: 0,
              background: 'transparent',
              border: 'none',
              color: 'var(--color-error)',
              fontFamily: 'var(--font-family)',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.5 : 1,
            }}
          >
            Eliminar
          </button>
        </div>
      )}
    </article>
  )
}
