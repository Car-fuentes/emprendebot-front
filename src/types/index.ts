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
  pregunta: string
  respuesta: string
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
  faq: FAQ[]
  slug: string
}

// ===== CHAT =====
export type MessageRole = 'bot' | 'user'

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
