import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { loadBusiness } = useBusiness()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Completá todos los campos.')
      return
    }
    setLoading(true)
    try {
      const user = await login(email, password).then(() => {
        // Recargamos user del localStorage para obtener el id
        const stored = localStorage.getItem('eb_current_user')
        return stored ? JSON.parse(stored) : null
      })
      if (user) {
        loadBusiness(user.id)
        // Si ya tiene negocio → dashboard, si no → setup
        const businesses = JSON.parse(localStorage.getItem('eb_businesses') ?? '[]')
        const hasBusiness = businesses.some((b: { userId: string }) => b.userId === user.id)
        navigate(hasBusiness ? '/dashboard' : '/configurar')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
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
      {/* Back button */}
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
          ← Iniciar sesión
        </button>
      </div>

      <div style={{ flex: 1, padding: '8px 24px 40px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
          Bienvenida de nuevo
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          Ingresá a tu cuenta para continuar.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="Email"
            type="email"
            placeholder="Marina@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              error={error}
            />
            <button
              type="button"
              style={{
                alignSelf: 'flex-end', fontSize: '13px',
                color: 'var(--color-primary)', border: 'none', background: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-family)',
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            INICIA SESIÓN
          </Button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
        }}>
          ¿No tenés cuenta?{' '}
          <Link to="/registro" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Crear cuenta.
          </Link>
        </p>
      </div>
    </div>
  )
}
