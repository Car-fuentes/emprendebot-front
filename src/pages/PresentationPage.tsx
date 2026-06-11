import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function PresentationPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100svh',
    }}>
      {/* Hero section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px 32px',
        background: 'var(--color-bg)',//'linear-gradient(180deg, #13ABA2 0%, #0a7a74 60%, var(--color-bg) 100%)',
        textAlign: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: 240, height: 240,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}>
          <img src="/imagoBot.png" alt="EmprendeBot" style={{ width: 200, height: 200 }} />
        </div>

        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            //color: '#fff',
            margin: 0,
            lineHeight: 1.2,
          }}>
            Hola 👋
          </h1>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            //color: '#fff',
            margin: '4px 0 0',
          }}>
            Soy EmprendeBot
          </h2>
        </div>

        <p style={{
          fontSize: '15px',
          //color: 'rgba(255,255,255,0.85)',
          lineHeight: 1.6,
          maxWidth: '280px',
        }}>
          Tu asistente de gestión comercial. </p>
          <p>Te ayudaré a responder consultas, generar presupuestos y mantener tus oportunidades de venta para tu negocio.</p>
        
      </div>

      {/* CTA section */}
      <div style={{
        padding: '32px 24px 40px',
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
        >
          CREAR CUENTA
        </Button>

        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
        }}>
          ¿Ya tenés una cuenta?
        </p>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => navigate('/login')}
        >
          INICIAR SESIÓN
        </Button>
      </div>
    </div>
  )
}
