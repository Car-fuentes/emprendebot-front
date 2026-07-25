import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { Drawer } from '../components/layout/Drawer'
import { Avatar } from '../components/ui/Avatar'
import { brand } from '../styles/brand'
import type { ProductApi } from '../types'
import { deleteProductApi, getProductsApi } from '../services/productApi'

const PAGE_SIZE = 10

export function CatalogPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { business, loadBusiness } = useBusiness()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [products, setProducts] = useState<ProductApi[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ProductApi | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage

  useEffect(() => {
    if (user) void loadBusiness(user.id)
  }, [user, loadBusiness])

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await getProductsApi({
        page,
        limit: PAGE_SIZE,
        buscar: search,
        activo: activeFilter === 'all' ? undefined : activeFilter === 'active',
      })
      setProducts(result.productos)
      setTotalPages(Math.max(result.totalPaginas, 1))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos cargar el catálogo.')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, activeFilter])

  useEffect(() => {
    const request = window.setTimeout(() => void loadProducts(), 0)
    return () => window.clearTimeout(request)
  }, [loadProducts])

  const handlePricingChoice = (precioConsultar: boolean) => {
    setShowPricingModal(false)
    navigate('/catalogo/agregar', { state: { precioConsultar } })
  }

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    setDeleteError('')
    try {
      await deleteProductApi(deleteTarget.id)
      setDeleteTarget(null)
      await loadProducts()
    } catch (caught) {
      setDeleteError(caught instanceof Error ? caught.message : 'No pudimos eliminar el producto.')
    } finally {
      setIsDeleting(false)
    }
  }

  const hasFilters = search.trim() !== '' || activeFilter !== 'all'

  return (
    <>
      <Drawer business={business} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} activeItem="catalogo" />
      <main style={{ flex: 1, minHeight: '100svh', background: 'var(--color-bg-subtle)' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
          <button type="button" aria-label="Abrir navegación" onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 22, padding: 4 }}>☰</button>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-primary)' }}>EmprendeBot</span>
          <Avatar name={user?.nombre ?? ''} size={36} />
        </header>

        <div style={{ maxWidth: 980, margin: '0 auto', padding: '18px 20px 100px' }}>
          <button type="button" onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: 0, color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 700 }}>
            <span aria-hidden="true" style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--color-surface-muted)' }}>‹</span>
            Volver
          </button>

          <section style={{ padding: '14px 0 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>Catálogo</h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>Gestiona los productos de tu negocio</p>
            </div>
            <button onClick={() => setShowPricingModal(true)} style={{ background: brand.primaryGradient, color: '#fff', border: 0, borderRadius: 'var(--radius-md)', padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ AGREGAR</button>
          </section>

          {successMessage && <p role="status" style={{ padding: 12, borderRadius: 8, color: '#087F5B', background: '#D3F9D8' }}>{successMessage}</p>}

          <section style={{ display: 'flex', gap: 10, margin: '14px 0', flexWrap: 'wrap' }}>
            <input
              aria-label="Buscar productos"
              value={search}
              onChange={event => { setSearch(event.target.value); setPage(1) }}
              placeholder="Buscar por nombre"
              style={{ flex: '1 1 220px', minHeight: 42, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
            />
            <select
              aria-label="Filtrar por estado"
              value={activeFilter}
              onChange={event => { setActiveFilter(event.target.value as typeof activeFilter); setPage(1) }}
              style={{ minHeight: 42, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </section>

          {isLoading ? (
            <div role="status" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Cargando productos…</div>
          ) : error ? (
            <div role="alert" style={{ padding: 32, textAlign: 'center', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 16 }}>
              <p style={{ color: '#DC2626' }}>{error}</p>
              <button onClick={() => void loadProducts()} style={{ padding: '10px 18px', borderRadius: 8, color: '#fff', background: brand.primaryGradient }}>REINTENTAR</button>
            </div>
          ) : products.length === 0 ? (
            <div style={{ background: 'var(--color-bg)', borderRadius: 16, border: '1px solid var(--color-border)', padding: '48px 24px', textAlign: 'center' }}>
              <img src="/cajaVacia.png" alt="" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 20 }} />
              <h2 style={{ fontSize: 22, margin: '18px 0 8px', color: 'var(--color-text-primary)' }}>{hasFilters ? 'No encontramos productos' : 'Tu catálogo está vacío'}</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>{hasFilters ? 'Probá con otros filtros de búsqueda.' : 'Agregá tu primer producto para comenzar a recibir consultas.'}</p>
              {!hasFilters && <button onClick={() => setShowPricingModal(true)} style={{ marginTop: 12, padding: '14px 40px', borderRadius: 8, color: '#fff', fontWeight: 700, background: brand.primaryGradient }}>AGREGAR</button>}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {products.map(product => (
                  <article key={product.id} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 70, height: 70, borderRadius: 10, background: 'rgba(19,168,162,.1)', display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {product.urlImagen ? <img src={product.urlImagen} alt={product.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span aria-hidden="true" style={{ fontSize: 26 }}>📦</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-primary)' }}>{product.nombre}</p>
                      {product.descripcion && <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.descripcion}</p>}
                      <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 700, color: '#13A8A2' }}>{product.requiereCotizacion ? 'Precio a convenir' : `$ ${Number(product.precio).toLocaleString('es-AR')}`}</p>
                      <small style={{ color: product.activo ? '#087F5B' : '#6C738E' }}>Stock: {product.stock} · {product.activo ? 'Activo' : 'Inactivo'}</small>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => navigate(`/catalogo/editar/${product.id}`)} aria-label={`Editar ${product.nombre}`} style={{ padding: 8, color: '#6C738E' }}>Editar</button>
                      <button onClick={() => { setDeleteTarget(product); setDeleteError('') }} aria-label={`Eliminar ${product.nombre}`} style={{ padding: 8, color: '#EF4444' }}>Eliminar</button>
                    </div>
                  </article>
                ))}
              </div>
              {totalPages > 1 && (
                <nav aria-label="Paginación del catálogo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
                  <button disabled={page === 1} onClick={() => setPage(current => current - 1)}>Anterior</button>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Página {page} de {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(current => current + 1)}>Siguiente</button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>

      {showPricingModal && (
        <div onClick={() => setShowPricingModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'grid', placeItems: 'center', zIndex: 200, padding: 24 }}>
          <div onClick={event => event.stopPropagation()} style={{ width: '100%', maxWidth: 400, background: 'var(--color-bg)', borderRadius: 20, padding: 24 }}>
            <h2 style={{ marginTop: 0, fontSize: 17, color: 'var(--color-text-primary)' }}>Configurá cómo querés ofrecer este producto.</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>La modalidad elegida se mostrará en tu catálogo.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handlePricingChoice(false)} style={{ flex: 1, padding: 18, border: '1.5px solid var(--color-border)', borderRadius: 14, background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}><strong>Precio fijo</strong></button>
              <button onClick={() => handlePricingChoice(true)} style={{ flex: 1, padding: 18, border: '1.5px solid var(--color-border)', borderRadius: 14, background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}><strong>Requiere cotización</strong></button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'grid', placeItems: 'center', zIndex: 200, padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 360, background: 'var(--color-bg)', borderRadius: 16, padding: 24 }}>
            <p style={{ marginTop: 0, textAlign: 'center', color: 'var(--color-text-primary)' }}>¿Seguro que querés eliminar <strong>{deleteTarget.nombre}</strong>?</p>
            {deleteError && <p role="alert" style={{ color: '#DC2626', fontSize: 13 }}>{deleteError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button disabled={isDeleting} onClick={() => setDeleteTarget(null)} style={{ flex: 1, height: 44, border: '1.5px solid #13A8A2', borderRadius: 8, color: 'var(--color-primary)' }}>CANCELAR</button>
              <button disabled={isDeleting} onClick={() => void handleDelete()} style={{ flex: 1, height: 44, borderRadius: 8, background: '#EF4444', color: '#fff' }}>{isDeleting ? 'ELIMINANDO…' : 'ELIMINAR'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
