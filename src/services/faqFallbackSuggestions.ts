import type { FAQFormData } from '../types'

export interface FAQFallbackSuggestion {
  key: string
  pregunta: string
  respuesta: string
  categoria: string
}

// Plantillas transitorias de interfaz. Al seleccionarlas se persisten mediante
// POST /faqs; nunca se usan como FAQ reales ni se guardan localmente.
export const FAQ_FALLBACK_SUGGESTIONS: FAQFallbackSuggestion[] = [
  {
    key: 'payment-methods',
    pregunta: '¿Qué medios de pago aceptan?',
    respuesta: 'Aceptamos efectivo, transferencia bancaria y pagos con tarjeta. Podés editar esta respuesta para detallar promociones, cuotas o billeteras virtuales.',
    categoria: 'Pagos',
  },
  {
    key: 'shipping',
    pregunta: '¿Realizan envíos?',
    respuesta: 'Sí, realizamos envíos. Te recomendamos editar esta respuesta para indicar zonas, costos y tiempos estimados de entrega.',
    categoria: 'Envíos',
  },
  {
    key: 'opening-hours',
    pregunta: '¿Cuál es el horario de atención?',
    respuesta: 'Nuestro horario de atención está publicado en la información del negocio. Podés editar esta respuesta con días y horarios específicos.',
    categoria: 'Información general',
  },
  {
    key: 'stock',
    pregunta: '¿Tienen stock disponible?',
    respuesta: 'El stock puede variar según el producto. Escribinos con el producto que te interesa y te confirmamos disponibilidad.',
    categoria: 'Productos',
  },
  {
    key: 'wholesale',
    pregunta: '¿Realizan ventas por mayor?',
    respuesta: 'Podemos evaluar pedidos por mayor. Editá esta respuesta para explicar mínimos de compra, descuentos o condiciones comerciales.',
    categoria: 'Ventas',
  },
  {
    key: 'warranty',
    pregunta: '¿Los productos tienen garantía?',
    respuesta: 'Algunos productos pueden tener garantía. Te recomendamos editar esta respuesta para aclarar plazos, condiciones y cómo realizar un reclamo.',
    categoria: 'Garantía',
  },
]

export function mapFallbackSuggestionToFormData(suggestion: FAQFallbackSuggestion): FAQFormData {
  return {
    pregunta: suggestion.pregunta,
    respuesta: suggestion.respuesta,
    categoria: suggestion.categoria,
    nuevaCategoriaNombre: suggestion.categoria,
    activa: true,
  }
}
