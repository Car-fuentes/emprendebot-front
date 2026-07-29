import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConsultaCard } from '../components/consultas/ConsultaCard'
import { ConsultaDetail } from '../components/consultas/ConsultaDetail'
import { Drawer } from '../components/layout/Drawer'
import { AppIcon } from '../components/ui/AppIcon'
import { Avatar } from '../components/ui/Avatar'
import { PageBackButton } from '../components/navigation/PageBackButton'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import {
  useConsultas,
  type ConsultaCanalFilter,
  type ConsultaDerivadaFilter,
  type ConsultaEstadoFilter,
  type ConsultaSortOption,
} from '../hooks/useConsultas'
import '../styles/consultas.css'

const ESTADO_OPTIONS: Array<{ value: ConsultaEstadoFilter; label: string }> = [
  { value: 'todas', label: 'Todas' },
  { value: 'nueva', label: 'Nuevas' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelta', label: 'Resueltas' },
  { value: 'cerrada', label: 'Cerradas' },
  { value: 'resuelta_por_bot', label: 'Resueltas por el bot' },
]

const DERIVADA_OPTIONS: Array<{ value: ConsultaDerivadaFilter; label: string }> = [
  { value: 'todas', label: 'Todas las consultas' },
  { value: 'derivadas', label: 'Todas las derivadas' },
  { value: 'atencion_personalizada', label: 'Atención personalizada' },
  { value: 'cotizaciones', label: 'Cotizaciones' },
]

const CANAL_OPTIONS: Array<{ value: ConsultaCanalFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'web', label: 'Web' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

const SORT_OPTIONS: Array<{ value: ConsultaSortOption; label: string }> = [
  { value: 'recentes', label: 'Más recientes' },
  { value: 'antiguas', label: 'Más antiguas' },
]

export function ConsultasPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { business, loadBusiness } = useBusiness()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [demoStarted, setDemoStarted] = useState(false)
  const {
    consultas,
    filteredConsultas,
    selectedConsulta,
    selectedConsultaId,
    resolutionByConsultaId,
    estadoFilter,
    canalFilter,
    derivadaFilter,
    sortOption,
    searchQuery,
    isLoading,
    error,
    updateError,
    updatingConsultaId,
    isShowingDemo,
    setEstadoFilter,
    setCanalFilter,
    setDerivadaFilter,
    setSortOption,
    setSearchQuery,
    selectConsulta,
    clearSelection,
    updateConsultaStatus,
    reloadConsultas,
  } = useConsultas(user?.id, business?.slug)

  useEffect(() => {
    if (user) void loadBusiness(user.id)
  }, [loadBusiness, user])

  if (!user) return null

  const showingDetail = Boolean(selectedConsultaId && selectedConsulta)
  const showingDemoIntro = !isLoading && !error && isShowingDemo && !demoStarted
  const hasActiveFilters = searchQuery.trim() !== '' || estadoFilter !== 'todas' || canalFilter !== 'todos' || derivadaFilter !== 'todas' || sortOption !== 'recentes'

  const handleBack = () => {
    if (showingDetail) return clearSelection()
    if (isShowingDemo && demoStarted) return setDemoStarted(false)
    navigate('/dashboard')
  }

  const clearFilters = () => {
    setSearchQuery('')
    setEstadoFilter('todas')
    setCanalFilter('todos')
    setDerivadaFilter('todas')
    setSortOption('recentes')
  }

  return (
    <div className="consultas-page">
      <Drawer
        business={business}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem="consultas"
        desktopPersistent
        showBusinessAvatar
      />

      <div className="consultas-shell">
        <header className="consultas-mobile-header">
          <button type="button" aria-label="Abrir navegación" onClick={() => setDrawerOpen(true)}>
            <AppIcon name="menu" size={22} />
          </button>
          <strong>Consultas</strong>
          <Avatar name={user.nombre} src={business?.logo} size={38} />
        </header>

        <main className="consultas-main">
          <PageBackButton onClick={handleBack} />

          {!showingDetail && (
            <section className="consultas-heading">
              <span>Conversaciones</span>
              <h1>Consultas</h1>
              <p>Gestioná las conversaciones con tus clientes.</p>
              {!isLoading && !error && consultas.length > 0 && (
                <strong>{consultas.length} {consultas.length === 1 ? 'consulta recibida' : 'consultas recibidas'}</strong>
              )}
            </section>
          )}

          {isLoading ? (
            <section className="consultas-skeleton" aria-label="Cargando consultas" aria-busy="true">
              <div className="consultas-skeleton__toolbar" />
              {[1, 2, 3].map(item => <div className="consultas-skeleton__card" key={item} />)}
            </section>
          ) : error ? (
            <section className="consultas-state consultas-state--error" role="alert">
              <span className="consultas-state__icon"><AppIcon name="alert" size={36} /></span>
              <h2>No pudimos cargar las consultas</h2>
              <p>Revisá tu conexión o intentá nuevamente.</p>
              <button type="button" onClick={() => void reloadConsultas()}>Reintentar</button>
            </section>
          ) : showingDemoIntro ? (
            <section className="consultas-state">
              <span className="consultas-state__icon"><AppIcon name="chat" size={40} /></span>
              <h2>Todavía no recibiste consultas</h2>
              <p>Cuando un cliente inicie una conversación desde tu chatbot, la consulta aparecerá acá automáticamente.</p>
              <button type="button" onClick={() => setDemoStarted(true)}>Ver demostración</button>
              <small>La demostración contiene datos de ejemplo.</small>
            </section>
          ) : showingDetail ? (
            <ConsultaDetail
              consulta={selectedConsulta}
              resolution={selectedConsulta ? resolutionByConsultaId.get(selectedConsulta.id) : undefined}
              onUpdateStatus={updateConsultaStatus}
              onBack={clearSelection}
              isUpdating={updatingConsultaId === selectedConsulta?.id}
              updateError={updateError}
            />
          ) : (
            <>
              <section className="consultas-toolbar" aria-label="Filtros de consultas">
                <label className="consultas-search">
                  <span className="sr-only">Buscar consultas</span>
                  <AppIcon name="search" size={18} />
                  <input
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    placeholder="Buscar cliente o mensaje..."
                  />
                </label>
                <label className="consultas-filter">
                  <span>Tipo</span>
                  <select value={derivadaFilter} onChange={event => setDerivadaFilter(event.target.value as ConsultaDerivadaFilter)}>
                    {DERIVADA_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="consultas-filter">
                  <span>Estado</span>
                  <select value={estadoFilter} onChange={event => setEstadoFilter(event.target.value as ConsultaEstadoFilter)}>
                    {ESTADO_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="consultas-filter">
                  <span>Canal</span>
                  <select value={canalFilter} onChange={event => setCanalFilter(event.target.value as ConsultaCanalFilter)}>
                    {CANAL_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="consultas-filter">
                  <span>Orden</span>
                  <select value={sortOption} onChange={event => setSortOption(event.target.value as ConsultaSortOption)}>
                    {SORT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </section>

              {isShowingDemo && (
                <aside className="consultas-demo" aria-label="Consultas de ejemplo">
                  <AppIcon name="alert" size={19} />
                  <div><strong>Estas son consultas de ejemplo</strong><p>Podés explorarlas para conocer la sección. Se reemplazarán cuando recibas consultas reales.</p></div>
                </aside>
              )}

              {consultas.length === 0 ? (
                <section className="consultas-state">
                  <span className="consultas-state__icon"><AppIcon name="chat" size={40} /></span>
                  <h2>Todavía no recibiste consultas</h2>
                  <p>Cuando un cliente inicie una conversación desde tu chatbot, aparecerá acá automáticamente.</p>
                </section>
              ) : filteredConsultas.length === 0 ? (
                <section className="consultas-state consultas-state--compact">
                  <span className="consultas-state__icon"><AppIcon name="search" size={34} /></span>
                  <h2>No encontramos consultas con estos filtros</h2>
                  <p>Probá con otra búsqueda o restablecé los filtros.</p>
                  {hasActiveFilters && <button type="button" onClick={clearFilters}>Limpiar filtros</button>}
                </section>
              ) : (
                <section className="consultas-list" aria-label="Listado de consultas">
                  {filteredConsultas.map(consulta => (
                    <ConsultaCard
                      key={consulta.id}
                      consulta={consulta}
                      resolution={resolutionByConsultaId.get(consulta.id)}
                      selected={selectedConsultaId === consulta.id}
                      onSelect={selectConsulta}
                    />
                  ))}
                </section>
              )}
            </>
          )}
        </main>

        <button
          type="button"
          className="consultas-bot"
          disabled={!business?.slug}
          aria-label="Abrir asistente: Probá tu chat"
          onClick={() => business?.slug && navigate(`/${business.slug}`)}
        >
          <span className="consultas-bot__label"><i aria-hidden="true" />Probá tu chat</span>
          <span className="consultas-bot__avatar" aria-hidden="true"><img src="/isoBot-transparente.png" alt="" /></span>
        </button>
      </div>
    </div>
  )
}
