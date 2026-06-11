interface StatCardProps {
  label: string
  value: number | string
  description: string
  color: string
  icon: string
}

export function StatCard({ label, value, description, color, icon }: StatCardProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '16px',
      background: 'var(--color-bg)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Icono + valor */}
      <div style={{
        width: 52, height: 52,
        borderRadius: 'var(--radius-sm)',
        background: `${color}18`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '24px',
          fontWeight: 700,
          color,
          lineHeight: 1,
          marginBottom: '4px',
        }}>
          {value}
        </p>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {label}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          {description}
        </p>
      </div>

      {/* Arrow */}
      <span style={{ color: 'var(--color-border)', fontSize: '18px', flexShrink: 0 }}>›</span>
    </div>
  )
}
