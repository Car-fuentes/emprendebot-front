import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  selected?: boolean
}

export function Chip({ children, selected = false, style, ...props }: ChipProps) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        background: selected ? 'var(--color-primary)' : 'var(--color-bg)',
        color: selected ? '#fff' : 'var(--color-text-primary)',
        fontSize: '13px',
        fontWeight: selected ? 600 : 400,
        fontFamily: 'var(--font-family)',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--transition)',
        whiteSpace: 'nowrap',
        opacity: props.disabled ? 0.5 : 1,
        ...style,
      }}
      {...props}
    >
      {children}
      {selected && <span style={{ fontSize: '11px' }}>✓</span>}
    </button>
  )
}
