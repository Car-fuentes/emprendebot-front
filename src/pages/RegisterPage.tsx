import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import type { Rubro } from '../types'

const RUBROS: { value: Rubro; label: string }[] = [
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'peluqueria', label: 'Peluquería / Estética' },
  { value: 'indumentaria', label: 'Indumentaria' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'servicios', label: 'Servicios profesionales' },
  { value: 'salud', label: 'Salud / Bienestar' },
  { value: 'educacion', label: 'Educación' },
  { value: 'otro', label: 'Otro' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rubro, setRubro] = useState<Rubro | ''>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!nombre || !email || !password || !confirmPassword || !rubro) {
      setError('Completá todos los campos.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      await register(nombre, email, password, rubro)
      navigate('/configurar')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100svh',
      background: 'var(--color-bg)',
    }}>
      {/* Back */}
      <div style={{ padding: '16px 24px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '14px', color: 'var(--color-text-secondary)',
            border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-family)',
          }}
        >
          ← Iniciar sesion
        </button>
      </div>

      <div style={{ flex: 1, padding: '8px 24px 40px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
          Empezá hoy
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          Completá tus datos para crear tu cuenta.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="Nombre completo"
            placeholder="Ej: María García"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            placeholder="nombre@correo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            endAdornment={(
              <PasswordVisibilityButton
                visible={showPassword}
                onClick={() => setShowPassword(value => !value)}
              />
            )}
          />

          <Input
            label="Repetir contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repetí tu contraseña"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            error={confirmPassword && password !== confirmPassword ? 'Las contraseñas no coinciden' : undefined}
            endAdornment={(
              <PasswordVisibilityButton
                visible={showConfirmPassword}
                onClick={() => setShowConfirmPassword(value => !value)}
              />
            )}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{
              fontSize: '12px', fontWeight: 600,
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.8px', textTransform: 'uppercase',
            }}>
              Rubro de tu negocio
            </label>
            <select
              value={rubro}
              onChange={e => setRubro(e.target.value as Rubro)}
              style={{
                height: '52px',
                padding: '0 16px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${error && !rubro ? 'var(--color-error)' : 'var(--color-border)'}`,
                fontSize: '15px',
                fontFamily: 'var(--font-family)',
                color: rubro ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                background: 'var(--color-bg)',
                outline: 'none',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <option value="">Seleccioná</option>
              {RUBROS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: 'var(--color-error)', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            CREAR CUENTA
          </Button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
        }}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

function PasswordVisibilityButton({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      style={{
        width: '52px',
        height: '52px',
        display: 'grid',
        placeItems: 'center',
        border: 'none',
        background: 'transparent',
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
      }}
    >
      {visible ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m3 3 18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 4.5 10 8a13.7 13.7 0 0 1-2.1 4.2" />
          <path d="M6.6 6.6A13.6 13.6 0 0 0 2 12c1 3.5 5 8 10 8a10.7 10.7 0 0 0 5.4-1.5" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )
}
