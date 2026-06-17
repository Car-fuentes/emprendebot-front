import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer } from '../components/layout/Drawer'
import { FaqCard } from '../components/faq/FaqCard'
import { FaqForm } from '../components/faq/FaqForm'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { useFaqs, type FAQStatusFilter } from '../hooks/useFaqs'
import type { FAQ } from '../types'
import type { FAQFormData } from '../services/faqStorage'
import type { FAQMoveDirection } from '../services/faqStorage'

export function FaqPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { business, isBusinessLoading, loadBusiness } = useBusiness()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [statusFilter, setStatusFilter] = useState<FAQStatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [formLoading, setFormLoading] = useState(false)
  const [busyFaqId, setBusyFaqId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const {
    faqs,
    allFaqs,
    categories,
    createFaq,
    updateFaq,
    deleteFaq,
    toggleFaq,
    moveFaq,
  } = useFaqs({ status: statusFilter, category: categoryFilter })

  useEffect(() => {
    if (user) loadBusiness(user.id)
  }, [loadBusiness, user])

  const closeForm = () => {
    setShowForm(false)
    setEditingFaq(null)
    setError('')
  }

  const openCreateForm = () => {
    setEditingFaq(null)
    setShowForm(true)
    setError('')
  }

  const openEditForm = (faq: FAQ) => {
    setEditingFaq(faq)
    setShowForm(true)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (data: FAQFormData) => {
    setFormLoading(true)
    setError('')
    try {
      if (editingFaq) {
        const selectedCategoryWillDisappear = categoryFilter !== 'all'
          && editingFaq.categoriaId === categoryFilter
          && !allFaqs.some(faq => faq.id !== editingFaq.id && faq.categoriaId === categoryFilter)
        const updatedFaq = await updateFaq(editingFaq.id, data)
        if (selectedCategoryWillDisappear && updatedFaq.categoriaId !== categoryFilter) {
          setCategoryFilter('all')
        }
      } else {
        await createFaq(data)
      }
      closeForm()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos guardar la FAQ.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (faqId: string) => {
    setBusyFaqId(faqId)
    setError('')
    try {
      const selectedCategoryWillDisappear = categoryFilter !== 'all'
        && allFaqs.some(faq => faq.id === faqId && faq.categoriaId === categoryFilter)
        && !allFaqs.some(faq => faq.id !== faqId && faq.categoriaId === categoryFilter)
      await deleteFaq(faqId)
      if (selectedCategoryWillDisappear) setCategoryFilter('all')
      if (editingFaq?.id === faqId) closeForm()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No pudimos eliminar la FAQ.')
    } finally {
      setBusyFaqId(null)
    }
  }

  const handleToggle = async (faqId: string) => {
    setBusyFaqId(faqId)
    setError('')
    try {
      await toggleFaq(faqId)
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'No pudimos cambiar el estado de la FAQ.')
    } finally {
      setBusyFaqId(null)
    }
  }

  const handleMove = async (faqId: string, direction: FAQMoveDirection) => {
    setBusyFaqId(faqId)
    setError('')
    try {
      await moveFaq(faqId, direction)
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : 'No pudimos cambiar el orden de la FAQ.')
    } finally {
      setBusyFaqId(null)
    }
  }

  if (!user) return null

  return (
    <>
      <Drawer
        business={business}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem="faq"
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
            aria-label="Abrir navegación"
            onClick={() => setDrawerOpen(true)}
            style={{ background: 'none', border: 'none', fontSize: '22px', padding: '4px' }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-primary)' }}>
            EmprendeBot
          </span>
          <Avatar name={user.nombre} size={36} />
        </header>

        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '18px',
          }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
                Preguntas frecuentes
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                Administrá las respuestas automáticas de tu negocio.
              </p>
            </div>
            {business && !showForm && (
              <Button type="button" size="sm" onClick={openCreateForm} style={{ flexShrink: 0 }}>
                + Nueva
              </Button>
            )}
          </div>

          {isBusinessLoading ? (
            <section style={{
              padding: '28px 20px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
            }}>
              Cargando información del negocio...
            </section>
          ) : !business ? (
            <section style={{
              padding: '28px 20px',
              textAlign: 'center',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ fontSize: '34px', marginBottom: '10px' }}>?</div>
              <h2 style={{ fontSize: '17px', marginBottom: '6px' }}>Primero configurá tu negocio</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '18px' }}>
                Necesitamos asociar las preguntas frecuentes a un negocio.
              </p>
              <Button type="button" onClick={() => navigate('/configurar')}>
                Configurar negocio
              </Button>
            </section>
          ) : (
            <>
              {showForm && (
                <div style={{ marginBottom: '18px' }}>
                  <FaqForm
                    key={editingFaq?.id ?? 'new-faq'}
                    faq={editingFaq ?? undefined}
                    categories={categories}
                    loading={formLoading}
                    onSubmit={handleSubmit}
                    onCancel={closeForm}
                  />
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  style={{
                    marginBottom: '14px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: 'var(--color-error)',
                    fontSize: '13px',
                  }}
                >
                  {error}
                </div>
              )}

              {allFaqs.length > 0 && (
                <section style={{ marginBottom: '16px' }} aria-label="Filtros de preguntas frecuentes">
                  <div style={{
                    display: 'flex',
                    gap: '7px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                  }}>
                    <Chip selected={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
                      Todas ({allFaqs.length})
                    </Chip>
                    <Chip selected={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>
                      Activas
                    </Chip>
                    <Chip selected={statusFilter === 'inactive'} onClick={() => setStatusFilter('inactive')}>
                      Inactivas
                    </Chip>
                  </div>

                  {categories.length > 0 && (
                    <select
                      aria-label="Filtrar por categoría"
                      value={categoryFilter}
                      onChange={event => setCategoryFilter(event.target.value)}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-bg)',
                        color: 'var(--color-text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    >
                      <option value="all">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.nombre}</option>
                      ))}
                    </select>
                  )}
                </section>
              )}

              {allFaqs.length === 0 ? (
                <section style={{
                  padding: '32px 20px',
                  textAlign: 'center',
                  background: 'var(--color-bg)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ fontSize: '34px', marginBottom: '10px' }}>?</div>
                  <h2 style={{ fontSize: '17px', marginBottom: '6px' }}>Todavía no hay FAQs</h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '18px' }}>
                    Creá respuestas para las consultas que recibís con más frecuencia.
                  </p>
                  {!showForm && (
                    <Button type="button" onClick={openCreateForm}>Crear primera FAQ</Button>
                  )}
                </section>
              ) : faqs.length === 0 ? (
                <section style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  fontSize: '13px',
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  No hay FAQs que coincidan con estos filtros.
                </section>
              ) : (
                <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {faqs.map(faq => (
                    <FaqCard
                      key={faq.id}
                      faq={faq}
                      busy={busyFaqId === faq.id}
                      onEdit={openEditForm}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                      onMove={handleMove}
                      canMoveUp={allFaqs.findIndex(item => item.id === faq.id) > 0}
                      canMoveDown={allFaqs.findIndex(item => item.id === faq.id) < allFaqs.length - 1}
                    />
                  ))}
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </>
  )
}
