import { useState, type CSSProperties, type FormEvent } from 'react'
import type { FAQ, FAQCategory } from '../../types'
import type { FAQFormData } from '../../services/faqStorage'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

interface FaqFormProps {
  faq?: FAQ
  categories: FAQCategory[]
  loading?: boolean
  onSubmit: (data: FAQFormData) => Promise<void>
  onCancel: () => void
}

const labelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
}

export function FaqForm({ faq, categories, loading = false, onSubmit, onCancel }: FaqFormProps) {
  const [categoryMode, setCategoryMode] = useState<'existing' | 'new'>(
    faq?.categoriaId || categories.length > 0 ? 'existing' : 'new',
  )
  const [form, setForm] = useState<FAQFormData>({
    pregunta: faq?.pregunta ?? '',
    respuesta: faq?.respuesta ?? '',
    categoriaId: faq?.categoriaId ?? '',
    categoria: faq?.categoria ?? '',
    nuevaCategoriaNombre: '',
    keywords: faq?.keywords ?? '',
    activa: faq?.activa ?? true,
  })
  const [errors, setErrors] = useState<{ pregunta?: string; respuesta?: string; categoria?: string }>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const hasCategory = categoryMode === 'existing'
      ? Boolean(form.categoriaId)
      : Boolean(form.nuevaCategoriaNombre?.trim())
    const nextErrors = {
      pregunta: form.pregunta.trim() ? undefined : 'La pregunta es obligatoria.',
      respuesta: form.respuesta.trim() ? undefined : 'La respuesta es obligatoria.',
      categoria: hasCategory ? undefined : 'Selecciona o crea una categoria.',
    }
    setErrors(nextErrors)
    if (nextErrors.pregunta || nextErrors.respuesta || nextErrors.categoria) return

    await onSubmit({
      ...form,
      categoriaId: categoryMode === 'existing' ? form.categoriaId : undefined,
      categoria: categoryMode === 'existing'
        ? categories.find(category => category.id === form.categoriaId)?.nombre
        : form.nuevaCategoriaNombre,
      nuevaCategoriaNombre: categoryMode === 'new' ? form.nuevaCategoriaNombre : undefined,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        padding: '18px',
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div>
        <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '3px' }}>
          {faq ? 'Editar pregunta frecuente' : 'Nueva pregunta frecuente'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Esta informacion podra ser utilizada por el chatbot publico.
        </p>
      </div>

      <Input
        label="Pregunta *"
        placeholder="Ej: Cuales son los medios de pago?"
        value={form.pregunta}
        error={errors.pregunta}
        onChange={event => {
          setForm(current => ({ ...current, pregunta: event.target.value }))
          if (errors.pregunta) setErrors(current => ({ ...current, pregunta: undefined }))
        }}
      />

      <Textarea
        label="Respuesta *"
        placeholder="Escribi una respuesta clara y breve para tus clientes."
        value={form.respuesta}
        error={errors.respuesta}
        onChange={event => {
          setForm(current => ({ ...current, respuesta: event.target.value }))
          if (errors.respuesta) setErrors(current => ({ ...current, respuesta: undefined }))
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={labelStyle}>Categoria *</label>

        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Chip
              type="button"
              selected={categoryMode === 'existing'}
              onClick={() => setCategoryMode('existing')}
            >
              Existente
            </Chip>
            <Chip
              type="button"
              selected={categoryMode === 'new'}
              onClick={() => setCategoryMode('new')}
            >
              Nueva
            </Chip>
          </div>
        )}

        {categoryMode === 'existing' && categories.length > 0 ? (
          <>
            <select
              aria-label="Categoria de la FAQ"
              value={form.categoriaId ?? ''}
              onChange={event => {
                const category = categories.find(item => item.id === event.target.value)
                setForm(current => ({
                  ...current,
                  categoriaId: category?.id ?? '',
                  categoria: category?.nombre ?? '',
                }))
                if (errors.categoria) setErrors(current => ({ ...current, categoria: undefined }))
              }}
              style={{
                height: '52px',
                padding: '0 16px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${errors.categoria ? 'var(--color-error)' : 'var(--color-border)'}`,
                fontSize: '15px',
                fontFamily: 'var(--font-family)',
                color: form.categoriaId ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                background: 'var(--color-bg)',
                outline: 'none',
                width: '100%',
              }}
            >
              <option value="">Selecciona una categoria</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.nombre}</option>
              ))}
            </select>
            {errors.categoria && (
              <span style={{ color: 'var(--color-error)', fontSize: '12px' }}>{errors.categoria}</span>
            )}
          </>
        ) : (
          <Input
            placeholder="Ej: Pagos, envios o productos"
            value={form.nuevaCategoriaNombre}
            error={errors.categoria}
            hint="Se creara como categoria real antes de enviar la FAQ al backend."
            onChange={event => {
              setForm(current => ({ ...current, nuevaCategoriaNombre: event.target.value }))
              if (errors.categoria) setErrors(current => ({ ...current, categoria: undefined }))
            }}
          />
        )}
      </div>

      <Input
        label="Keywords"
        placeholder="Ej: pagos, tarjetas, transferencia"
        value={form.keywords}
        hint="Opcional. Preparado para enviarse al backend."
        onChange={event => setForm(current => ({ ...current, keywords: event.target.value }))}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        <span style={labelStyle}>Estado inicial</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Chip
            type="button"
            selected={form.activa}
            onClick={() => setForm(current => ({ ...current, activa: true }))}
          >
            Activa
          </Chip>
          <Chip
            type="button"
            selected={!form.activa}
            onClick={() => setForm(current => ({ ...current, activa: false }))}
          >
            Inactiva
          </Chip>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <Button type="button" variant="outline" fullWidth onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" fullWidth loading={loading}>
          {faq ? 'Guardar' : 'Crear FAQ'}
        </Button>
      </div>
    </form>
  )
}
