import { useEffect, useState } from 'react'
import { Drawer } from '../components/layout/Drawer'
import { Avatar } from '../components/ui/Avatar'
import { ConsultaCard } from '../components/consultas/ConsultaCard'
import { ConsultaDetail } from '../components/consultas/ConsultaDetail'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import {
  useConsultas,
  type ConsultaCanalFilter,
  type ConsultaEstadoFilter,
  type ConsultaSortOption,
} from '../hooks/useConsultas'

const ESTADO_OPTIONS: Array<{ value: ConsultaEstadoFilter; label: string }> = [
  { value: 'todas', label: 'Todas' },
  { value: 'pendiente', label: 'Nuevas' },
  { value: 'atendida', label: 'En proceso' },
  { value: 'cerrada', label: 'Cerradas' },
]

const CANAL_OPTIONS: Array<{ value: ConsultaCanalFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'web', label: 'Web' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

const SORT_OPTIONS: Array<{ value: ConsultaSortOption; label: string }> = [
  { value: 'recentes', label: 'Mas recientes' },
  { value: 'antiguas', label: 'Mas antiguas' },
]

const fieldStyle: React.CSSProperties = {
  width: '100%',
  height: '42px',
  padding: '0 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-bg)',
  color: 'var(--color-text-primary)',
  fontSize: '13px',
  fontFamily: 'var(--font-family)',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
}

export function ConsultasPage() {
  const { user } = useAuth()
  const { business, loadBusiness } = useBusiness()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const {
    consultas,
    filteredConsultas,
    selectedConsulta,
    selectedConsultaId,
    estadoFilter,
    canalFilter,
    sortOption,
    searchQuery,
    isLoading,
    setEstadoFilter,
    setCanalFilter,
    setSortOption,
    setSearchQuery,
    selectConsulta,
    clearSelection,
    closeConsulta,
  } = useConsultas(user?.id)

  useEffect(() => {
    if (user) loadBusiness(user.id)
  }, [loadBusiness, user])

  if (!user) return null

  const showingDetail = Boolean(selectedConsultaId && selectedConsulta)

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

          {!showingDetail && (
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '16px',
              }}
              aria-label="Filtros de consultas"
            >
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={labelStyle}>Buscar</span>
                <input
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder="Buscar cliente o mensaje..."
                  style={fieldStyle}
                />
              </label>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: '10px',
              }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={labelStyle}>Estado</span>
                  <select
                    value={estadoFilter}
                    onChange={event => setEstadoFilter(event.target.value as ConsultaEstadoFilter)}
                    style={fieldStyle}
                  >
                    {ESTADO_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={labelStyle}>Canal</span>
                  <select
                    value={canalFilter}
                    onChange={event => setCanalFilter(event.target.value as ConsultaCanalFilter)}
                    style={fieldStyle}
                  >
                    {CANAL_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={labelStyle}>Orden</span>
                  <select
                    value={sortOption}
                    onChange={event => setSortOption(event.target.value as ConsultaSortOption)}
                    style={fieldStyle}
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
          )}

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
            <>
              {showingDetail ? (
                <ConsultaDetail
                  consulta={selectedConsulta}
                  onCloseConsulta={closeConsulta}
                  onBack={clearSelection}
                />
              ) : (
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
                      No hay consultas que coincidan con estos filtros.
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
              )}
            </>
          )}
        </main>
      </div>
    </>
  )
}
