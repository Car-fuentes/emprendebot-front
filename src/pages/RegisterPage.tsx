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
          ← Crear cuenta
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
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <Input
            label="Repetir contraseña"
            type="password"
            placeholder="Repetí tu contraseña"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            error={confirmPassword && password !== confirmPassword ? 'Las contraseñas no coinciden' : undefined}
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
