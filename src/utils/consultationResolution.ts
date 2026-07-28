import type { Consulta } from '../types'

export type ConsultationResolutionReason =
  | 'human_handoff'
  | 'quote'
  | 'contact_data'
  | 'human_intervention'
  | 'bot_resolved'
  | 'unknown'

export interface ConsultationResolution {
  requiresHumanAction: boolean
  resolvedByBot: boolean
  reason: ConsultationResolutionReason
}

export interface ConsultationResolutionContext {
  budgetConsultationIds: ReadonlySet<string>
  budgetDataComplete: boolean
}

const normalize = (value?: string | null) =>
  value?.trim().toUpperCase().replace(/[\s-]+/g, '_') ?? ''

export function classifyConsultationResolution(
  consulta: Consulta,
  context: ConsultationResolutionContext,
): ConsultationResolution {
  const tipoConsulta = normalize(consulta.tipoConsulta)
  const cerradaPor = normalize(consulta.cerradaPor)
  const hasEntrepreneurMessage = consulta.mensajes.some(mensaje => {
    const emisor = normalize(mensaje.emisor)
    return emisor === 'EMPRENDEDOR' || emisor === 'USUARIO'
  })

  if (consulta.derivada || tipoConsulta === 'DERIVAR_HUMANO') {
    return { requiresHumanAction: true, resolvedByBot: false, reason: 'human_handoff' }
  }

  if (cerradaPor === 'EMPRENDEDOR' || hasEntrepreneurMessage) {
    return { requiresHumanAction: true, resolvedByBot: false, reason: 'human_intervention' }
  }

  if (
    context.budgetConsultationIds.has(consulta.id)
    || tipoConsulta === 'PRESUPUESTO'
    || tipoConsulta === 'COTIZACION'
  ) {
    return { requiresHumanAction: true, resolvedByBot: false, reason: 'quote' }
  }

  if (consulta.clienteNombre || consulta.clienteTelefono) {
    return { requiresHumanAction: true, resolvedByBot: false, reason: 'contact_data' }
  }

  if (!context.budgetDataComplete) {
    return { requiresHumanAction: true, resolvedByBot: false, reason: 'unknown' }
  }

  return { requiresHumanAction: false, resolvedByBot: true, reason: 'bot_resolved' }
}
