import { useEffect, useMemo, useState } from 'react'
import { Drawer } from '../components/layout/Drawer'
import { FaqCard } from '../components/faq/FaqCard'
import { FaqForm } from '../components/faq/FaqForm'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { useFaqs, type FAQSortOption, type FAQStatusFilter } from '../hooks/useFaqs'
import type { FAQ, FAQFormData } from '../types'
import {
  getFaqSuggestions,
  mapSuggestionToFaqFormData,
  type FAQSuggestion,
} from '../services/faqSuggestions'

export function FaqPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    business,
    isBusinessLoading,
    loadBusiness,
    createFaq: createLocalFaq,
    updateFaq: updateLocalFaq,
    deleteFaq: deleteLocalFaq,
    toggleFaq: toggleLocalFaq,
  } = useBusiness()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [statusFilter, setStatusFilter] = useState<FAQStatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortOption, setSortOption] = useState<FAQSortOption>('created-desc')
  const [formLoading, setFormLoading] = useState(false)
  const [busyFaqId, setBusyFaqId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<FAQSuggestion[]>([])
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [hasUnsavedFaqChanges, setHasUnsavedFaqChanges] = useState(false)
  const [pendingDiscardAction, setPendingDiscardAction] = useState<(() => void) | null>(null)
  const localFaqSource = useMemo(() => ({
    business,
    createFaq: createLocalFaq,
    updateFaq: updateLocalFaq,
    deleteFaq: deleteLocalFaq,
    toggleFaq: toggleLocalFaq,
  }), [business, createLocalFaq, deleteLocalFaq, toggleLocalFaq, updateLocalFaq])

  const {
    faqs,
    allFaqs,
    categories,
    isLoading: isFaqLoading,
    error: faqLoadError,
    createFaq,
    updateFaq,
    deleteFaq,
    toggleFaq,
  } = useFaqs({ status: statusFilter, category: categoryFilter, sort: sortOption }, localFaqSource)
  const addedSuggestionIds = useMemo(
    () => new Set(allFaqs.map(faq => faq.sourceSuggestionId).filter(Boolean)),
    [allFaqs],
  )
  const availableSuggestions = useMemo(
    () => suggestions.filter(suggestion => !addedSuggestionIds.has(suggestion.id)),
    [addedSuggestionIds, suggestions],
  )

  useEffect(() => {
    if (user) loadBusiness(user.id)
  }, [loadBusiness, user])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedFaqChanges) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedFaqChanges])

  const runWithUnsavedCheck = (action: () => void) => {
    if (!hasUnsavedFaqChanges) {
      action()
      return
    }

    setPendingDiscardAction(() => action)
  }

  const discardPendingChanges = () => {
    setHasUnsavedFaqChanges(false)
    const action = pendingDiscardAction
    setPendingDiscardAction(null)
    action?.()
  }

  const handleBack = () => {
    if (showSuggestions) {
      closeSuggestions()
      return
    }

    if (showForm) {
      closeForm()
      return
    }

    navigate(-1)
  }

  const openSuggestions = async () => {
    if (showForm && hasUnsavedFaqChanges) {
      runWithUnsavedCheck(() => {
        setShowForm(false)
        setEditingFaq(null)
        setHasUnsavedFaqChanges(false)
        setError('')
        setShowSuggestions(true)
        setSelectedSuggestionIds(current => current.filter(id => !addedSuggestionIds.has(id)))
        if (suggestions.length === 0) {
          setSuggestionsLoading(true)
          getFaqSuggestions()
            .then(setSuggestions)
            .catch(suggestionsError => {
              setError(suggestionsError instanceof Error ? suggestionsError.message : 'No pudimos cargar las preguntas sugeridas.')
            })
            .finally(() => setSuggestionsLoading(false))
        }
      })
      return
    }

    setShowForm(false)
    setEditingFaq(null)
    setHasUnsavedFaqChanges(false)
    setError('')
    setShowSuggestions(true)
    setSelectedSuggestionIds(current => current.filter(id => !addedSuggestionIds.has(id)))

    if (suggestions.length > 0) return

    setSuggestionsLoading(true)
    try {
      setSuggestions(await getFaqSuggestions())
    } catch (suggestionsError) {
      setError(suggestionsError instanceof Error ? suggestionsError.message : 'No pudimos cargar las preguntas sugeridas.')
    } finally {
      setSuggestionsLoading(false)
    }
  }

  const closeSuggestions = () => {
    setShowSuggestions(false)
    setSelectedSuggestionIds([])
  }

  const closeForm = () => {
    if (hasUnsavedFaqChanges) {
      runWithUnsavedCheck(() => {
        setShowForm(false)
        setEditingFaq(null)
        setHasUnsavedFaqChanges(false)
        setError('')
      })
      return
    }

    setShowForm(false)
    setEditingFaq(null)
    setHasUnsavedFaqChanges(false)
    setError('')
  }

  const closeFormAfterSave = () => {
    setShowForm(false)
    setEditingFaq(null)
    setHasUnsavedFaqChanges(false)
    setError('')
  }

  const openCreateForm = () => {
    if (showForm && hasUnsavedFaqChanges) {
      runWithUnsavedCheck(() => {
        setShowSuggestions(false)
        setEditingFaq(null)
        setHasUnsavedFaqChanges(false)
        setShowForm(true)
        setError('')
      })
      return
    }

    setShowSuggestions(false)
    setEditingFaq(null)
    setHasUnsavedFaqChanges(false)
    setShowForm(true)
    setError('')
  }

  const openEditForm = (faq: FAQ) => {
    if (showForm && hasUnsavedFaqChanges) {
      runWithUnsavedCheck(() => {
        setEditingFaq(faq)
        setHasUnsavedFaqChanges(false)
        setShowForm(true)
        setError('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      return
    }

    setEditingFaq(faq)
    setHasUnsavedFaqChanges(false)
    setShowForm(true)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleSuggestion = (suggestionId: string) => {
    setSelectedSuggestionIds(current =>
      current.includes(suggestionId)
        ? current.filter(id => id !== suggestionId)
        : [...current, suggestionId],
    )
  }

  const handleAddSelectedSuggestions = async () => {
    if (selectedSuggestionIds.length === 0) {
      setError('Seleccioná al menos una pregunta sugerida para agregar.')
      return
    }

    setFormLoading(true)
    setError('')
    try {
      const selectedSuggestions = availableSuggestions.filter(suggestion => selectedSuggestionIds.includes(suggestion.id))
      for (const suggestion of selectedSuggestions) {
        await createFaq(mapSuggestionToFaqFormData(suggestion))
      }
      closeSuggestions()
    } catch (suggestionError) {
      setError(suggestionError instanceof Error ? suggestionError.message : 'No pudimos agregar las preguntas sugeridas.')
    } finally {
      setFormLoading(false)
    }
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
      closeFormAfterSave()
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
      if (editingFaq?.id === faqId) closeFormAfterSave()
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
            aria-label="Abrir navegacion"
            onClick={() => runWithUnsavedCheck(() => {
              setHasUnsavedFaqChanges(false)
              setShowForm(false)
              setEditingFaq(null)
              setDrawerOpen(true)
            })}
            style={{ background: 'none', border: 'none', fontSize: '22px', padding: '4px' }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-primary)' }}>
            EmprendeBot
          </span>
          <Avatar name={user.nombre} size={36} />
        </header>

        <main style={{ flex: 1, padding: '20px', overflowY: 'auto', background: 'var(--color-bg)' }}>
          <>
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '18px',
                padding: 0,
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'var(--font-family)',
                cursor: 'pointer',
              }}
            >
              <span aria-hidden="true">‹</span>
              ← Volver
            </button>
          </>

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
                {allFaqs.length > 0
                  ? `${allFaqs.length} ${allFaqs.length === 1 ? 'pregunta agregada' : 'preguntas agregadas'}`
                  : 'Administra las respuestas automáticas de tu negocio.'}
              </p>
            </div>
            {!showForm && !showSuggestions && allFaqs.length > 0 && (
              <Button type="button" size="sm" onClick={openCreateForm} style={{ flexShrink: 0 }}>
                + Crear nueva
              </Button>
            )}
          </div>

          {isBusinessLoading || isFaqLoading ? (
            <section style={{
              padding: '28px 20px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
            }}>
              Cargando preguntas frecuentes...
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
                    onDirtyChange={setHasUnsavedFaqChanges}
                  />
                </div>
              )}

              {(error || faqLoadError) && (
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
                  {error || faqLoadError}
                </div>
              )}

              {showSuggestions && (
                <section style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '18px',
                }}>
                  <div style={{
                    padding: '16px',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '5px' }}>
                      Elegí preguntas sugeridas
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                      Seleccioná las que quieras sumar a tu negocio. Después vas a poder editar las respuestas.
                    </p>
                  </div>

                  {suggestionsLoading ? (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: 'var(--color-text-secondary)',
                      fontSize: '13px',
                    }}>
                      Cargando preguntas sugeridas...
                    </div>
                  ) : availableSuggestions.length === 0 ? (
                    <div style={{
                      padding: '20px 0',
                      color: 'var(--color-text-secondary)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                    }}>
                      Ya agregaste todas las preguntas sugeridas disponibles. Si eliminás una FAQ creada desde sugerencias, volverá a aparecer acá.
                    </div>
                  ) : (
                    availableSuggestions.map(suggestion => {
                      const selected = selectedSuggestionIds.includes(suggestion.id)

                      return (
                        <button
                          key={suggestion.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleSuggestion(suggestion.id)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: selected ? '12px 14px' : '14px 8px 14px 40px',
                            background: selected ? 'rgba(19, 171, 162, 0.14)' : 'transparent',
                            border: 'none',
                            borderBottom: selected ? 'none' : '1px solid var(--color-border)',
                            borderRadius: selected ? 'var(--radius-md)' : 0,
                            boxShadow: 'none',
                            color: selected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            fontFamily: 'var(--font-family)',
                            fontWeight: selected ? 700 : 600,
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {selected && (
                              <span
                                aria-hidden="true"
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: 'var(--color-primary)',
                                  color: '#fff',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '13px',
                                  lineHeight: 1,
                                  flexShrink: 0,
                                }}
                              >
                                ✓
                              </span>
                            )}
                            <span>
                              <strong style={{ display: 'block', fontSize: '14px', marginBottom: '6px', lineHeight: 1.4 }}>
                                {suggestion.pregunta}
                              </strong>
                              <span style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
                                <strong>Categoría:</strong>{' '}
                                <span style={{ color: 'var(--color-text-secondary)' }}>{suggestion.categoria}</span>
                              </span>
                            </span>
                          </span>
                        </button>
                      )
                    })
                  )}

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button
                      type="button"
                      fullWidth
                      loading={formLoading}
                      disabled={suggestionsLoading || availableSuggestions.length === 0}
                      onClick={handleAddSelectedSuggestions}
                    >
                      Agregar seleccionadas{selectedSuggestionIds.length > 0 ? ` (${selectedSuggestionIds.length})` : ''}
                    </Button>
                    <Button type="button" variant="outline" fullWidth onClick={openCreateForm} disabled={formLoading}>
                      Crear nueva
                    </Button>
                    {allFaqs.length > 0 && (
                      <Button type="button" variant="ghost" fullWidth onClick={closeSuggestions} disabled={formLoading}>
                        Volver al listado
                      </Button>
                    )}
                  </div>
                </section>
              )}

              {false && !showSuggestions && allFaqs.length > 0 && (
                <section style={{ marginBottom: '16px' }} aria-label="Filtros de preguntas frecuentes">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <Button type="button" size="sm" onClick={openCreateForm}>
                      Crear nueva
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => void openSuggestions()}>
                      Agregar más preguntas sugeridas
                    </Button>
                  </div>

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
                      aria-label="Filtrar por categoria"
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
                      <option value="all">Todas las categorias</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.nombre}</option>
                      ))}
                    </select>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                    <label
                      htmlFor="faq-sort"
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--color-text-secondary)',
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Ordenar por
                    </label>
                    <select
                      id="faq-sort"
                      aria-label="Ordenar preguntas frecuentes"
                      value={sortOption}
                      onChange={event => setSortOption(event.target.value as FAQSortOption)}
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
                      <option value="created-desc">Fecha: mas recientes primero</option>
                      <option value="created-asc">Fecha: mas antiguas primero</option>
                      <option value="alpha-asc">Alfabetico: A-Z</option>
                      <option value="alpha-desc">Alfabetico: Z-A</option>
                    </select>
                  </div>
                </section>
              )}

              {!showSuggestions && !showForm && allFaqs.length === 0 ? (
                <section style={{
                  padding: '64px 20px 32px',
                  textAlign: 'center',
                  background: 'var(--color-bg)',
                }}>
                  <div style={{ fontSize: '34px', marginBottom: '28px', color: 'var(--color-text-secondary)' }}>?</div>
                  <h2 style={{ fontSize: '17px', marginBottom: '6px' }}>Todavía no hay preguntas frecuentes</h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '18px' }}>
                    Crea respuestas para las consultas que recibis con mas frecuencia.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button type="button" onClick={() => void openSuggestions()}>Comenzar</Button>
                  </div>
                </section>
              ) : !showSuggestions && faqs.length === 0 ? (
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
              ) : !showSuggestions ? (
                <section style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {faqs.map(faq => (
                    <FaqCard
                      key={faq.id}
                      faq={faq}
                      busy={busyFaqId === faq.id}
                      onEdit={openEditForm}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => void openSuggestions()}
                    style={{
                      alignSelf: 'center',
                      marginTop: '18px',
                      padding: '10px 0',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '15px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-family)',
                      cursor: 'pointer',
                    }}
                  >
                    + Agregar más preguntas sugeridas
                  </button>
                </section>
              ) : null}
            </>
          )}
        </main>
      </div>

      {pendingDiscardAction && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-faq-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '12px',
            background: 'rgba(15, 23, 42, 0.28)',
          }}
        >
          <div style={{
            width: '100%',
            maxWidth: '390px',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h2 id="discard-faq-title" style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
              Cambios sin guardar
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: 1.45, marginBottom: '14px' }}>
              Si salís ahora, se van a perder los cambios de esta pregunta.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button type="button" fullWidth onClick={() => setPendingDiscardAction(null)}>
                Seguir editando
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={discardPendingChanges}
                style={{ color: 'var(--color-error)' }}
              >
                Descartar cambios
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
