// ===== USER =====
export interface User {
  id: string
  email: string
  nombre: string
  slug: string
}

// ===== BUSINESS =====
export type Rubro =
  | 'gastronomia'
  | 'peluqueria'
  | 'indumentaria'
  | 'tecnologia'
  | 'servicios'
  | 'salud'
  | 'educacion'
  | 'otro'

export interface Product {
  id: string
  nombre: string
  precio?: number
  descripcion?: string
  disponible: boolean
}

export interface FAQ {
  id: string
  businessId: string
  categoriaId?: string
  pregunta: string
  respuesta: string
  categoria?: string
  keywords?: string
  // TODO: Persistir en backend cuando agregue soporte para activa/inactiva.
  activa: boolean
  // TODO: Persistir en backend cuando agregue soporte para orden manual.
  orden: number
  createdAt: string
  updatedAt: string
}

export interface FAQCategory {
  id: string
  nombre: string
  createdAt?: string
}

export interface FAQApi {
  id: string
  botId: string
  categoriaId: string
  pregunta: string
  respuesta: string
  keywords: string | null
  fechaCreacion: string
  fechaModificacion: string
  categoria?: {
    id: string
    nombre: string
  }
}

export interface FAQCategoryApi {
  id: string
  botId?: string
  nombre: string
  fechaCreacion?: string
}

export interface CreateFAQPayload {
  categoriaId: string
  pregunta: string
  respuesta: string
  keywords?: string
}

export interface UpdateFAQPayload {
  categoriaId?: string
  pregunta?: string
  respuesta?: string
  keywords?: string
}

export interface Business {
  id: string
  userId: string
  nombre: string
  logo?: string
  descripcion: string
  horario: string
  telefono: string
  mensajeBienvenida: string
  respuestaDerivacion: string
  rubro: Rubro | ''
  productos: Product[]
  faqCategories?: FAQCategory[]
  faq: FAQ[]
  slug: string
}

// ===== CHAT =====
export type MessageRole = 'bot' | 'user'
export type AwaitingInput = 'budget' | 'contact' | 'faq-selection'

export interface Message {
  id: string
  role: MessageRole
  text: string
  timestamp: Date
  quickReplies?: string[]
}

export interface ChatSession {
  sessionId: string
  businessSlug: string
  messages: Message[]
}

// ===== DASHBOARD =====
export interface DashboardStats {
  consultasPendientes: number
  presupuestosPendientes: number
  consultasResueltas: number
  porcentajeAutomatizacion: number
}
