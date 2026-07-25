import type { CreateFAQPayload, FAQApi, UpdateFAQPayload } from '../types'
import { apiRequest } from './apiClient'

interface FAQListResponse {
  success: boolean
  faqs: {
    faqs: FAQApi[]
    total: number
    page: number
    limit: number
    totalPaginas: number
  }
}

interface FAQMutationResponse {
  success: boolean
  message: string
  faq: FAQApi
}

export async function getFaqsApi(): Promise<FAQApi[]> {
  const faqs: FAQApi[] = []
  let page = 1

  while (true) {
    const response = await apiRequest<FAQListResponse>(`/faqs?page=${page}&limit=100`)
    faqs.push(...response.faqs.faqs)
    if (page >= response.faqs.totalPaginas) break
    page += 1
  }

  return faqs
}

export async function createFaqApi(payload: CreateFAQPayload): Promise<FAQApi> {
  const response = await apiRequest<FAQMutationResponse>('/faqs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.faq
}

export async function updateFaqApi(id: string, payload: UpdateFAQPayload): Promise<FAQApi> {
  const response = await apiRequest<FAQMutationResponse>(`/faqs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return response.faq
}

export async function deleteFaqApi(id: string): Promise<void> {
  await apiRequest<{ success: boolean; message: string }>(`/faqs/${id}`, {
    method: 'DELETE',
  })
}
