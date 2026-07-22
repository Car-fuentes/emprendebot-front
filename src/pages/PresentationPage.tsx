import { useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { brand } from '../styles/brand'

export function PresentationPage() {
  const navigate = useNavigate()
  const { loginWithGoogle } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const googleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

  const handleGoogleLogin = async (response: CredentialResponse) => {
    setGoogleError('')
    if (!response.credential) {
      setGoogleError('Google no devolvió una credencial válida.')
      return
    }

    setGoogleLoading(true)
    try {
      await loginWithGoogle(response.credential)
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

        <div style={{
          minHeight: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {googleConfigured ? (
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setGoogleError('No pudimos iniciar sesión con Google.')}
              text="continue_with"
              shape="rectangular"
              size="large"
              width="320"
            />
          ) : (
            <p role="alert" style={{ color: 'var(--color-error)', fontSize: '12px', textAlign: 'center' }}>
              Falta configurar VITE_GOOGLE_CLIENT_ID.
            </p>
          )}
        </div>

        {googleLoading && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', textAlign: 'center' }}>
            Verificando identidad con Google...
          </p>
        )}

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
    </div>
  )
}
