import { apiRequest } from './apiClient'
import { mapFaqApiToUi } from './faqMappers'
import type { Business, FAQ, FAQApi, Rubro } from '../types'

interface PublicFaqsResponse {
  success: boolean
  faqs: FAQApi[]
}

interface PublicProductApi {
  id: string
  nombre: string
  descripcion?: string | null
  precio?: number | string | null
  precioConsultar?: boolean
  imagen?: string | null
  disponible?: boolean
}

interface PublicBotData {
  botId: string
  nombre: string
  descripcion?: string | null
  horario?: string | null
  telefono?: string | null
  logo?: string | null
  mensajeBienvenida?: string | null
  respuestaDerivacion?: string | null
  colorPrimario?: string | null
  colorSecundario?: string | null
  rubroId?: string | null
  rubroNombre?: string | null
  slug?: string | null
  productos?: PublicProductApi[]
}

interface PublicChatInitResponse {
  success: boolean
  data: {
    botData?: PublicBotData
    botId?: string
    nombre?: string
    mensajeBienvenida?: string
    colorPrimario?: string
    colorSecundario?: string
  }
}

const toRubro = (value?: string | null): Rubro | '' => {
  const normalized = value?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const supported: Rubro[] = [
    'gastronomia', 'peluqueria', 'indumentaria', 'tecnologia', 'servicios',
    'salud', 'educacion', 'artesanias', 'oficios', 'otro',
  ]
  return supported.includes(normalized as Rubro) ? normalized as Rubro : ''
}

export async function getPublicBusinessApi(slug: string): Promise<Business> {
  const response = await apiRequest<PublicChatInitResponse>(
    `/public/chatbot/${encodeURIComponent(slug)}/init`,
    { auth: false },
  )
  const data = response.data
  const bot = data.botData
  const botId = bot?.botId ?? data.botId
  if (!botId) throw new Error('La respuesta pública del chatbot no contiene un identificador.')

  return {
    id: botId,
    userId: '',
    nombre: bot?.nombre ?? data.nombre ?? 'Asistente virtual',
    logo: bot?.logo ?? undefined,
    descripcion: bot?.descripcion ?? '',
    horario: bot?.horario ?? '',
    telefono: bot?.telefono ?? '',
    mensajeBienvenida: bot?.mensajeBienvenida
      ?? data.mensajeBienvenida
      ?? '¡Hola! ¿En qué te puedo ayudar?',
    respuestaDerivacion: bot?.respuestaDerivacion ?? 'Te voy a conectar con un asesor en breve.',
    rubro: toRubro(bot?.rubroNombre),
    rubroId: bot?.rubroId ?? undefined,
    rubroNombre: bot?.rubroNombre ?? undefined,
    productos: (bot?.productos ?? []).map(producto => ({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? undefined,
      precio: producto.precio == null ? undefined : Number(producto.precio),
      precioConsultar: producto.precioConsultar ?? false,
      imagen: producto.imagen ?? undefined,
      disponible: producto.disponible ?? true,
    })),
    faq: [],
    slug: bot?.slug ?? slug,
    colorPrimario: bot?.colorPrimario ?? data.colorPrimario,
    colorSecundario: bot?.colorSecundario ?? data.colorSecundario,
  }
}

export async function getPublicFaqsApi(slug: string): Promise<FAQ[]> {
  const response = await apiRequest<PublicFaqsResponse>(
    `/public/chatbot/${slug}/faqs`,
    { auth: false },
  )
  return response.faqs.map(mapFaqApiToUi)
}
