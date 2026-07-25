import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { brand } from '../styles/brand'
import {
  createProductApi,
  getProductByIdApi,
  updateProductApi,
} from '../services/productApi'

interface ProductForm {
  nombre: string
  descripcion: string
  precio: string
  stock: string
  activo: boolean
  precioConsultar: boolean
  imagenActual: string
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const EMPTY_FORM: ProductForm = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '0',
  activo: true,
  precioConsultar: false,
  imagenActual: '',
}

export function ProductFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const isEditing = Boolean(id)
  const initialPriceMode = (location.state as { precioConsultar?: boolean } | null)?.precioConsultar ?? false
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<ProductForm>({ ...EMPTY_FORM, precioConsultar: initialPriceMode })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [removeImage, setRemoveImage] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!imageFile) return
    const objectUrl = URL.createObjectURL(imageFile)
    const updatePreview = window.setTimeout(() => setImagePreview(objectUrl), 0)
    return () => {
      window.clearTimeout(updatePreview)
      URL.revokeObjectURL(objectUrl)
    }
  }, [imageFile])

  useEffect(() => {
    if (!id) return
    let active = true

    const loadProduct = async () => {
      setIsLoading(true)
      setLoadError('')
      try {
        const product = await getProductByIdApi(id)
        if (!product) throw new Error('El producto no existe o no pertenece a tu catálogo.')
        if (!active) return
        setForm({
          nombre: product.nombre,
          descripcion: product.descripcion ?? '',
          precio: product.requiereCotizacion ? '' : String(Number(product.precio)),
          stock: String(product.stock),
          activo: product.activo,
          precioConsultar: product.requiereCotizacion,
          imagenActual: product.urlImagen ?? '',
        })
      } catch (caught) {
        if (active) setLoadError(caught instanceof Error ? caught.message : 'No pudimos cargar el producto.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadProduct()
    return () => { active = false }
  }, [id])

  const updateField = (field: 'nombre' | 'descripcion' | 'precio' | 'stock') =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(current => ({ ...current, [field]: event.target.value }))

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFormError('')
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      setFormError('La imagen debe ser JPG, PNG o WEBP.')
      event.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setFormError('La imagen no puede superar los 5 MB.')
      event.target.value = ''
      return
    }
    setImageFile(file)
    setImagePreview('')
    setRemoveImage(false)
  }

  const price = Number(form.precio)
  const stock = Number(form.stock)
  const hasValidPrice = form.precioConsultar || (form.precio.trim() !== '' && Number.isFinite(price) && price > 0)
  const hasValidStock = form.stock.trim() !== '' && Number.isInteger(stock) && stock >= 0
  const canSave = form.nombre.trim() !== '' && form.nombre.trim().length <= 200
    && form.descripcion.trim().length <= 2000 && hasValidPrice && hasValidStock
    && !isSubmitting && !isLoading

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSave || isSubmitting) return
    setIsSubmitting(true)
    setFormError('')
    try {
      if (isEditing && id) {
        await updateProductApi(id, {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          ...(!form.precioConsultar ? { precio: price } : {}),
          stock,
          activo: form.activo,
          ...(removeImage ? { urlImagen: null } : {}),
          ...(imageFile ? { imagen: imageFile } : {}),
        })
        navigate('/catalogo', { state: { successMessage: 'Producto actualizado correctamente.' } })
      } else {
        await createProductApi({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
          ...(!form.precioConsultar ? { precio: price } : {}),
          stock,
          activo: form.activo,
          requiereCotizacion: form.precioConsultar,
          ...(imageFile ? { imagen: imageFile } : {}),
        })
        navigate('/catalogo', { state: { successMessage: 'Producto creado correctamente.' } })
      }
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'No pudimos guardar el producto.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    height: 48,
    padding: '0 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    fontSize: 15,
    color: 'var(--color-text-primary)',
    background: 'var(--color-bg)',
    width: '100%',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }
  const displayedImage = imagePreview || (!removeImage ? form.imagenActual : '')

  if (isLoading) {
    return <div role="status" style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', background: 'var(--color-bg)' }}>Cargando producto…</div>
  }

  if (loadError) {
    return (
      <div role="alert" style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#DC2626' }}>{loadError}</p>
          <button onClick={() => navigate('/catalogo')} style={{ padding: '10px 18px', borderRadius: 8, color: '#fff', background: brand.primaryGradient }}>VOLVER AL CATÁLOGO</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100svh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: 18, color: 'var(--color-text-primary)' }}>{isEditing ? 'Editar producto' : 'Agregar al catálogo'}</h1>
      </header>

      <form onSubmit={handleSave} style={{ width: '100%', maxWidth: 680, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
        <button type="button" onClick={() => navigate('/catalogo')} style={{ alignSelf: 'flex-start', color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 700 }}>‹ Volver</button>

        <div style={{ minHeight: 34, padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(19,168,162,.22)', borderRadius: 99, background: 'rgba(19,168,162,.08)', color: 'var(--color-primary)' }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{form.precioConsultar ? 'Precio a convenir' : 'Precio fijo'}</span>
          {!isEditing && (
            <button type="button" onClick={() => setForm(current => ({ ...current, precioConsultar: !current.precioConsultar, precio: '' }))} style={{ color: 'var(--color-primary)', fontSize: 11, textDecoration: 'underline' }}>Cambiar</button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>Imagen (opcional)</label>
          <button type="button" onClick={() => fileInputRef.current?.click()} style={{ border: '1.5px dashed var(--color-border)', borderRadius: 12, height: 160, display: 'grid', placeItems: 'center', background: 'var(--color-bg-subtle)', overflow: 'hidden' }}>
            {displayedImage ? <img src={displayedImage} alt="Vista previa del producto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'var(--color-text-secondary)' }}>Subir JPG, PNG o WEBP · Máx. 5 MB</span>}
          </button>
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleImageChange} style={{ display: 'none' }} />
          {displayedImage && <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); setRemoveImage(true); if (fileInputRef.current) fileInputRef.current.value = '' }} style={{ alignSelf: 'flex-start', color: '#DC2626', fontSize: 12 }}>Quitar imagen</button>}
        </div>

        <label style={labelStyle}>Nombre del producto
          <input value={form.nombre} onChange={updateField('nombre')} maxLength={200} required style={{ ...inputStyle, marginTop: 6 }} />
        </label>

        <label style={labelStyle}>Descripción
          <textarea value={form.descripcion} onChange={updateField('descripcion')} maxLength={2000} rows={4} style={{ ...inputStyle, height: 'auto', paddingTop: 12, marginTop: 6, resize: 'vertical' }} />
        </label>

        {!form.precioConsultar && (
          <label style={labelStyle}>Precio
            <input value={form.precio} onChange={updateField('precio')} type="number" min="0.01" step="0.01" required style={{ ...inputStyle, marginTop: 6 }} />
          </label>
        )}

        <label style={labelStyle}>Stock
          <input value={form.stock} onChange={updateField('stock')} type="number" min="0" step="1" required style={{ ...inputStyle, marginTop: 6 }} />
        </label>

        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" checked={form.activo} onChange={event => setForm(current => ({ ...current, activo: event.target.checked }))} />
          Producto activo
        </label>

        {formError && <p role="alert" style={{ margin: 0, padding: 12, borderRadius: 8, color: '#B91C1C', background: '#FEE2E2' }}>{formError}</p>}

        <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
          <button type="button" disabled={isSubmitting} onClick={() => navigate('/catalogo')} style={{ flex: 1, height: 48, border: '1.5px solid #13A8A2', borderRadius: 8, color: 'var(--color-primary)' }}>CANCELAR</button>
          <button type="submit" disabled={!canSave} style={{ flex: 1, height: 48, borderRadius: 8, color: '#fff', fontWeight: 700, background: canSave ? brand.primaryGradient : '#AAB2BD', cursor: canSave ? 'pointer' : 'not-allowed' }}>{isSubmitting ? 'GUARDANDO…' : 'GUARDAR'}</button>
        </div>
      </form>
    </div>
  )
}
