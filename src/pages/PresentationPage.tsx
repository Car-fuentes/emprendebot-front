import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { brand } from '../styles/brand'

export function PresentationPage() {
  const navigate = useNavigate()
  const { loginWithGoogle } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const [showGoogleMock, setShowGoogleMock] = useState(false)

  const handleGoogleLogin = async () => {
    setGoogleError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      setShowGoogleMock(false)
      navigate('/configurar')
    } catch (error) {
      setGoogleError(error instanceof Error ? error.message : 'No pudimos continuar con Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px 32px 24px',
        background: 'var(--color-bg)',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
          <img src="/isoBot-transparente.png" alt="EmprendeBot" style={{ width: 72, height: 72 }} />
          <span style={{
            fontSize: '18px',
            fontWeight: 700,
            background: brand.primaryGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            EmprendeBot
          </span>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '28px 0 0', lineHeight: 1.2 }}>
          Hola 👋
        </h1>

        <p style={{ fontSize: '18px', margin: 0, lineHeight: 1.4, textAlign: 'left', width: '100%' }}>
          Soy <strong>EmprendeBot</strong>, tu asistente de gestión comercial.
        </p>

        <p style={{
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          margin: '6px 0 0',
          textAlign: 'left',
          width: '100%',
        }}>
          Te ayudaré a responder consultas, generar presupuestos y potenciar las oportunidades de venta de tu negocio.
        </p>
      </main>

      <section aria-label="Opciones de acceso" style={{
        padding: '12px 28px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'var(--color-bg)',
      }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/registro')}
          style={{ background: brand.primaryGradient, borderRadius: 'var(--radius-md)', border: 'none' }}
        >
          CREAR CUENTA
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-secondary)' }}>
          <span style={{ height: 1, flex: 1, background: 'var(--color-border)' }} />
          <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>o continuar con</span>
          <span style={{ height: 1, flex: 1, background: 'var(--color-border)' }} />
        </div>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          loading={googleLoading}
          onClick={() => setShowGoogleMock(true)}
          aria-label="Continuar con Google"
          style={{
            minHeight: 52,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg)',
            color: 'var(--color-text-primary)',
            boxShadow: 'var(--shadow-sm)',
            fontSize: '14px',
            textTransform: 'none',
          }}
        >
          <GoogleIcon />
          Continuar con Google
        </Button>

        {googleError && (
          <p role="alert" style={{ color: 'var(--color-error)', fontSize: '12px', textAlign: 'center' }}>
            {googleError}
          </p>
        )}

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          ¿Ya tenés una cuenta?
        </p>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => navigate('/login')}
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          INICIAR SESIÓN
        </Button>
      </section>

      {showGoogleMock && (
        <GoogleAccountMock
          loading={googleLoading}
          onClose={() => !googleLoading && setShowGoogleMock(false)}
          onSelect={handleGoogleLogin}
        />
      )}
    </div>
  )
}

function GoogleAccountMock({
  loading,
  onClose,
  onSelect,
}: {
  loading: boolean
  onClose: () => void
  onSelect: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-account-title"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(32, 33, 36, 0.56)',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
        borderRadius: 20,
        background: '#fff',
        color: '#202124',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.28)',
        fontFamily: 'Arial, sans-serif',
      }}>
        <div style={{ position: 'relative', padding: '28px 28px 20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar selector de cuentas"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 36,
              height: 36,
              borderRadius: '50%',
              color: '#5f6368',
              fontSize: 24,
              lineHeight: 1,
            }}
          >
            ×
          </button>

          <GoogleWordmark />
          <h2 id="google-account-title" style={{ margin: '20px 0 8px', fontSize: 24, fontWeight: 400 }}>
            Elegí una cuenta
          </h2>
          <p style={{ color: '#5f6368', fontSize: 15, lineHeight: 1.45 }}>
            para continuar a <strong style={{ color: '#202124', fontWeight: 500 }}>EmprendeBot</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={onSelect}
          disabled={loading}
          style={{
            width: '100%',
            minHeight: 72,
            padding: '12px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderTop: '1px solid #dadce0',
            borderBottom: '1px solid #dadce0',
            textAlign: 'left',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <span style={{
            width: 40,
            height: 40,
            flex: '0 0 auto',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            background: '#1a73e8',
            color: '#fff',
            fontSize: 18,
            fontWeight: 500,
          }}>
            U
          </span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span style={{ display: 'block', marginBottom: 3, fontSize: 15, fontWeight: 500 }}>
              Usuario Demo
            </span>
            <span style={{ display: 'block', overflow: 'hidden', color: '#5f6368', fontSize: 14, textOverflow: 'ellipsis' }}>
              demo.google@emprendebot.test
            </span>
          </span>
          {loading && <GoogleSpinner />}
        </button>

        <button
          type="button"
          onClick={onSelect}
          disabled={loading}
          style={{
            width: '100%',
            minHeight: 64,
            padding: '12px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            color: '#3c4043',
            fontSize: 15,
            fontWeight: 500,
            textAlign: 'left',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
            <path d="M19 8h4M21 6v4" />
          </svg>
          Usar otra cuenta
        </button>

        <div style={{ padding: '18px 28px 24px', borderTop: '1px solid #dadce0' }}>
          <p style={{ color: '#5f6368', fontSize: 12, lineHeight: 1.5 }}>
            <strong style={{ color: '#1a73e8' }}>Modo demostración:</strong> este selector no accede a cuentas reales de Google.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleWordmark() {
  return (
    <span aria-label="Google" style={{ display: 'inline-flex', fontSize: 24, fontWeight: 600, letterSpacing: '-1px' }}>
      <span style={{ color: '#4285f4' }}>G</span><span style={{ color: '#ea4335' }}>o</span><span style={{ color: '#fbbc05' }}>o</span><span style={{ color: '#4285f4' }}>g</span><span style={{ color: '#34a853' }}>l</span><span style={{ color: '#ea4335' }}>e</span>
    </span>
  )
}

function GoogleSpinner() {
  return (
    <span style={{
      width: 20,
      height: 20,
      flex: '0 0 auto',
      border: '2px solid #dadce0',
      borderTopColor: '#1a73e8',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.38l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.92A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.53l3.35-2.61Z" />
      <path fill="#EA4335" d="M12 5.95c1.47 0 2.78.5 3.82 1.49l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z" />
    </svg>
  )
}
