import { useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

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
      navigate('/configurar', { replace: true })
    } catch (error) {
      setGoogleError(error instanceof Error ? error.message : 'No pudimos continuar con Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="eb-presentation">
      <div className="eb-presentation__shell">
        <header className="eb-presentation__header">
          <img src="/isoBot-transparente.png" alt="" aria-hidden="true" />
          <span>
            EmprendeBot
          </span>
        </header>

        <main className="eb-presentation__main">
          <section className="eb-presentation__intro" aria-labelledby="presentation-title">
            <div className="eb-presentation__visual">
              <span className="eb-presentation__halo" aria-hidden="true" />
              <img src="/robot-bienvenida.png" alt="EmprendeBot, asistente de gestión comercial" />
            </div>

            <div className="eb-presentation__copy">
              <div className="eb-presentation__hello">
                <h1 id="presentation-title">Hola</h1>
                <img src="/isoBot-transparente.png" alt="" aria-hidden="true" />
              </div>
              <p className="eb-presentation__lead">
                Soy <strong>EmprendeBot</strong>, tu asistente de gestión comercial.
              </p>
              <p className="eb-presentation__description">
                Te ayudaré a responder consultas, generar presupuestos y potenciar las oportunidades de venta de tu negocio.
              </p>
            </div>
          </section>

          <section className="eb-presentation__actions" aria-label="Opciones de acceso">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/registro')}
              style={{
                background: 'linear-gradient(90deg, #13A8A2 0%, #255F80 100%)',
                borderRadius: '16px',
                border: '2px solid #FFFFFF',
                boxShadow: '0 10px 20px rgba(19, 168, 162, 0.22)',
              }}
            >
              CREAR CUENTA
            </Button>

            <div className="eb-presentation__separator">
              <span />
              <small>o continuar con</small>
              <span />
            </div>

            <div className="eb-presentation__google">
              {googleConfigured ? (
                <div className="eb-google-auth">
                  <div className="eb-google-auth__visual" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z" />
                      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.38l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.05v2.61A10 10 0 0 0 12 22Z" />
                      <path fill="#FBBC05" d="M6.4 13.92A6 6 0 0 1 6.08 12c0-.67.12-1.32.32-1.92V7.47H3.05A10 10 0 0 0 2 12c0 1.62.39 3.15 1.05 4.53l3.35-2.61Z" />
                      <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.86-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.47l3.35 2.61c.79-2.37 3-4.13 5.6-4.13Z" />
                    </svg>
                    <span>Continuar con Google</span>
                  </div>
                  <div className="eb-google-auth__official">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => setGoogleError('No pudimos iniciar sesión con Google.')}
                      text="continue_with"
                      shape="rectangular"
                      size="large"
                      width="400"
                    />
                  </div>
                </div>
              ) : (
                <p role="alert">
                  Falta configurar VITE_GOOGLE_CLIENT_ID.
                </p>
              )}
            </div>

            {googleLoading && (
              <p className="eb-presentation__status">
                Verificando identidad con Google...
              </p>
            )}

            {googleError && (
              <p role="alert" className="eb-presentation__error">
                {googleError}
              </p>
            )}

            <div className="eb-presentation__login">
              <p>¿Ya tenés una cuenta?</p>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => navigate('/login')}
                style={{ borderRadius: '16px', background: 'transparent' }}
              >
                INICIAR SESIÓN
              </Button>
            </div>
          </section>
        </main>
      </div>

      <style>{`
        .eb-presentation {
          --eb-background: #F8FAFB;
          --eb-foreground: #1A202C;
          --eb-card: #FFFFFF;
          --eb-muted: #E2E8F0;
          --eb-muted-foreground: #6C738E;
          --eb-border: #E2E8F0;
          position: fixed;
          inset: 0;
          z-index: 10;
          width: 100%;
          min-height: 100svh;
          container-type: inline-size;
          overflow: auto;
          color: var(--eb-foreground);
          background: var(--eb-background);
        }

        :root[data-theme='dark'] .eb-presentation {
          --eb-background: #0F172A;
          --eb-foreground: #F8FAFC;
          --eb-card: #1E293B;
          --eb-muted: #334155;
          --eb-muted-foreground: #94A3B8;
          --eb-border: #334155;
        }

        .eb-presentation__shell {
          width: min(100%, 1600px);
          min-height: 100svh;
          margin: 0 auto;
          padding: 18px clamp(18px, 2.6vw, 42px) 32px;
          display: flex;
          flex-direction: column;
        }

        .eb-presentation__header {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          animation: eb-presentation-fade .4s ease-out both;
        }

        .eb-presentation__header img {
          width: 42px;
          height: 42px;
          object-fit: contain;
        }

        .eb-presentation__header span {
          font-size: 20px;
          font-weight: 800;
          color: #13A8A2;
        }

        .eb-presentation__main {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(360px, 470px);
          align-items: center;
          gap: clamp(48px, 7vw, 112px);
          padding: 28px 0 46px;
        }

        .eb-presentation__intro {
          display: grid;
          grid-template-columns: minmax(240px, 280px) minmax(340px, 600px);
          align-items: center;
          gap: clamp(30px, 3vw, 52px);
          min-width: 0;
        }

        .eb-presentation__visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          animation: eb-presentation-enter .55s .1s ease-out both;
        }

        .eb-presentation__visual img {
          position: relative;
          z-index: 1;
          width: min(100%, 500px);
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 24px 32px rgba(4, 53, 68, 0.16));
          animation: eb-presentation-float 4s .8s ease-in-out infinite;
        }

        .eb-presentation__halo {
          display: none;
        }

        .eb-presentation__copy {
          animation: eb-presentation-enter .55s .18s ease-out both;
        }

        .eb-presentation__hello {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .eb-presentation__hello h1 {
          margin: 0;
          font-size: clamp(42px, 5vw, 64px);
          line-height: 1;
          letter-spacing: -1.8px;
        }

        .eb-presentation__hello img {
          display: none;
          width: 58px;
          height: 58px;
          object-fit: contain;
        }

        .eb-presentation__lead {
          max-width: 560px;
          margin: 0 0 16px;
          font-size: clamp(20px, 2vw, 26px);
          line-height: 1.35;
        }

        .eb-presentation__description {
          max-width: 590px;
          margin: 0;
          color: var(--eb-muted-foreground);
          font-size: clamp(16px, 1.5vw, 19px);
          line-height: 1.65;
        }

        .eb-presentation__actions {
          width: 100%;
          padding: 0;
          animation: eb-presentation-enter .55s .28s ease-out both;
        }

        .eb-presentation__separator {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 17px 0;
          color: var(--eb-muted-foreground);
        }

        .eb-presentation__separator span {
          flex: 1;
          height: 1px;
          background: var(--eb-border);
        }

        .eb-presentation__separator small {
          font-size: 12px;
          white-space: nowrap;
        }

        .eb-presentation__google {
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
        }

        .eb-google-auth {
          position: relative;
          width: 100%;
          height: 52px;
          overflow: hidden;
          border: 2px solid var(--eb-border);
          border-radius: 16px;
          background: var(--eb-card);
          transition: border-color var(--transition), background-color var(--transition), transform var(--transition);
        }

        .eb-google-auth:hover {
          border-color: #13A8A2;
          background: var(--eb-muted);
        }

        .eb-google-auth:active {
          transform: scale(.985);
        }

        .eb-google-auth__visual {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--eb-foreground);
          font-size: 14px;
          font-weight: 600;
        }

        .eb-google-auth__visual svg {
          width: 20px;
          height: 20px;
          flex: 0 0 auto;
        }

        .eb-google-auth__official {
          position: absolute;
          inset: 0;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: .001;
          overflow: hidden;
        }

        .eb-google-auth__official > div {
          transform: scale(1.18);
        }

        .eb-presentation__google p,
        .eb-presentation__status,
        .eb-presentation__error {
          margin: 8px 0 0;
          text-align: center;
          font-size: 12px;
        }

        .eb-presentation__google p,
        .eb-presentation__error {
          color: var(--color-error);
        }

        .eb-presentation__status,
        .eb-presentation__login p {
          color: var(--eb-muted-foreground);
        }

        .eb-presentation__login {
          padding-top: 20px;
          text-align: center;
        }

        .eb-presentation__login p {
          margin: 0 0 10px;
          font-size: 13px;
        }

        @keyframes eb-presentation-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes eb-presentation-enter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes eb-presentation-float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }

        @container (max-width: 1040px) {
          .eb-presentation__main {
            grid-template-columns: minmax(0, 1fr) minmax(290px, 370px);
            gap: 36px;
          }

          .eb-presentation__intro {
            grid-template-columns: 180px minmax(240px, 1fr);
            gap: 24px;
          }

          .eb-presentation__visual {
            min-height: 260px;
          }
        }

        @container (max-width: 780px) {
          .eb-presentation__shell {
            padding: 14px 24px 26px;
          }

          .eb-presentation__main {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 28px;
            padding: 20px 0 0;
          }

          .eb-presentation__intro {
            display: block;
          }

          .eb-presentation__visual {
            display: none;
          }

          .eb-presentation__hello img {
            display: block;
            animation: eb-presentation-float 3.4s ease-in-out infinite;
          }

          .eb-presentation__copy {
            padding: 24px 0 4px;
          }

          .eb-presentation__hello h1 {
            font-size: 42px;
          }

          .eb-presentation__lead {
            font-size: 20px;
          }

          .eb-presentation__description {
            font-size: 16px;
          }

          .eb-presentation__actions {
            margin-top: auto;
            padding: 0;
            border: 0;
            background: transparent;
            box-shadow: none;
          }
        }

        @container (max-width: 420px) {
          .eb-presentation__shell {
            padding-inline: 20px;
          }

          .eb-presentation__header img {
            width: 38px;
            height: 38px;
          }

          .eb-presentation__header span {
            font-size: 18px;
          }

          .eb-presentation__copy {
            padding-top: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .eb-presentation__header,
          .eb-presentation__visual,
          .eb-presentation__visual img,
          .eb-presentation__copy,
          .eb-presentation__actions,
          .eb-presentation__hello img {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
