import { useState, type FormEvent } from 'react'
import type { FAQ } from '../../types'
import type { FAQFormData } from '../../services/faqStorage'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

interface FaqFormProps {
  faq?: FAQ
  loading?: boolean
  onSubmit: (data: FAQFormData) => Promise<void>
  onCancel: () => void
}

export function FaqForm({ faq, loading = false, onSubmit, onCancel }: FaqFormProps) {
  const [form, setForm] = useState<FAQFormData>({
    pregunta: faq?.pregunta ?? '',
    respuesta: faq?.respuesta ?? '',
    categoria: faq?.categoria ?? '',
    activa: faq?.activa ?? true,
  })
  const [errors, setErrors] = useState<{ pregunta?: string; respuesta?: string }>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = {
      pregunta: form.pregunta.trim() ? undefined : 'La pregunta es obligatoria.',
      respuesta: form.respuesta.trim() ? undefined : 'La respuesta es obligatoria.',
    }
    setErrors(nextErrors)
    if (nextErrors.pregunta || nextErrors.respuesta) return

    await onSubmit(form)
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
          Esta información podrá ser utilizada por el chatbot público.
        </p>
      </div>

      <Input
        label="Pregunta *"
        placeholder="Ej: ¿Cuáles son los medios de pago?"
        value={form.pregunta}
        error={errors.pregunta}
        onChange={event => {
          setForm(current => ({ ...current, pregunta: event.target.value }))
          if (errors.pregunta) setErrors(current => ({ ...current, pregunta: undefined }))
        }}
      />

      <Textarea
        label="Respuesta *"
        placeholder="Escribí una respuesta clara y breve para tus clientes."
        value={form.respuesta}
        error={errors.respuesta}
        onChange={event => {
          setForm(current => ({ ...current, respuesta: event.target.value }))
          if (errors.respuesta) setErrors(current => ({ ...current, respuesta: undefined }))
        }}
      />

      <Input
        label="Categoría"
        placeholder="Ej: Pagos, envíos o productos"
        value={form.categoria}
        hint="Es opcional y te ayuda a organizar las preguntas."
        onChange={event => setForm(current => ({ ...current, categoria: event.target.value }))}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
        }}>
          Estado inicial
        </span>
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
