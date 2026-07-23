import { useEffect, useState } from 'react'
import { Drawer } from '../components/layout/Drawer'
import { FaqCard } from '../components/faq/FaqCard'
import { FaqForm } from '../components/faq/FaqForm'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { AppIcon } from '../components/ui/AppIcon'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { useFaqs, type FAQSortOption, type FAQStatusFilter } from '../hooks/useFaqs'
import type { FAQ, FAQFormData } from '../types'
import { brand } from '../styles/brand'
import { DUPLICATE_FAQ_MESSAGE, normalizeFaqQuestion } from '../utils/normalizeFaqQuestion'
import { type FAQSuggestion } from '../services/faqSuggestions'

const FAQ_PRIMARY = brand.primary
const FAQ_TEXT = brand.text
const FAQ_MUTED = brand.muted
const FAQ_BORDER = brand.border
const FAQ_CARD_SHADOW = brand.shadowCard

export function FaqPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const {
    business,
    isBusinessLoading,
    loadBusiness,
    updateBusiness,
  } = useBusiness()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [statusFilter] = useState<FAQStatusFilter>('active')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortOption] = useState<FAQSortOption>('created-desc')
  const [formLoading, setFormLoading] = useState(false)
  const [busyFaqId, setBusyFaqId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<FAQSuggestion[]>([])
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([])
  const [hasUnsavedFaqChanges, setHasUnsavedFaqChanges] = useState(false)
  const [pendingDiscardAction, setPendingDiscardAction] = useState<(() => void) | null>(null)
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
  } = useFaqs({ status: statusFilter, category: categoryFilter, sort: sortOption })
  const availableSuggestions = suggestions

  useEffect(() => {
    if (user) loadBusiness(user.id)
  }, [loadBusiness, user])

  // Sincroniza las FAQs del backend al BusinessContext (localStorage)
  // para que el chatbot público pueda leerlas en este mismo browser.
  useEffect(() => {
    if (isFaqLoading) return
    updateBusiness({ faq: allFaqs })
  }, [allFaqs, isFaqLoading, updateBusiness])

  useEffect(() => {
    if (!location.state?.resetFaqView) return

    setShowForm(false)
    setEditingFaq(null)
    setShowSuggestions(false)
    setSelectedSuggestionIds([])
    setHasUnsavedFaqChanges(false)
    setPendingDiscardAction(null)
    setError('')
    setFormLoading(false)
    setBusyFaqId(null)
  }, [location.state])

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

  const handleGlobalBack = () => {
    navigate('/dashboard')
  }

  const handleInternalBack = () => {
    if (showSuggestions) {
      closeSuggestions()
      return
    }

    if (showForm) {
      closeForm()
      return
    }
  }

  const openSuggestions = () => {
    const inactiveFaqs: FAQSuggestion[] = allFaqs
      .filter(f => !f.activa)
      .map(f => ({
        id: f.id,
        pregunta: f.pregunta,
        respuesta: f.respuesta,
        categoria: f.categoria ?? '',
        activa: false,
      }))

    if (showForm && hasUnsavedFaqChanges) {
      runWithUnsavedCheck(() => {
        setShowForm(false)
        setEditingFaq(null)
        setHasUnsavedFaqChanges(false)
        setError('')
        setShowSuggestions(true)
        setSuggestions(inactiveFaqs)
        setSelectedSuggestionIds([])
      })
      return
    }

    setShowForm(false)
    setEditingFaq(null)
    setHasUnsavedFaqChanges(false)
    setError('')
    setShowSuggestions(true)
    setSuggestions(inactiveFaqs)
    setSelectedSuggestionIds([])
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
    if (formLoading) return

    if (selectedSuggestionIds.length === 0) {
      setError('Seleccioná al menos una pregunta sugerida para agregar.')
      return
    }

    setFormLoading(true)
    setError('')
    try {
      for (const id of selectedSuggestionIds) {
        await toggleFaq(id)
      }
      closeSuggestions()
    } catch (suggestionError) {
      setError(suggestionError instanceof Error ? suggestionError.message : 'No pudimos agregar las preguntas sugeridas.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmit = async (data: FAQFormData) => {
    const normalizedQuestion = normalizeFaqQuestion(data.pregunta)
    const duplicateQuestion = allFaqs.some(faq => (
      faq.id !== editingFaq?.id
      && normalizeFaqQuestion(faq.pregunta) === normalizedQuestion
    ))

    if (duplicateQuestion) {
      setError(DUPLICATE_FAQ_MESSAGE)
      return
    }

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

  const showingFaqIntro = !showForm && !showSuggestions && allFaqs.filter(f => f.activa).length === 0

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
        background: 'var(--color-bg)',
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
            onClick={() => runWithUnsavedCheck(() => {
              setHasUnsavedFaqChanges(false)
              setShowForm(false)
              setEditingFaq(null)
              setDrawerOpen(true)
            })}
            style={{
              width: 32,
              height: 32,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: FAQ_TEXT,
              background: 'transparent',
            }}
          >
            <AppIcon name="menu" size={21} strokeWidth={2.2} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '15px', color: FAQ_PRIMARY }}>
            EmprendeBot
          </span>
          <Avatar name={user.nombre} size={32} bgColor={brand.primaryGradient} />
        </header>

        <main style={{
          flex: 1,
          padding: '18px 20px 28px',
          overflowY: 'auto',
          background: showingFaqIntro ? 'var(--color-bg-subtle)' : 'var(--color-bg)',
        }}>
          <>
            <button
              type="button"
              onClick={showForm || showSuggestions ? handleInternalBack : handleGlobalBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: showForm || showSuggestions ? '22px' : '12px',
                padding: 0,
                background: 'transparent',
                border: 'none',
                color: FAQ_TEXT,
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: 'var(--font-family)',
                cursor: 'pointer',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--color-surface-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: FAQ_TEXT,
                  fontSize: '14px',
                  lineHeight: 1,
                }}
              >
                {'<'}
              </span>
              Volver
            </button>
          </>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '12px',
          }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px', color: FAQ_TEXT, lineHeight: 1.15 }}>
                Preguntas frecuentes
              </h1>
              <p style={{ color: FAQ_MUTED, fontSize: '12px', lineHeight: 1.35 }}>
                Administrá las respuestas automáticas de tu negocio. Seleccioná algunas preguntas sugeridas para comenzar o creá una nueva. Después podrás editarlas cuando quieras.
              </p>
            </div>
            {!showForm && !showSuggestions && allFaqs.filter(f => f.activa).length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={openCreateForm}
                style={{
                  flexShrink: 0,
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  background: brand.primaryGradient,
                  border: 'none',
                  boxShadow: brand.shadowAction,
                  textTransform: 'uppercase',
                  letterSpacing: 0,
                  fontSize: '10px',
                  fontWeight: 800,
                }}
              >
                <AppIcon name="plus" size={12} strokeWidth={2.5} />
                Crear nueva
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
                  {availableSuggestions.length === 0 ? (
                    <div style={{
                      padding: '20px 0',
                      color: 'var(--color-text-secondary)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                    }}>
                      No hay preguntas predefinidas disponibles. Podés crear tus propias preguntas haciendo clic en "Crear nueva".
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
                            minHeight: '44px',
                            padding: '9px 12px',
                            background: selected ? 'rgba(19, 168, 162, 0.2)' : brand.surface,
                            border: `1px solid ${selected ? FAQ_PRIMARY : FAQ_BORDER}`,
                            borderRadius: '12px',
                            boxShadow: FAQ_CARD_SHADOW,
                            color: selected ? FAQ_PRIMARY : FAQ_TEXT,
                            fontFamily: 'var(--font-family)',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ display: 'flex', gap: '11px', alignItems: 'center' }}>
                            {selected && (
                              <span
                                aria-hidden="true"
                                style={{
                                  width: '19px',
                                  height: '19px',
                                  borderRadius: '50%',
                                  background: FAQ_PRIMARY,
                                  color: '#fff',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  lineHeight: 1,
                                  flexShrink: 0,
                                }}
                              >
                                <AppIcon name="check" size={13} strokeWidth={2.6} />
                              </span>
                            )}
                            {!selected && (
                              <span
                                aria-hidden="true"
                                style={{
                                  width: '19px',
                                  height: '19px',
                                  borderRadius: '50%',
                                  border: `1px solid ${FAQ_BORDER}`,
                                  background: 'var(--color-bg-subtle)',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <span style={{ minWidth: 0 }}>
                              <strong style={{ display: 'block', fontSize: '11px', lineHeight: 1.25, overflowWrap: 'anywhere' }}>
                                {suggestion.pregunta}
                              </strong>
                            </span>
                          </span>
                        </button>
                      )
                    })
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '10px' }}>
                    <Button
                      type="button"
                      loading={formLoading}
                      disabled={availableSuggestions.length === 0}
                      onClick={handleAddSelectedSuggestions}
                      style={{
                        width: 'min(100%, 240px)',
                        height: '46px',
                        borderRadius: '11px',
                        background: brand.primaryGradient,
                        border: 'none',
                        boxShadow: brand.shadowAction,
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: 0,
                      }}
                    >
                      Agregar seleccionadas{selectedSuggestionIds.length > 0 ? ` (${selectedSuggestionIds.length})` : ''}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openCreateForm}
                      disabled={formLoading}
                      style={{
                        width: 'min(100%, 240px)',
                        height: '46px',
                        borderRadius: '9px',
                        borderColor: FAQ_PRIMARY,
                        color: FAQ_PRIMARY,
                        background: brand.surface,
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: 0,
                      }}
                    >
                      <AppIcon name="plus" size={13} strokeWidth={2.4} />
                      Crear nueva
                    </Button>
                    {allFaqs.filter(f => f.activa).length > 0 && (
                      <Button type="button" variant="ghost" fullWidth onClick={closeSuggestions} disabled={formLoading}>
                        Ir a tus FAQ
                      </Button>
                    )}
                  </div>
                </section>
              )}

              {!showSuggestions && !showForm && allFaqs.filter(f => f.activa).length === 0 ? (
                <section style={{
                  padding: '48px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                  textAlign: 'center',
                  background: brand.surface,
                  border: `1px solid ${FAQ_BORDER}`,
                  borderRadius: '16px',
                  boxShadow: FAQ_CARD_SHADOW,
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'rgba(19, 168, 162, 0.12)',
                    color: FAQ_PRIMARY,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    fontWeight: 400,
                  }}>?</div>
                  <h2 style={{ fontSize: '22px', margin: 0, padding: 10, color: FAQ_TEXT, fontWeight: 700 }}>Todavía no hay FAQs</h2>
                  <p style={{ color: FAQ_MUTED, fontSize: '14px', lineHeight: 1.5, margin: 0, padding: 8, maxWidth: '260px' }}>
                    Agregá preguntas frecuentes para ayudar a tus clientes y automatizar respuestas.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      type="button"
                      onClick={() => openSuggestions()}
                      style={{
                        width: 'auto',
                        height: 'auto',
                        margin: 12,
                        padding: '14px 40px',
                        borderRadius: 'var(--radius-md)',
                        background: brand.primaryGradient,
                        border: 'none',
                        boxShadow: brand.shadowAction,
                        fontSize: '14px',
                        fontWeight: 700,
                        letterSpacing: 1,
                      }}
                    >
                      COMENZAR
                    </Button>
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
                    onClick={() => openSuggestions()}
                    style={{
                      width: '100%',
                      alignSelf: 'center',
                      marginTop: '6px',
                      padding: '13px 14px',
                      background: brand.surface,
                      border: `1px solid ${FAQ_BORDER}`,
                      borderRadius: '10px',
                      color: FAQ_PRIMARY,
                      fontSize: '12px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-family)',
                      boxShadow: FAQ_CARD_SHADOW,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: '-2px', marginRight: '6px' }}>
                      <AppIcon name="plus" size={13} strokeWidth={2.4} />
                    </span>
                    Agregar más preguntas sugeridas
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
