interface QuickRepliesProps {
  options: string[]
  onSelect: (option: string) => void
}

interface QuickReplyVisual {
  icon: string
  label: string
}

const QUICK_REPLY_VISUALS: Array<{ keywords: string[]; visual: QuickReplyVisual }> = [
  { keywords: ['producto', 'catálogo', 'catalogo'], visual: { icon: '🛍️', label: 'Productos' } },
  { keywords: ['información', 'informacion', 'horario'], visual: { icon: 'ℹ️', label: 'Información' } },
  { keywords: ['presupuesto'], visual: { icon: '📋', label: 'Presupuesto' } },
  { keywords: ['datos', 'contacto'], visual: { icon: '👤', label: 'Contacto' } },
  { keywords: ['frecuente', 'faq', 'pregunta'], visual: { icon: '❓', label: 'Preguntas frecuentes' } },
  { keywords: ['persona', 'asesor', 'hablar'], visual: { icon: '🎧', label: 'Atención personal' } },
]

function getOptionVisual(option: string): QuickReplyVisual {
  const normalizedOption = option.toLowerCase()
  return QUICK_REPLY_VISUALS.find(({ keywords }) =>
    keywords.some(keyword => normalizedOption.includes(keyword))
  )?.visual ?? { icon: '→', label: 'Opción sugerida' }
}

export function QuickReplies({ options, onSelect }: QuickRepliesProps) {
  if (options.length === 0) return null

  return (
    <section className="quick-replies" aria-label="Opciones sugeridas">
      <p className="quick-replies__heading">Podés elegir una opción:</p>

      <div className="quick-replies__grid" role="group" aria-label="Respuestas rápidas">
        {options.map(option => {
          const visual = getOptionVisual(option)
          const isWideOption = option.length >= 22

          return (
            <button
              key={option}
              type="button"
              className={`quick-replies__button${isWideOption ? ' quick-replies__button--wide' : ''}`}
              onClick={() => onSelect(option)}
              aria-label={`${visual.label}: ${option}`}
            >
              <span className="quick-replies__button-icon" aria-hidden="true">
                {visual.icon}
              </span>
              <span className="quick-replies__button-text">{option}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
