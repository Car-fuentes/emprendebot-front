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
    faqCategories,
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
        const matchesCategory = filters.category === 'all' || faq.categoriaId === filters.category
        return matchesStatus && matchesCategory
      })
      .sort((left, right) => left.orden - right.orden)
  }, [business?.faq, filters.category, filters.status])

  const categories = useMemo(
    () => [...faqCategories].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [faqCategories],
  )

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
