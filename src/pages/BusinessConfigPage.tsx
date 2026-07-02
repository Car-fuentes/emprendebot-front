import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { apiRequest } from '../services/apiClient'
import { brand } from '../styles/brand'
import type { Rubro } from '../types'

interface BotConfigResponse {
  success: boolean
  configuracion: {
    nombreNegocio: string
    mensajeBienvenida: string
  }
}

const RUBROS: { value: Rubro; label: string }[] = [
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'peluqueria', label: 'Peluquería / Estética' },
  { value: 'indumentaria', label: 'Indumentaria' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'servicios', label: 'Servicios profesionales' },
  { value: 'salud', label: 'Salud / Bienestar' },
  { value: 'educacion', label: 'Educación' },
  { value: 'artesanias', label: 'Artesanías' },
  { value: 'oficios', label: 'Oficios' },
  { value: 'otro', label: 'Otro' },
]

interface FormData {
  nombre: string
  rubro?: Rubro | ''
  descripcion: string
  horario: string
  telefono: string
  mensajeBienvenida: string
  respuestaDerivacion: string
  logo: string
}

const INITIAL: FormData = {
  nombre: '',
  rubro: '',
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
          rubro: business.rubro ?? '',
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
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Cargar nombre y mensaje de bienvenida desde el backend al entrar en modo edición
  useEffect(() => {
    if (!isEdit) return
    apiRequest<BotConfigResponse>('/bot').then(data => {
      setForm(prev => ({
        ...prev,
        nombre: data.configuracion.nombreNegocio || prev.nombre,
        mensajeBienvenida: data.configuracion.mensajeBienvenida || prev.mensajeBienvenida,
      }))
    }).catch(() => {/* Si falla usa el localStorage */})
  }, [isEdit])

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
    try {
      // Campos soportados por el backend
      await apiRequest('/bot', {
        method: 'PUT',
        body: JSON.stringify({
          nombreNegocio: form.nombre,
          mensajeBienvenida: form.mensajeBienvenida || undefined,
        }),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar en el servidor.')
      setLoading(false)
      return
    }

    // Campos pendientes de soporte en backend → localStorage
    if (isEdit) {
      updateBusiness(form)
    } else {
      saveBusiness({ ...form, userId: user.id, rubro: user.rubro ?? '' })
    }

    setLoading(false)
    setShowSuccessModal(true)
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100svh',
      background: 'var(--color-bg)',
    }}>
      {/* Modal negocio creado */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '75%',
            maxWidth: 360,
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 24px 28px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '12px',
            position: 'relative',
            textAlign: 'center',
          }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                position: 'absolute', top: 12, right: 14,
                background: 'none', border: 'none',
                fontSize: '18px', cursor: 'pointer',
                color: 'var(--color-text-secondary)',
              }}
            >
              ✕
            </button>

            <img src="/negocioCreado.jpeg" alt="Negocio creado" style={{ width: '80%', maxWidth: 200 }} />

            <h2 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
              ¡Todo listo!
            </h2>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Tu negocio y tu asistente virtual fueron configurados correctamente.
            </p>

            <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              Ahora ya podés comenzar a{' '}
              <strong style={{ color: 'var(--color-primary)' }}>disfrutar de EmprendeBot.</strong>
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                marginTop: '8px',
                width: '100%', height: 52,
                background: brand.primaryGradient,
                color: '#fff', border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-family)',
                letterSpacing: '0.5px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              IR AL PANEL →
            </button>
          </div>
        </div>
      )}

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

          {/* Rubro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Rubro de tu negocio</label>
            <select
              value={form.rubro}
              onChange={e => setForm(prev => ({ ...prev, rubro: e.target.value as Rubro }))}
              style={{
                height: '52px', padding: '0 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '15px', fontFamily: 'var(--font-family)',
                color: form.rubro ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                background: 'var(--color-bg)', outline: 'none',
                width: '100%', cursor: 'pointer',
              }}
            >
              <option value="">Seleccioná</option>
              {RUBROS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
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

          <Button type="submit" fullWidth size="lg" loading={loading} style={{ background: brand.primaryGradient, borderRadius: 'var(--radius-md)', border: 'none' }}>
            {isEdit ? 'GUARDAR CAMBIOS' : 'CREAR NEGOCIO'}
          </Button>
        </form>
      </div>
    </div>
  )
}
