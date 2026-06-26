import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { Drawer } from '../components/layout/Drawer'
import { StatCard } from '../components/dashboard/StatCard'
import { Avatar } from '../components/ui/Avatar'

const BRAND_PRIMARY = '#13A8A2'
const BRAND_SECONDARY = '#2563EB'
const TEXT_PRIMARY = '#111827'
const TEXT_SECONDARY = '#6C738E'
const BORDER = '#E5E7EB'
const SURFACE = '#FFFFFF'

const rubroLabels: Record<string, string> = {
  gastronomia: 'Gastronomia',
  peluqueria: 'Peluqueria',
  indumentaria: 'Indumentaria',
  tecnologia: 'Tecnologia',
  servicios: 'Servicios',
  salud: 'Salud',
  educacion: 'Educacion',
  otro: 'Negocio',
}

type AppIconName = 'menu' | 'bell' | 'business' | 'chat' | 'budget' | 'automation' | 'alert' | 'catalog' | 'faq' | 'settings'

function AppIcon({ name, size = 22, strokeWidth = 2 }: { name: AppIconName; size?: number; strokeWidth?: number }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth,
  }

  const paths: Record<AppIconName, ReactNode> = {
    menu: (
      <>
        <path {...common} d="M4 7h16" />
        <path {...common} d="M4 12h16" />
        <path {...common} d="M4 17h16" />
      </>
    ),
    bell: (
      <>
        <path {...common} d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path {...common} d="M10 21h4" />
      </>
    ),
    business: (
      <>
        <path {...common} d="M4 21V7l8-4 8 4v14" />
        <path {...common} d="M9 21v-7h6v7" />
        <path {...common} d="M8 9h.01" />
        <path {...common} d="M12 9h.01" />
        <path {...common} d="M16 9h.01" />
      </>
    ),
    chat: (
      <>
        <path {...common} d="M5 6h14v10H9l-4 4z" />
        <path {...common} d="M9 10h6" />
        <path {...common} d="M9 13h4" />
      </>
    ),
    budget: (
      <>
        <path {...common} d="M7 3h8l4 4v14H7z" />
        <path {...common} d="M15 3v5h5" />
        <path {...common} d="M12 17v-6" />
        <path {...common} d="M14.5 12.5A2.5 2.5 0 0 0 12 11a2 2 0 0 0 0 4 2 2 0 0 1 0 4 2.5 2.5 0 0 1-2.5-1.5" />
      </>
    ),
    automation: (
      <>
        <rect {...common} x="6" y="8" width="12" height="9" rx="3" />
        <path {...common} d="M9 8V6a3 3 0 0 1 6 0v2" />
        <path {...common} d="M9.5 12h.01" />
        <path {...common} d="M14.5 12h.01" />
        <path {...common} d="M10 15h4" />
        <path {...common} d="M4 12h2" />
        <path {...common} d="M18 12h2" />
      </>
    ),
    alert: (
      <>
        <circle {...common} cx="12" cy="12" r="9" />
        <path {...common} d="M12 7v6" />
        <path {...common} d="M12 17h.01" />
      </>
    ),
    catalog: (
      <>
        <path {...common} d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
        <path {...common} d="m4 7.5 8 4.5 8-4.5" />
        <path {...common} d="M12 12v9" />
      </>
    ),
    faq: (
      <>
        <circle {...common} cx="12" cy="12" r="9" />
        <path {...common} d="M9.5 9a2.8 2.8 0 0 1 5 1.7c0 2.1-2.5 2.3-2.5 4" />
        <path {...common} d="M12 18h.01" />
      </>
    ),
    settings: (
      <>
        <path {...common} d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
        <path {...common} d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 0 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1" />
      </>
    ),
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function IconWrapper({ children, color = BRAND_PRIMARY }: { children: ReactNode; color?: string }) {
  return (
    <span style={{
      color,
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {children}
    </span>
  )
}

function QuickAccessCard({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 118,
        padding: '18px 10px',
        borderRadius: '12px',
        border: `1px solid ${BORDER}`,
        background: SURFACE,
        boxShadow: '0 3px 8px rgba(17, 24, 39, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: TEXT_PRIMARY,
        fontWeight: 700,
        fontSize: '12px',
      }}
    >
      <span style={{
        width: 42,
        height: 42,
        borderRadius: '11px',
        background: '#EEF2F7',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </span>
      {label}
    </button>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { business, stats, loadBusiness } = useBusiness()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (user) loadBusiness(user.id)
  }, [user, loadBusiness])

  if (!user) {
    navigate('/login')
    return null
  }

  const firstName = user.nombre.split(' ')[0]
  const businessName = business?.nombre ?? 'Tu negocio'
  const selectedRubro = business?.rubro || user.rubro
  const businessType = selectedRubro ? rubroLabels[selectedRubro] ?? selectedRubro : 'Rubro no configurado'

  const metrics = [
    {
      label: 'Consultas recibidas',
      value: stats.consultasPendientes,
      description: 'Requieren seguimiento',
      color: BRAND_PRIMARY,
      icon: <IconWrapper color="#FFFFFF"><AppIcon name="chat" size={21} /></IconWrapper>,
      tone: 'primary' as const,
    },
    {
      label: 'Presupuestos generados',
      value: stats.presupuestosPendientes,
      description: 'Pedidos comerciales activos',
      color: '#7C3AED',
      icon: <IconWrapper color="#FFFFFF"><AppIcon name="budget" size={21} /></IconWrapper>,
      tone: 'secondary' as const,
    },
    {
      label: 'Automatizacion',
      value: `${stats.porcentajeAutomatizacion}%`,
      description: 'Respuestas gestionadas por el bot',
      color: '#16C784',
      icon: <IconWrapper color="#FFFFFF"><AppIcon name="automation" size={21} /></IconWrapper>,
      tone: 'success' as const,
    },
    {
      label: 'Conversaciones abandonadas',
      value: 0,
      description: 'Sin respuesta final',
      color: '#FF4B1F',
      icon: <IconWrapper color="#FFFFFF"><AppIcon name="alert" size={21} /></IconWrapper>,
      tone: 'danger' as const,
    },
  ]

  return (
    <>
      <Drawer
        business={business}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem="dashboard"
      />

      <div style={{
        flex: 1,
        minHeight: '100svh',
        background: SURFACE,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <header style={{
          height: 56,
          padding: '12px 20px 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: SURFACE,
        }}>
          <button
            type="button"
            aria-label="Abrir navegacion"
            onClick={() => setDrawerOpen(true)}
            style={{
              width: 32,
              height: 32,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: TEXT_PRIMARY,
              background: 'transparent',
            }}
          >
            <AppIcon name="menu" size={21} strokeWidth={2.2} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span aria-hidden="true" style={{ color: TEXT_PRIMARY, lineHeight: 1, display: 'inline-flex' }}>
              <AppIcon name="bell" size={21} />
            </span>
            <Avatar name={user.nombre} size={32} bgColor={`linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_SECONDARY} 100%)`} />
          </div>
        </header>

        <main style={{
          flex: 1,
          padding: '18px 20px 22px',
          overflowY: 'auto',
        }}>
          <section style={{ marginBottom: '18px' }}>
            <h1 style={{
              color: TEXT_PRIMARY,
              fontSize: '22px',
              lineHeight: 1.15,
              fontWeight: 800,
              marginBottom: '10px',
            }}>
              Hola, {firstName}
            </h1>
            <p style={{ color: TEXT_PRIMARY, fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>
              {businessName}
            </p>
            <p style={{ color: TEXT_PRIMARY, fontSize: '11px', lineHeight: 1.2 }}>
              {businessType}{' '}
              <span style={{ color: TEXT_SECONDARY, display: 'inline-flex', verticalAlign: '-3px' }}>
                <AppIcon name="business" size={13} strokeWidth={1.8} />
              </span>
            </p>
          </section>

          <section style={{ display: 'grid', gap: '12px', marginBottom: '22px' }}>
            {metrics.map(metric => (
              <StatCard key={metric.label} {...metric} />
            ))}
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h2 style={{ color: TEXT_PRIMARY, fontSize: '15px', fontWeight: 800, marginBottom: '10px' }}>
              Accesos rapidos
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
              <QuickAccessCard
                label="Catalogo"
                icon={<IconWrapper color={BRAND_PRIMARY}><AppIcon name="catalog" /></IconWrapper>}
                onClick={() => navigate('/configurar')}
              />
              <QuickAccessCard
                label="FAQ"
                icon={<IconWrapper color={BRAND_SECONDARY}><AppIcon name="faq" /></IconWrapper>}
                onClick={() => navigate('/faq')}
              />
              <QuickAccessCard
                label="Consultas"
                icon={<IconWrapper color={BRAND_PRIMARY}><AppIcon name="chat" /></IconWrapper>}
                onClick={() => navigate('/consultas')}
              />
              <QuickAccessCard
                label="Configuracion"
                icon={<IconWrapper color="#FF5B1F"><AppIcon name="settings" /></IconWrapper>}
                onClick={() => navigate('/configurar')}
              />
            </div>
          </section>

          <section>
            <h2 style={{ color: TEXT_PRIMARY, fontSize: '15px', fontWeight: 800, marginBottom: '10px' }}>
              Actividad reciente
            </h2>
            <div style={{
              minHeight: 158,
              padding: '24px 18px',
              borderRadius: '12px',
              border: `1px solid ${BORDER}`,
              background: SURFACE,
              boxShadow: '0 3px 8px rgba(17, 24, 39, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}>
              <span style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'rgba(19, 168, 162, 0.10)',
                color: BRAND_PRIMARY,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <AppIcon name="chat" size={25} />
              </span>
              <p style={{ color: TEXT_SECONDARY, fontSize: '13px', lineHeight: 1.45, maxWidth: 250 }}>
                Las actividades de tus clientes apareceran aqui cuando comiencen a usar el chatbot.
              </p>
            </div>
          </section>
        </main>

        <button
          type="button"
          aria-label="Abrir asistente"
          onClick={() => business && navigate(`/${business.slug}`)}
          style={{
            position: 'fixed',
            right: 'calc(50% - 220px)',
            bottom: 72,
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: `2px solid ${BRAND_PRIMARY}`,
            background: SURFACE,
            boxShadow: '0 8px 20px rgba(17, 24, 39, 0.16)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 3,
          }}
        >
          <img src="/isoBot.png" alt="" aria-hidden="true" style={{ width: 32, height: 32, objectFit: 'contain' }} />
        </button>
      </div>
    </>
  )
}
