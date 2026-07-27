import type { ReactNode } from 'react'
import { brand, iconGradients } from '../../styles/brand'

interface StatCardProps {
  label: string
  value: number | string
  description: string
  color: string
  icon: ReactNode
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  loading?: boolean
  error?: boolean
  unavailable?: boolean
}

const TONE_BACKGROUNDS: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'rgba(19, 168, 162, 0.12)',
  secondary: 'rgba(37, 99, 235, 0.10)',
  success: 'rgba(34, 197, 94, 0.10)',
  warning: 'rgba(245, 158, 11, 0.12)',
  danger: 'rgba(239, 68, 68, 0.10)',
}

const TONE_GRADIENTS: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: iconGradients.primary,
  secondary: iconGradients.secondary,
  success: iconGradients.success,
  warning: iconGradients.warning,
  danger: iconGradients.danger,
}

export function StatCard({
  label,
  value,
  description,
  color,
  icon,
  tone = 'primary',
  loading = false,
  error = false,
  unavailable = false,
}: StatCardProps) {
  const accessibleValue = loading
    ? 'Cargando'
    : error ? 'No pudimos cargar este dato'
      : unavailable ? 'Sin datos disponibles'
        : String(value)

  return (
    <div className="dashboard-stat-card" aria-label={`${label}: ${accessibleValue}`} style={{
      position: 'relative',
      minHeight: 148,
      padding: '20px',
      background: 'var(--dashboard-card, var(--color-bg))',
      borderRadius: '16px',
      border: '1px solid var(--dashboard-border, var(--color-border))',
      boxShadow: brand.shadowCard,
      overflow: 'hidden',
    }}>
      <span aria-hidden="true" style={{
        position: 'absolute',
        top: -34,
        right: -24,
        width: 106,
        height: 106,
        borderRadius: '50%',
        background: TONE_BACKGROUNDS[tone],
      }} />

      <div style={{
        position: 'relative',
        width: 42,
        height: 42,
        borderRadius: '12px',
        background: TONE_GRADIENTS[tone],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        marginBottom: '13px',
        boxShadow: `0 10px 18px ${color}30`,
      }}>
        {icon}
      </div>

      <div style={{ position: 'relative' }}>
        <p aria-hidden={loading} style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--dashboard-text, var(--color-text-primary))',
          lineHeight: 1.05,
          marginBottom: '5px',
        }}>
          {loading ? <span className="dashboard-stat-card__skeleton" /> : value}
        </p>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dashboard-muted, var(--color-text-secondary))', lineHeight: 1.35 }}>
          {label}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--dashboard-muted, var(--color-text-secondary))', marginTop: '3px', lineHeight: 1.35 }}>
          {error ? 'No pudimos cargar este dato' : unavailable ? 'Sin datos disponibles' : description}
        </p>
      </div>
      <style>{`
        .dashboard-stat-card {
          transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
        }
        .dashboard-stat-card:hover {
          border-color: color-mix(in srgb, ${color} 52%, var(--dashboard-border, var(--color-border)));
          box-shadow: 0 14px 30px rgba(15, 23, 42, .11) !important;
          transform: translateY(-3px);
        }
        .dashboard-stat-card__skeleton {
          width: 62px;
          height: 27px;
          display: block;
          border-radius: 7px;
          background: linear-gradient(
            90deg,
            var(--dashboard-border, var(--color-border)),
            var(--dashboard-card, var(--color-bg)),
            var(--dashboard-border, var(--color-border))
          );
          background-size: 200% 100%;
          animation: dashboard-stat-loading 1.2s linear infinite;
        }
        @keyframes dashboard-stat-loading {
          to { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dashboard-stat-card__skeleton { animation: none; }
        }
      `}</style>
    </div>
  )
}
