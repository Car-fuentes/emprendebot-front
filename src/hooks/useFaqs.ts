import { useMemo } from 'react'
import { useBusiness } from '../context/BusinessContext'
import type { FAQ } from '../types'
import type { FAQFormData } from '../services/faqStorage'

export type FAQStatusFilter = 'all' | 'active' | 'inactive'
export type FAQSortOption = 'created-desc' | 'created-asc' | 'alpha-asc' | 'alpha-desc'

interface UseFaqFilters {
  status: FAQStatusFilter
  category: string
  sort: FAQSortOption
}

function getTime(value: string): number {
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function sortFaqs(left: FAQ, right: FAQ, sort: FAQSortOption): number {
  if (sort === 'created-asc') {
    return getTime(left.createdAt) - getTime(right.createdAt)
  }

  if (sort === 'alpha-asc') {
    return left.pregunta.localeCompare(right.pregunta, 'es', { sensitivity: 'base' })
  }

  if (sort === 'alpha-desc') {
    return right.pregunta.localeCompare(left.pregunta, 'es', { sensitivity: 'base' })
  }

  return getTime(right.createdAt) - getTime(left.createdAt)
}

export function useFaqs(filters: UseFaqFilters) {
  const {
    business,
    faqCategories,
    createFaq,
    updateFaq,
    deleteFaq,
    toggleFaq,
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
      .sort((left, right) => sortFaqs(left, right, filters.sort))
  }, [business?.faq, filters.category, filters.sort, filters.status])

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
  }
}
