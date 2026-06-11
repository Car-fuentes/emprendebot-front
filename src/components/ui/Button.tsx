import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  children: ReactNode
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-family)',
    fontWeight: 600,
    borderRadius: 'var(--radius-full)',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'background var(--transition), opacity var(--transition)',
    whiteSpace: 'nowrap',
  },
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-primary)',
    color: '#fff',
    borderColor: 'var(--color-primary)',
  },
  secondary: {
    background: 'var(--color-secondary)',
    color: '#fff',
    borderColor: 'var(--color-secondary)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-primary)',
    borderColor: 'transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
  },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { height: '36px', padding: '0 16px', fontSize: '13px' },
  md: { height: '48px', padding: '0 24px', fontSize: '14px' },
  lg: { height: '56px', padding: '0 32px', fontSize: '16px' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      style={{
        ...styles.base,
        ...variantStyles[variant],
        ...sizeStyles[size],
        width: fullWidth ? '100%' : undefined,
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <>
          <span style={{
            width: 16, height: 16,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block',
          }} />
          Cargando...
        </>
      ) : children}
    </button>
  )
}

// Spinner keyframes inyectados globalmente una sola vez
const spinStyle = document.createElement('style')
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
document.head.appendChild(spinStyle)
