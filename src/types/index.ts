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
  activa: boolean
  orden?: number
  sourceSuggestionId?: string
  createdAt: string
  updatedAt: string
}

export interface FAQFormData {
  pregunta: string
  respuesta: string
  categoriaId?: string
  categoria?: string
  nuevaCategoriaNombre?: string
  activa: boolean
  sourceSuggestionId?: string
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
  activa?: boolean
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
  activa?: boolean
}

export interface UpdateFAQPayload {
  categoriaId?: string
  pregunta?: string
  respuesta?: string
  activa?: boolean
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

// ===== CONSULTAS =====
export type EstadoConsultaNombre = 'nueva' | 'en_proceso' | 'respondida' | 'derivada' | 'cerrada'
export type CanalConsulta = 'web' | 'whatsapp'
export type TipoConsulta = 'general' | 'catalogo' | 'presupuesto' | 'soporte' | 'derivacion'
export type PrioridadConsulta = 'baja' | 'normal' | 'alta' | 'urgente'
export type EmisorMensaje = 'cliente' | 'usuario' | 'bot'

export interface EstadoConsulta {
  id: string
  nombre: EstadoConsultaNombre
  descripcion?: string | null
  fechaCreacion: string
}

export interface Mensaje {
  id: string
  consultaId: string
  mensajePadreId?: string | null
  emisor: EmisorMensaje
  contenido: string
  tipoMensaje?: string | null
  fechaCreacion: string
  fechaActualizacion: string
  leido: boolean
}

export interface Consulta {
  id: string
  usuarioId?: string | null
  sessionAnonimaId?: string | null
  clienteNombre?: string | null
  clienteTelefono?: string | null
  estadoConsultaId: string
  estadoConsulta: EstadoConsulta
  tipoConsulta?: TipoConsulta | string | null
  prioridad?: PrioridadConsulta | string | null
  canal?: CanalConsulta | string | null
  asunto?: string | null
  descripcion?: string | null
  derivadaA?: string | null
  fechaCreacion: string
  fechaActualizacion: string
  fechaCierre?: string | null
  mensajes: Mensaje[]
}

// ===== DASHBOARD =====
export interface DashboardStats {
  consultasPendientes: number
  presupuestosPendientes: number
  consultasResueltas: number
  porcentajeAutomatizacion: number
}
