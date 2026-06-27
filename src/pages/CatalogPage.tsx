import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../context/BusinessContext'
import { useAuth } from '../context/AuthContext'
import { Drawer } from '../components/layout/Drawer'
import { Avatar } from '../components/ui/Avatar'
import type { Product } from '../types'

export function CatalogPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { business, updateBusiness, loadBusiness } = useBusiness()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  useEffect(() => {
    if (user) loadBusiness(user.id)
  }, [user, loadBusiness])

  const productos = business?.productos ?? []

  const handleDelete = () => {
    if (!deleteTarget || !business) return
    updateBusiness({ productos: productos.filter(p => p.id !== deleteTarget.id) })
    setDeleteTarget(null)
  }

  return (
    <>
    <Drawer
      business={business}
      isOpen={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      activeItem="catalogo"
    />

    <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-subtle)',
        minHeight: '100svh',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: '#fff',
        borderBottom: '1px solid #F0F0F0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button
          type="button"
          aria-label="Abrir navegacion"
          onClick={() => setDrawerOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', padding: '4px' }}
        >
          ☰
        </button>
        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-primary)' }}>
          EmprendeBot
        </span>
        <Avatar name={user?.nombre ?? ''} size={36} />
      </div>

      {/* Título */}
      <div style={{ padding: '24px 20px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: '#000' }}>Catálogo</h1>
          <p style={{ fontSize: 14, color: '#6C738E', margin: '4px 0 0' }}>Gestiona tus productos y servicios</p>
        </div>
        {productos.length > 0 && (
          <button
            onClick={() => navigate('/catalogo/agregar')}
            style={{
              background: '#13A8A2',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: 0.5,
              fontFamily: 'var(--font-family)',
              whiteSpace: 'nowrap',
              marginTop: 4,
            }}
          >
            + AGREGAR
          </button>
        )}
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, padding: '16px 20px 100px' }}>
        {productos.length === 0 ? (
          /* Empty state */
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #F0F0F0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: '48px 24px',
            margin: '8px 0 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            textAlign: 'center',
          }}>
            <img src="/cajaVacia.png" alt="Catálogo vacío" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 20 }} />
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', padding: 10 ,color: '#000' }}>
                Tu catálogo está vacío
              </h2>
              <p style={{ fontSize: 14, color: '#6C738E', margin: 0, padding: 8,maxWidth: 260 }}>
                Agrega tu primer producto o servicio para comenzar a recibir consultas y presupuestos.
              </p>
            </div>
            <button
              onClick={() => navigate('/catalogo/agregar')}
              style={{
                margin: 12,
                background: '#13A8A2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '14px 40px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: 1,
                fontFamily: 'var(--font-family)',
              }}
            >
              AGREGAR
            </button>
          </div>
        ) : (
          /* Lista de productos */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {productos.map(p => (
              <div key={p.id} style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}>
                {/* Imagen */}
                <div style={{
                  width: 70, height: 70, borderRadius: 10,
                  background: 'rgba(19,168,162,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, overflow: 'hidden',
                }}>
                  {p.imagen
                    ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 26 }}>📦</span>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#000' }}>{p.nombre}</p>
                  {p.descripcion && (
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6C738E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.descripcion}
                    </p>
                  )}
                  {p.precio && (
                    <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 700, color: '#13A8A2' }}>
                      $ {p.precio.toLocaleString('es-AR')}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => navigate(`/catalogo/editar/${p.id}`)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#6C738E' }}
                    title="Editar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#EF4444' }}
                    title="Eliminar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo confirmación eliminar */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200,
        }}>
          <div style={{
            width: '75%', maxWidth: 340,
            background: '#fff',
            borderRadius: 16,
            padding: '28px 20px 20px',
          }}>
            <p style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#000', textAlign: 'center' }}>
              ¿Estás seguro de que deseas eliminarlo?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1, height: 44,
                  background: '#fff', color: '#13A8A2',
                  border: '1.5px solid #13A8A2', borderRadius: 8,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                }}
              >
                CANCELAR
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1, height: 44,
                  background: '#EF4444', color: '#fff',
                  border: 'none', borderRadius: 8,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                }}
              >
                ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
