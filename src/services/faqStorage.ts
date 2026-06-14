import type { Business, FAQ } from '../types'
import {
  getStoredBusinesses,
  saveStoredBusinesses,
  updateStoredBusiness,
} from './businessStorage'

export interface FAQFormData {
  pregunta: string
  respuesta: string
  categoria?: string
  activa: boolean
}

interface FAQMutationResult {
  faq: FAQ
  faqs: FAQ[]
}

export type FAQMoveDirection = 'up' | 'down'

function normalizeFaqData(data: FAQFormData): FAQFormData {
  const pregunta = data.pregunta.trim()
  const respuesta = data.respuesta.trim()

  if (!pregunta) throw new Error('La pregunta es obligatoria.')
  if (!respuesta) throw new Error('La respuesta es obligatoria.')

  return {
    pregunta,
    respuesta,
    categoria: data.categoria?.trim() || undefined,
    activa: data.activa ?? true,
  }
}

export function normalizeFaqs(businessId: string, faqs: Partial<FAQ>[] = []): FAQ[] {
  const orderedFaqs = faqs
    .map((faq, originalIndex) => ({ faq, originalIndex }))
    .sort((left, right) => {
      const leftOrder = typeof left.faq.orden === 'number' ? left.faq.orden : Number.MAX_SAFE_INTEGER
      const rightOrder = typeof right.faq.orden === 'number' ? right.faq.orden : Number.MAX_SAFE_INTEGER
      return leftOrder - rightOrder || left.originalIndex - right.originalIndex
    })

  return orderedFaqs.map(({ faq }, index) => {
    const now = new Date().toISOString()
    const createdAt = faq.createdAt ?? now

    return {
      id: faq.id ?? crypto.randomUUID(),
      businessId,
      pregunta: faq.pregunta?.trim() ?? '',
      respuesta: faq.respuesta?.trim() ?? '',
      categoria: faq.categoria?.trim() || undefined,
      activa: faq.activa ?? true,
      orden: index + 1,
      createdAt,
      updatedAt: faq.updatedAt ?? createdAt,
    }
  })
}

function hasFaqMigrationChanges(originalFaqs: Partial<FAQ>[], normalizedFaqs: FAQ[]): boolean {
  return originalFaqs.some((faq, index) => {
    const normalized = normalizedFaqs[index]
    return faq.id !== normalized.id
      || faq.businessId !== normalized.businessId
      || faq.pregunta !== normalized.pregunta
      || faq.respuesta !== normalized.respuesta
      || (faq.categoria || undefined) !== normalized.categoria
      || faq.activa !== normalized.activa
      || faq.orden !== normalized.orden
      || faq.createdAt !== normalized.createdAt
      || faq.updatedAt !== normalized.updatedAt
  })
}

export function migrateBusinessFaqs(business: Business): Business {
  const originalFaqs = business.faq ?? []
  const normalizedFaqs = normalizeFaqs(business.id, originalFaqs)

  if (Array.isArray(business.faq) && !hasFaqMigrationChanges(originalFaqs, normalizedFaqs)) {
    return business
  }

  const businesses = getStoredBusinesses()
  const businessIndex = businesses.findIndex(item => item.id === business.id)
  if (businessIndex === -1) return { ...business, faq: normalizedFaqs }

  const migratedBusiness = { ...business, faq: normalizedFaqs }
  businesses[businessIndex] = migratedBusiness
  saveStoredBusinesses(businesses)
  return migratedBusiness
}

function updateBusinessFaqs(
  businessId: string,
  updater: (faqs: FAQ[]) => FAQ[],
): FAQ[] {
  const updatedBusiness = updateStoredBusiness(businessId, business => {
    const faqs = updater(normalizeFaqs(businessId, business.faq))
    return { ...business, faq: faqs }
  })
  return updatedBusiness.faq
}

export async function getFaqs(businessId: string): Promise<FAQ[]> {
  const business = getStoredBusinesses().find(item => item.id === businessId)
  return business ? migrateBusinessFaqs(business).faq : []
}

export async function createFaq(
  businessId: string,
  data: FAQFormData,
): Promise<FAQMutationResult> {
  const normalizedData = normalizeFaqData(data)
  const now = new Date().toISOString()
  let faq: FAQ | null = null
  const faqs = updateBusinessFaqs(businessId, currentFaqs => {
    faq = {
      id: crypto.randomUUID(),
      businessId,
      ...normalizedData,
      orden: currentFaqs.length + 1,
      createdAt: now,
      updatedAt: now,
    }
    return [...currentFaqs, faq]
  })
  if (!faq) throw new Error('No se pudo crear la FAQ.')
  return { faq, faqs }
}

export async function updateFaq(
  businessId: string,
  faqId: string,
  data: FAQFormData,
): Promise<FAQMutationResult> {
  const normalizedData = normalizeFaqData(data)
  let updatedFaq: FAQ | null = null
  const faqs = updateBusinessFaqs(businessId, currentFaqs => currentFaqs.map(faq => {
    if (faq.id !== faqId) return faq

    updatedFaq = {
      ...faq,
      ...normalizedData,
      updatedAt: new Date().toISOString(),
    }
    return updatedFaq
  }))

  if (!updatedFaq) throw new Error('No se encontró la FAQ que querés editar.')
  return { faq: updatedFaq, faqs }
}

export async function deleteFaq(businessId: string, faqId: string): Promise<FAQ[]> {
  return updateBusinessFaqs(businessId, currentFaqs => currentFaqs
    .filter(faq => faq.id !== faqId)
    .map((faq, index) => ({ ...faq, orden: index + 1 })))
}

export async function moveFaq(
  businessId: string,
  faqId: string,
  direction: FAQMoveDirection,
): Promise<FAQ[]> {
  return updateBusinessFaqs(businessId, currentFaqs => {
    const currentIndex = currentFaqs.findIndex(faq => faq.id === faqId)
    if (currentIndex === -1) throw new Error('No se encontró la FAQ que querés mover.')

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= currentFaqs.length) return currentFaqs

    const reorderedFaqs = [...currentFaqs]
    const currentFaq = reorderedFaqs[currentIndex]
    reorderedFaqs[currentIndex] = reorderedFaqs[targetIndex]
    reorderedFaqs[targetIndex] = currentFaq
    const now = new Date().toISOString()

    return reorderedFaqs.map((faq, index) => ({
      ...faq,
      orden: index + 1,
      updatedAt: index === currentIndex || index === targetIndex ? now : faq.updatedAt,
    }))
  })
}

export async function toggleFaq(
  businessId: string,
  faqId: string,
): Promise<FAQMutationResult> {
  let updatedFaq: FAQ | null = null
  const faqs = updateBusinessFaqs(businessId, currentFaqs => currentFaqs.map(faq => {
    if (faq.id !== faqId) return faq

    updatedFaq = {
      ...faq,
      activa: !faq.activa,
      updatedAt: new Date().toISOString(),
    }
    return updatedFaq
  }))

  if (!updatedFaq) throw new Error('No se encontró la FAQ que querés actualizar.')
  return { faq: updatedFaq, faqs }
}
