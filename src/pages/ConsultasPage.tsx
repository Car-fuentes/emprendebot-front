import { useEffect, useState } from 'react'
import { Drawer } from '../components/layout/Drawer'
import { Avatar } from '../components/ui/Avatar'
import { Chip } from '../components/ui/Chip'
import { ConsultaCard } from '../components/consultas/ConsultaCard'
import { ConsultaDetail } from '../components/consultas/ConsultaDetail'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { useConsultas, type ConsultaFilter } from '../hooks/useConsultas'

const FILTERS: Array<{ value: ConsultaFilter; label: string }> = [
  { value: 'todas', label: 'Todas' },
  { value: 'nueva', label: 'Nuevas' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'respondida', label: 'Respondidas' },
  { value: 'derivada', label: 'Derivadas' },
  { value: 'cerrada', label: 'Cerradas' },
]

export function ConsultasPage() {
  const { user } = useAuth()
  const { business, loadBusiness } = useBusiness()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const {
    consultas,
    filteredConsultas,
    selectedConsulta,
    selectedConsultaId,
    filter,
    isLoading,
    setFilter,
    selectConsulta,
    closeConsulta,
  } = useConsultas(user?.id)

  useEffect(() => {
    if (user) loadBusiness(user.id)
  }, [loadBusiness, user])

  if (!user) return null

  return (
    <>
      <Drawer
        business={business}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem="consultas"
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100svh',
        background: 'var(--color-bg-subtle)',
      }}>
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
            type="button"
            aria-label="Abrir navegacion"
            onClick={() => setDrawerOpen(true)}
            style={{ background: 'none', border: 'none', fontSize: '22px', padding: '4px', cursor: 'pointer' }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-primary)' }}>
            EmprendeBot
          </span>
          <Avatar name={user.nombre} size={36} />
        </header>

        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '18px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
              Consultas
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              Historial basico de conversaciones e interacciones recibidas.
            </p>
          </div>

          <section style={{ marginBottom: '16px' }} aria-label="Filtros de consultas">
            <div style={{
              display: 'flex',
              gap: '7px',
              overflowX: 'auto',
              paddingBottom: '8px',
            }}>
              {FILTERS.map(item => (
                <Chip
                  key={item.value}
                  selected={filter === item.value}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </Chip>
              ))}
            </div>
          </section>

          {isLoading ? (
            <section style={{
              padding: '28px 20px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
            }}>
              Cargando consultas...
            </section>
          ) : consultas.length === 0 ? (
            <section style={{
              padding: '32px 20px',
              textAlign: 'center',
              background: 'var(--color-bg)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ fontSize: '34px', marginBottom: '10px' }}>💬</div>
              <h2 style={{ fontSize: '17px', marginBottom: '6px' }}>Todavia no hay consultas</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                Cuando lleguen conversaciones del chat, van a aparecer aca.
              </p>
            </section>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gap: '14px',
              alignItems: 'start',
            }}>
              <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredConsultas.length === 0 ? (
                  <div style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                    fontSize: '13px',
                    background: 'var(--color-bg)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    No hay consultas que coincidan con este filtro.
                  </div>
                ) : (
                  filteredConsultas.map(consulta => (
                    <ConsultaCard
                      key={consulta.id}
                      consulta={consulta}
                      selected={selectedConsultaId === consulta.id}
                      onSelect={selectConsulta}
                    />
                  ))
                )}
              </section>

              <ConsultaDetail consulta={selectedConsulta} onCloseConsulta={closeConsulta} />
            </div>
          )}
        </main>
      </div>
    </>
  )
}

