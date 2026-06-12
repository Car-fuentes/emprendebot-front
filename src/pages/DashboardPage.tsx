import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { Drawer } from '../components/layout/Drawer'
import { StatCard } from '../components/dashboard/StatCard'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'

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

  const STAT_CARDS = [
    {
      label: 'Esperan respuesta',
      value: stats.consultasPendientes,
      description: 'Consultas que necesitan tu atención',
      color: '#ef4444',
      icon: '💬',
    },
    {
      label: 'Presupuestos pendientes',
      value: stats.presupuestosPendientes,
      description: 'Clientes que esperan tu respuesta',
      color: '#f59e0b',
      icon: '📋',
    },
    {
      label: 'Consultas resueltas',
      value: stats.consultasResueltas,
      description: 'Ya fueron atendidas y finalizadas',
      color: '#22c55e',
      icon: '✅',
    },
    {
      label: 'Automatización',
      value: `${stats.porcentajeAutomatizacion}%`,
      description: 'De las consultas fueron automáticas',
      color: 'var(--color-primary)',
      icon: '🤖',
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
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-subtle)',
        minHeight: '100svh',
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '22px', padding: '4px',
            }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-primary)' }}>
            EmprendeBot
          </span>
          <Avatar name={user.nombre} size={36} />
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {/* Greeting */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
              Hola, {firstName}
            </h1>
            {business ? (
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>{business.nombre}</strong>
                {business.descripcion ? ` · ${business.descripcion}` : ''}
              </p>
            ) : (
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                Todavía no configuraste tu negocio.
              </p>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {STAT_CARDS.map(card => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {/* Link público */}
          {business && (
            <div style={{
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                🔗 Tu link público:
              </p>
              <p style={{
                fontSize: '13px',
                color: 'var(--color-primary)',
                fontWeight: 600,
                wordBreak: 'break-all',
                marginBottom: '12px',
              }}>
                emprendebot/{business.slug}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/${business.slug}`)}
              >
                Ver mi chatbot
              </Button>
            </div>
          )}

          {/* Config button */}
          <Button
            variant="ghost"
            fullWidth
            onClick={() => navigate('/configurar')}
            style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}
          >
            ⚙️ Editar mi negocio
          </Button>
        </div>
      </div>
    </>
  )
}

