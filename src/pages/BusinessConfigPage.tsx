import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

interface FormData {
  nombre: string
  descripcion: string
  horario: string
  telefono: string
  mensajeBienvenida: string
  respuestaDerivacion: string
  logo: string
}

const INITIAL: FormData = {
  nombre: '',
  descripcion: '',
  horario: '',
  telefono: '',
  mensajeBienvenida: '',
  respuestaDerivacion: '',
  logo: '',
}

const EXAMPLES: Omit<FormData, 'logo'> = {
  nombre: 'Bella Luna',
  descripcion: 'Peluquería unisex especializada en cortes modernos, coloración y tratamientos capilares.',
  horario: 'Lun a Sáb de 9:00 a 20:00 hs',
  telefono: '+54 9 11 5555-1234',
  mensajeBienvenida: '¡Hola! Soy el asistente de Bella Luna 💇. Podés consultarme sobre turnos, precios y servicios. ¿En qué te ayudo?',
  respuestaDerivacion: 'Perfecto, te voy a poner en contacto con uno de nuestros asesores. ¡En breve se comunican con vos!',
}

function UseExampleButton({ onClick, disabled, hint }: { onClick: () => void; disabled?: boolean; hint?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? hint : undefined}
      style={{
        alignSelf: 'flex-end',
        fontSize: '11px',
        color: disabled ? 'var(--color-text-secondary)' : 'var(--color-primary)',
        border: 'none',
        background: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-family)',
        padding: '2px 0',
        fontWeight: 600,
        letterSpacing: '0.3px',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      Usar ejemplo ↗
    </button>
  )
}

const textareaStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  fontSize: '15px',
  fontFamily: 'var(--font-family)',
  color: 'var(--color-text-primary)',
  resize: 'vertical',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
}

export function BusinessConfigPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { saveBusiness, business, updateBusiness } = useBusiness()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEdit = !!business

  const [form, setForm] = useState<FormData>(
    business
      ? {
          nombre: business.nombre,
          descripcion: business.descripcion,
          horario: business.horario,
          telefono: business.telefono,
          mensajeBienvenida: business.mensajeBienvenida,
          respuestaDerivacion: business.respuestaDerivacion,
          logo: business.logo ?? '',
        }
      : INITIAL
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  const useExample = (field: keyof typeof EXAMPLES) =>
    setForm(prev => ({ ...prev, [field]: EXAMPLES[field] }))

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setForm(prev => ({ ...prev, logo: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.nombre || !form.descripcion) {
      setError('El nombre y la descripción son obligatorios.')
      return
    }
    if (!user) return

    setLoading(true)
    await new Promise(r => setTimeout(r, 700))

    if (isEdit) {
      updateBusiness(form)
    } else {
      saveBusiness({ ...form, userId: user.id, rubro: user.rubro ?? '' })
    }

    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', textAlign: 'center', gap: '20px',
      }}>
        <div style={{
          width: 80, height: 80,
          background: 'rgba(19,171,162,0.1)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '40px',
        }}>
          🤖✅
        </div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
            {isEdit ? '¡Cambios guardados!' : '¡Cuenta creada correctamente!'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            {isEdit
              ? 'Tu negocio fue actualizado.'
              : 'Ya terminamos. Ahora configurá tu negocio para comenzar a usar EmprendeBot.'}
          </p>
        </div>
        <Button fullWidth size="lg" onClick={() => navigate('/dashboard')}>
          CONTINUAR →
        </Button>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100svh',
      background: 'var(--color-bg)',
    }}>
      {/* Back */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isEdit && (
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '14px', color: 'var(--color-text-secondary)',
              border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-family)',
            }}
          >
            ←
          </button>
        )}
        <span style={{ fontSize: '15px', fontWeight: 600 }}>
          {isEdit ? 'Editar negocio' : 'Crear cuenta'}
        </span>
      </div>

      <div style={{ flex: 1, padding: '0 24px 40px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
          Configurá tu negocio
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '28px' }}>
          {isEdit
            ? 'Podés editar la información de tu negocio cuando quieras.'
            : 'Solo una vez. Podés editarlo después desde configuración.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={labelStyle}>Logo o imagen del negocio</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 72, height: 72,
                  borderRadius: '50%',
                  border: '2px dashed var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--color-bg-subtle)',
                }}
              >
                {form.logo
                  ? <img src={form.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '28px' }}>🏪</span>
                }
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    fontSize: '13px', fontWeight: 600,
                    color: 'var(--color-primary)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                    padding: '6px 14px',
                  }}
                >
                  {form.logo ? 'Cambiar imagen' : 'Subir imagen'}
                </button>
                {form.logo && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, logo: '' }))}
                    style={{
                      fontSize: '12px', color: 'var(--color-error)',
                      border: 'none', background: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-family)', padding: 0, textAlign: 'left',
                    }}
                  >
                    Eliminar
                  </button>
                )}
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  JPG, PNG o SVG · máx. 2 MB
                </span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/svg+xml,image/webp"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Nombre */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Nombre del negocio *</label>
            <Input
              placeholder="Ej: Bella Luna"
              value={form.nombre}
              onChange={set('nombre')}
            />
          </div>

          {/* Descripción */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Descripción breve *</label>
              <UseExampleButton onClick={() => useExample('descripcion')} />
            </div>
            <textarea
              value={form.descripcion}
              onChange={set('descripcion')}
              placeholder="Ej: Peluquería unisex especializada en cortes modernos, coloración y tratamientos capilares."
              rows={3}
              style={textareaStyle}
            />
          </div>

          {/* Horario */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Horario de atención</label>
              <UseExampleButton onClick={() => useExample('horario')} />
            </div>
            <Input
              placeholder="Ej: Lun a Sáb de 9:00 a 20:00 hs"
              value={form.horario}
              onChange={set('horario')}
            />
          </div>

          {/* Teléfono */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Teléfono de contacto</label>
            <Input
              type="tel"
              placeholder="Ej: +54 9 11 5555-1234"
              value={form.telefono}
              onChange={set('telefono')}
            />
          </div>

          {/* Mensaje de bienvenida */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Mensaje de bienvenida del chatbot</label>
              <UseExampleButton
                disabled={!form.nombre}
                hint="Primero completá el nombre del negocio"
                onClick={() =>
                  setForm(prev => ({
                    ...prev,
                    mensajeBienvenida: `¡Hola! Soy el asistente de ${prev.nombre}. Podés consultarme sobre productos, precios y horarios. ¿En qué te puedo ayudar?`,
                  }))
                }
              />
            </div>
            <textarea
              value={form.mensajeBienvenida}
              onChange={set('mensajeBienvenida')}
              placeholder={`Ej: ¡Hola! Soy el asistente de ${form.nombre || 'tu negocio'}. ¿En qué te puedo ayudar?`}
              rows={3}
              style={textareaStyle}
            />
          </div>

          {/* Respuesta derivación */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Respuesta al derivar a asesor</label>
              <UseExampleButton onClick={() => useExample('respuestaDerivacion')} />
            </div>
            <textarea
              value={form.respuestaDerivacion}
              onChange={set('respuestaDerivacion')}
              placeholder="Ej: Perfecto, te voy a poner en contacto con uno de nuestros asesores. ¡En breve se comunican!"
              rows={2}
              style={textareaStyle}
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: 'var(--color-error)' }}>{error}</p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {isEdit ? 'GUARDAR CAMBIOS' : 'IR A MI PANEL →'}
          </Button>
        </form>
      </div>
    </div>
  )
}
