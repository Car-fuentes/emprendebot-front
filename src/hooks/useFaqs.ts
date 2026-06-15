import { useMemo } from 'react'
import { useBusiness } from '../context/BusinessContext'
import type { FAQ } from '../types'
import type { FAQFormData } from '../services/faqStorage'

export type FAQStatusFilter = 'all' | 'active' | 'inactive'

interface UseFaqFilters {
  status: FAQStatusFilter
  category: string
}

export function useFaqs(filters: UseFaqFilters) {
  const {
    business,
    createFaq,
    updateFaq,
    deleteFaq,
    toggleFaq,
    moveFaq,
  } = useBusiness()

  const faqs = useMemo(() => {
    const businessFaqs = business?.faq ?? []

    return businessFaqs
      .filter(faq => {
        const matchesStatus = filters.status === 'all'
          || (filters.status === 'active' && faq.activa)
          || (filters.status === 'inactive' && !faq.activa)
        const matchesCategory = filters.category === 'all' || faq.categoria === filters.category
        return matchesStatus && matchesCategory
      })
      .sort((left, right) => left.orden - right.orden)
  }, [business?.faq, filters.category, filters.status])

  const categories = useMemo(() => Array.from(new Set(
    (business?.faq ?? [])
      .map(faq => faq.categoria)
      .filter((category): category is string => Boolean(category)),
  )).sort((a, b) => a.localeCompare(b)), [business?.faq])

  return {
    faqs,
    allFaqs: business?.faq ?? [],
    categories,
    createFaq: (data: FAQFormData): Promise<FAQ> => createFaq(data),
    updateFaq: (faqId: string, data: FAQFormData): Promise<FAQ> => updateFaq(faqId, data),
    deleteFaq,
    toggleFaq,
    moveFaq,
  }
}
