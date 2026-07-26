import type { Consulta, ConsultaEstado } from '../../types'
import { formatRelativeTime } from '../../utils/formatRelativeTime'
import { AppIcon } from '../ui/AppIcon'

interface ConsultaCardProps {
  consulta: Consulta
  selected?: boolean
  onSelect: (consultaId: string) => void
}

const ESTADO_STYLES: Record<ConsultaEstado, { label: string; color: string; background: string }> = {
  nueva: { label: 'Nueva', color: 'var(--status-new-text)', background: 'var(--status-new-bg)' },
  en_proceso: { label: 'En proceso', color: 'var(--status-progress-text)', background: 'var(--status-progress-bg)' },
  cerrada: { label: 'Cerrada', color: 'var(--status-closed-text)', background: 'var(--status-closed-bg)' },
}

function getLastMessage(consulta: Consulta): string {
  const last = [...consulta.mensajes].sort((left, right) => (
    new Date(right.fechaCreacion).getTime() - new Date(left.fechaCreacion).getTime()
  ))[0]
  return consulta.asunto || last?.contenido || 'Sin mensajes todavía'
}

function getCanalLabel(canal?: string | null): string {
  return canal === 'whatsapp' ? 'WhatsApp' : 'Web'
}

function getDerivadaText(consulta: Consulta): string {
  if (!consulta.derivada) return ''
  return consulta.derivadaA ? `Derivada a ${consulta.derivadaA}` : 'Derivada a un asesor'
}

export function ConsultaCard({ consulta, selected = false, onSelect }: ConsultaCardProps) {
  const estadoStyle = ESTADO_STYLES[consulta.estado]
  const derivadaText = getDerivadaText(consulta)

  return (
    <button
      type="button"
      className={`consulta-card${selected ? ' consulta-card--selected' : ''}`}
      onClick={() => onSelect(consulta.id)}
      aria-pressed={selected}
      aria-label={`Ver conversación de ${consulta.clienteNombre || 'cliente sin identificar'}`}
    >
      <span className="consulta-card__avatar" aria-hidden="true">
        {(consulta.clienteNombre || 'C').trim().charAt(0).toUpperCase()}
      </span>
      <div className="consulta-card__body">
        <div className="consulta-card__heading">
          <h3>{consulta.clienteNombre || 'Cliente sin identificar'}</h3>
          <span className="consulta-card__status" style={{ background: estadoStyle.background, color: estadoStyle.color }}>
            {estadoStyle.label}
          </span>
        </div>
        <p className="consulta-card__message">{getLastMessage(consulta)}</p>
        {derivadaText && <p className="consulta-card__derived">{derivadaText}</p>}
        <div className="consulta-card__footer">
          <span><AppIcon name="chat" size={14} />{getCanalLabel(consulta.canal)}</span>
          <span><AppIcon name="time" size={14} />{formatRelativeTime(consulta.fechaActualizacion)}</span>
          <span className="consulta-card__action"><AppIcon name="chat" size={14} />Ver conversación</span>
        </div>
      </div>
    </button>
  )
}
