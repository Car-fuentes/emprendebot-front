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
      padding: '16px',
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)',
      opacity: busy ? 0.7 : 1,
      transition: 'opacity var(--transition)',
    }}>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ minWidth: 0 }}>
          {faq.categoria && (
            <span style={{
              display: 'inline-block',
              marginBottom: '7px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-secondary)',
              fontSize: '11px',
              fontWeight: 600,
            }}>
              {faq.categoria}
            </span>
          )}
          <h2 style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.4 }}>
            {faq.pregunta}
          </h2>
        </div>
      </div>

      <p style={{
        color: 'var(--color-text-secondary)',
        fontSize: '13px',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
      }}>
        {faq.respuesta}
      </p>

      <div style={{
        marginTop: '14px',
        padding: '12px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-bg-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
      }}>
        <Switch
          checked={faq.activa}
          label="Mostrar en el chatbot"
          disabled={busy}
          aria-label={`${faq.activa ? 'Ocultar del chatbot' : 'Mostrar en el chatbot'}: ${faq.pregunta}`}
          onChange={() => void onToggle(faq.id)}
        />
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '12px',
          lineHeight: 1.5,
        }}>
          Las preguntas activadas estaran disponibles para que el chatbot las utilice en las conversaciones.
        </p>
      </div>

      {confirmingDelete ? (
        <div style={{
          marginTop: '14px',
          paddingTop: '14px',
          borderTop: '1px solid var(--color-border)',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
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
              style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: '6px',
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid var(--color-border)',
        }}>
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => onEdit(faq)}>
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => setConfirmingDelete(true)}
            style={{ color: 'var(--color-error)' }}
          >
            Eliminar
          </Button>
        </div>
      )}
    </article>
  )
}
