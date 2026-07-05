import type { Consulta } from '../../types'

interface ConsultaCardProps {
  consulta: Consulta
  selected?: boolean
  onSelect: (consultaId: string) => void
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  atendida: 'Atendida',
  cerrada: 'Cerrada',
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: '#ef4444',
  atendida: '#0ea5e9',
  cerrada: '#64748b',
}

function getLastMessage(consulta: Consulta): string {
  const last = [...consulta.mensajes].sort((left, right) => (
    new Date(right.fechaCreacion).getTime() - new Date(left.fechaCreacion).getTime()
  ))[0]
  return consulta.asunto || last?.contenido || 'Sin mensajes todavia'
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getCanalLabel(canal?: string | null): string {
  if (canal === 'whatsapp') return 'WhatsApp'
  return 'Web'
}

function getDerivadaText(consulta: Consulta): string {
  if (!consulta.derivada) return ''
  return consulta.derivadaA ? `Derivada a ${consulta.derivadaA}` : 'Derivada a un asesor'
}

export function ConsultaCard({ consulta, selected = false, onSelect }: ConsultaCardProps) {
  const estado = consulta.estado
  const estadoColor = ESTADO_COLORS[estado] ?? 'var(--color-text-secondary)'
  const derivadaText = getDerivadaText(consulta)

  return (
    <button
      type="button"
      onClick={() => onSelect(consulta.id)}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '14px',
        border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        background: selected ? 'rgba(19,171,162,0.08)' : 'var(--color-bg)',
        boxShadow: selected ? '0 8px 24px rgba(15, 23, 42, 0.08)' : 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-family)',
        transition: 'all var(--transition)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {consulta.clienteNombre || 'Cliente sin identificar'}
          </h3>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '13px',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {getLastMessage(consulta)}
          </p>
        </div>

        <span style={{
          flexShrink: 0,
          alignSelf: 'flex-start',
          padding: '4px 8px',
          borderRadius: 'var(--radius-full)',
          background: `${estadoColor}1A`,
          color: estadoColor,
          fontSize: '11px',
          fontWeight: 700,
        }}>
          {ESTADO_LABELS[estado] ?? estado}
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        color: 'var(--color-text-secondary)',
        fontSize: '12px',
      }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <span style={{ fontWeight: 600, flexShrink: 0 }}>{getCanalLabel(consulta.canal)}</span>
          {derivadaText && (
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'var(--color-text-secondary)',
              fontSize: '11px',
              fontWeight: 500,
            }}>
              - {derivadaText}
            </span>
          )}
        </span>
        <span>{formatDate(consulta.fechaActualizacion)}</span>
      </div>
    </button>
  )
}
