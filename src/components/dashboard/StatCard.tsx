import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: number | string
  description: string
  color: string
  icon: ReactNode
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

const TONE_BACKGROUNDS: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'rgba(19, 168, 162, 0.12)',
  secondary: 'rgba(37, 99, 235, 0.10)',
  success: 'rgba(34, 197, 94, 0.10)',
  warning: 'rgba(245, 158, 11, 0.12)',
  danger: 'rgba(239, 68, 68, 0.10)',
}

const TONE_GRADIENTS: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'linear-gradient(135deg, #12C8BE 0%, #0B8F8A 100%)',
  secondary: 'linear-gradient(135deg, #8B5CF6 0%, #2563EB 100%)',
  success: 'linear-gradient(135deg, #25D99A 0%, #11B866 100%)',
  warning: 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)',
  danger: 'linear-gradient(135deg, #FF6A3D 0%, #EF3E1D 100%)',
}

export function StatCard({ label, value, description, color, icon, tone = 'primary' }: StatCardProps) {
  return (
    <div style={{
      position: 'relative',
      minHeight: 108,
      padding: '16px',
      background: 'var(--color-bg)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      boxShadow: '0 8px 24px rgba(17, 24, 39, 0.045)',
      overflow: 'hidden',
    }}>
      <span aria-hidden="true" style={{
        position: 'absolute',
        top: -18,
        right: -14,
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: TONE_BACKGROUNDS[tone],
      }} />

      <div style={{
        position: 'relative',
        width: 38,
        height: 38,
        borderRadius: '12px',
        background: TONE_GRADIENTS[tone],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        marginBottom: '12px',
        boxShadow: `0 10px 18px ${color}30`,
      }}>
        {icon}
      </div>

      <div style={{ position: 'relative' }}>
        <p style={{
          fontSize: '26px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1.05,
          marginBottom: '5px',
        }}>
          {value}
        </p>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', lineHeight: 1.35 }}>
          {label}
        </p>
        <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
          {description}
        </p>
      </div>
    </div>
  )
}
