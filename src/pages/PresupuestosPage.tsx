import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer } from '../components/layout/Drawer'
import { PageBackButton } from '../components/navigation/PageBackButton'
import { PresupuestoStatusBadge } from '../components/presupuestos/PresupuestoStatusBadge'
import { AppIcon } from '../components/ui/AppIcon'
import { Avatar } from '../components/ui/Avatar'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { ApiError } from '../services/apiClient'
import { getPresupuestos } from '../services/presupuestoApi'
import type {
  PresupuestoEstado,
  PresupuestoResumen,
  PresupuestosPagination,
} from '../types/presupuesto'
import '../styles/presupuestos.css'

const PAGE_SIZE = 10

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(value))

const errorMessage = (error: unknown) => {
  if (error instanceof ApiError && error.status === 401) return 'Tu sesión venció. Iniciá sesión nuevamente.'
  if (error instanceof ApiError && error.status === 403) return 'No tenés permisos para ver presupuestos.'
  return 'No pudimos cargar los presupuestos. Intentá nuevamente.'
}

export function PresupuestosPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { business, loadBusiness } = useBusiness()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [presupuestos, setPresupuestos] = useState<PresupuestoResumen[]>([])
  const [pagination, setPagination] = useState<PresupuestosPagination>({
    page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0,
  })
  const [estado, setEstado] = useState<PresupuestoEstado | ''>('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) void loadBusiness(user.id)
  }, [loadBusiness, user])

  const loadBudgets = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getPresupuestos({
        page,
        limit: PAGE_SIZE,
        ...(estado ? { estado } : {}),
      })
      setPresupuestos(response.presupuestos)
      setPagination(response.paginacion)
    } catch (loadError) {
      setError(errorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [estado, page])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadBudgets(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadBudgets])

  if (!user) return null

  return (
    <div className="budgets-page">
      <Drawer
        business={business}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem="presupuestos"
        desktopPersistent
        showBusinessAvatar
      />

      <div className="budgets-shell">
        <header className="budgets-mobile-header">
          <button type="button" aria-label="Abrir navegación" onClick={() => setDrawerOpen(true)}>
            <AppIcon name="menu" size={22} />
          </button>
          <strong>Presupuestos</strong>
          <Avatar name={user.nombre} src={business?.logo} size={38} />
        </header>

        <main className="budgets-main">
          <PageBackButton onClick={() => navigate('/dashboard')} />

          <section className="budgets-heading">
            <div>
              <span>Propuestas comerciales</span>
              <h1>Presupuestos</h1>
              <p>Gestioná las cotizaciones solicitadas por tus clientes.</p>
            </div>
            <label className="budgets-filter">
              <span>Estado</span>
              <select
                value={estado}
                onChange={(event) => {
                  setEstado(event.target.value as PresupuestoEstado | '')
                  setPage(1)
                }}
              >
                <option value="">Todos</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="EN_PROCESO">En proceso</option>
                <option value="ENVIADO">Enviados</option>
                <option value="CONCRETADO">Concretados</option>
                <option value="RECHAZADO">Rechazados</option>
              </select>
            </label>
          </section>

          {isLoading ? (
            <section className="budgets-loading" aria-label="Cargando presupuestos" aria-busy="true">
              {[1, 2, 3].map(item => <div key={item} />)}
            </section>
          ) : error ? (
            <section className="budgets-state budgets-state--error" role="alert">
              <span><AppIcon name="alert" size={38} /></span>
              <h2>No pudimos cargar los presupuestos</h2>
              <p>{error}</p>
              <button type="button" onClick={() => void loadBudgets()}>Reintentar</button>
            </section>
          ) : presupuestos.length === 0 ? (
            <section className="budgets-state">
              <span><AppIcon name="budget" size={42} /></span>
              <h2>{estado ? 'No hay presupuestos con este estado' : 'Todavía no tenés presupuestos'}</h2>
              <p>
                {estado
                  ? 'Probá seleccionando otro estado para ampliar los resultados.'
                  : 'Cuando un cliente solicite una cotización desde tu chatbot, aparecerá acá.'}
              </p>
            </section>
          ) : (
            <>
              <section className="budgets-list" aria-label="Listado de presupuestos">
                {presupuestos.map(presupuesto => (
                  <article className="budget-card" key={presupuesto.id}>
                    <div className="budget-card__top">
                      <div>
                        <span>Presupuesto #{presupuesto.id}</span>
                        <h2>{presupuesto.consulta?.cliente?.nombre || 'Cliente sin registrar'}</h2>
                      </div>
                      <PresupuestoStatusBadge estado={presupuesto.estado} />
                    </div>
                    <dl className="budget-card__data">
                      <div><dt>Consulta</dt><dd>{presupuesto.consulta?.asunto || `#${presupuesto.consultaId.slice(0, 8)}`}</dd></div>
                      <div><dt>Emisión</dt><dd>{formatDate(presupuesto.fechaEmision)}</dd></div>
                      <div><dt>Vencimiento</dt><dd>{formatDate(presupuesto.fechaVencimiento)}</dd></div>
                      <div><dt>Total</dt><dd>{formatCurrency(presupuesto.total)}</dd></div>
                    </dl>
                    <div className="budget-card__footer">
                      <span className={presupuesto.linkPdf ? 'is-ready' : ''}>
                        {presupuesto.linkPdf ? 'PDF disponible' : 'PDF pendiente'}
                      </span>
                      <button type="button" onClick={() => navigate(`/presupuestos/${presupuesto.id}`)}>
                        Ver detalle
                      </button>
                    </div>
                  </article>
                ))}
              </section>

              {pagination.totalPages > 1 && (
                <nav className="budgets-pagination" aria-label="Paginación de presupuestos">
                  <button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>
                    Anterior
                  </button>
                  <span>Página {pagination.page} de {pagination.totalPages}</span>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(value => value + 1)}
                  >
                    Siguiente
                  </button>
                </nav>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
