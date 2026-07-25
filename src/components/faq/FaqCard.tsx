import { useState } from 'react'
import type { FAQ } from '../../types'
import { AppIcon } from '../ui/AppIcon'

interface FaqCardProps {
  faq: FAQ
  busy?: boolean
  onEdit: (faq: FAQ) => void
  onDelete: (faq: FAQ) => void
  onToggle: (faqId: string) => Promise<void>
}

export function FaqCard({ faq, busy = false, onEdit, onDelete, onToggle }: FaqCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className={`faq-card${expanded ? ' faq-card--expanded' : ''}${busy ? ' faq-card--busy' : ''}`}>
      <div className="faq-card__top">
        <button
          type="button"
          className="faq-card__question"
          aria-expanded={expanded}
          onClick={() => setExpanded(current => !current)}
        >
          <span>
            <strong>{faq.pregunta}</strong>
            <small>{faq.categoria || 'Sin categoría'}</small>
          </span>
        </button>

        <span className={`faq-card__status${faq.activa ? ' faq-card__status--active' : ''}`}>
          {busy ? 'Actualizando…' : faq.activa ? 'Activa' : 'Inactiva'}
        </span>
        <button
          type="button"
          className={`faq-card__expand${expanded ? ' faq-card__expand--open' : ''}`}
          aria-label={expanded ? `Ocultar respuesta de ${faq.pregunta}` : `Ver respuesta de ${faq.pregunta}`}
          aria-expanded={expanded}
          onClick={() => setExpanded(current => !current)}
        >
          <AppIcon name="chevronDown" size={18} />
        </button>
        <div className="faq-card__actions">
          <button type="button" disabled={busy} onClick={() => onEdit(faq)} aria-label={`Editar ${faq.pregunta}`} title="Editar">
            <AppIcon name="edit" size={17} />
          </button>
          <button className="faq-card__delete" type="button" disabled={busy} onClick={() => onDelete(faq)} aria-label={`Eliminar ${faq.pregunta}`} title="Eliminar">
            <AppIcon name="trash" size={17} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="faq-card__details">
          <p>{faq.respuesta}</p>
          <div className="faq-card__toggle-row">
            <span>
              <strong>Mostrar en el chatbot</strong>
              <small>Disponible para responder consultas de tus clientes.</small>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={faq.activa}
              aria-label={`${faq.activa ? 'Ocultar del chatbot' : 'Mostrar en el chatbot'}: ${faq.pregunta}`}
              className={`faq-switch${faq.activa ? ' faq-switch--active' : ''}`}
              disabled={busy}
              onClick={() => void onToggle(faq.id)}
            >
              <span />
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
