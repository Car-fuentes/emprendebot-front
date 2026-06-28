import type { Consulta, Mensaje } from '../../types'
import { Button } from '../ui/Button'

interface ConsultaDetailProps {
  consulta: Consulta | null
  onCloseConsulta: (consultaId: string) => Promise<void>
  onBack?: () => void
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Nueva',
  atendida: 'En proceso',
  cerrada: 'Cerrada',
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: '#ef4444',
  atendida: '#0ea5e9',
  cerrada: '#64748b',
}

const CERRADA_POR_LABELS: Record<string, string> = {
  bot: 'Bot',
  emprendedor: 'Emprendedor',
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getMessageColors(emisor: Mensaje['emisor']) {
  if (emisor === 'bot') return { background: 'rgba(19,171,162,0.10)', align: 'flex-start' as const }
  if (emisor === 'usuario') return { background: 'rgba(34,197,94,0.10)', align: 'flex-end' as const }
  return { background: 'var(--color-bg-subtle)', align: 'flex-start' as const }
}

function openWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, '')
  window.open(`https://wa.me/${digits}`, '_blank', 'noopener,noreferrer')
}

export function ConsultaDetail({ consulta, onCloseConsulta, onBack }: ConsultaDetailProps) {
  if (!consulta) {
    return (
      <section style={{
        padding: '28px 20px',
        textAlign: 'center',
        background: 'var(--color-bg)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}>
        <h2 style={{ fontSize: '17px', marginBottom: '6px' }}>Selecciona una consulta</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
          El historial de mensajes va a aparecer aca.
        </p>
      </section>
    )
  }

  const isClosed = consulta.estado === 'cerrada'
  const estadoColor = ESTADO_COLORS[consulta.estado] ?? 'var(--color-primary)'
  const messages = [...consulta.mensajes].sort((left, right) => (
    new Date(left.fechaCreacion).getTime() - new Date(right.fechaCreacion).getTime()
  ))

  return (
    <section style={{
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      <header style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              padding: 0,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-family)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ← Volver a consultas
          </button>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '18px', marginBottom: '4px' }}>
              {consulta.clienteNombre || 'Cliente sin identificar'}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              {consulta.asunto || consulta.descripcion || 'Consulta sin asunto'}
            </p>
          </div>
          <span style={{
            flexShrink: 0,
            alignSelf: 'flex-start',
            padding: '5px 9px',
            borderRadius: 'var(--radius-full)',
            background: `${estadoColor}1A`,
            color: estadoColor,
            fontSize: '12px',
            fontWeight: 700,
          }}>
            {ESTADO_LABELS[consulta.estado] ?? consulta.estado}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '8px',
          marginBottom: '14px',
        }}>
          {[
            ['Canal', consulta.canal ?? 'web'],
            ['Tipo', consulta.tipoConsulta ?? 'general'],
            ['Prioridad', consulta.prioridad ?? 'normal'],
            ['Ultima', formatDate(consulta.fechaActualizacion)],
            ...(consulta.derivada ? [['Derivacion', consulta.derivadaA ? `Asesor: ${consulta.derivadaA}` : 'Derivada a un asesor']] : []),
            ...(isClosed ? [['Cerrada por', consulta.cerradaPor ? CERRADA_POR_LABELS[consulta.cerradaPor] : 'Sin dato']] : []),
          ].map(([label, value]) => (
            <div key={label} style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg-subtle)',
            }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '11px', marginBottom: '2px' }}>{label}</p>
              <p style={{
                fontSize: '13px',
                fontWeight: label === 'Derivacion' ? 500 : 600,
                color: label === 'Derivacion' ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {consulta.clienteTelefono && (
            <Button type="button" size="sm" variant="outline" onClick={() => openWhatsApp(consulta.clienteTelefono!)}>
              Abrir WhatsApp
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant={isClosed ? 'ghost' : 'primary'}
            disabled={isClosed}
            onClick={() => onCloseConsulta(consulta.id)}
          >
            {isClosed ? 'Consulta cerrada' : 'Marcar cerrada'}
          </Button>
        </div>
      </header>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map(message => {
          const colors = getMessageColors(message.emisor)
          return (
            <article
              key={message.id}
              style={{
                alignSelf: colors.align,
                maxWidth: '88%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: colors.background,
                border: '1px solid var(--color-border)',
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                {message.emisor}
              </p>
              <p style={{ fontSize: '14px', lineHeight: 1.45, marginBottom: '6px' }}>{message.contenido}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{formatDate(message.fechaCreacion)}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
