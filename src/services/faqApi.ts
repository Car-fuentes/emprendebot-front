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
  // Backend limita a máx. 100 por página; para la mayoría de los negocios alcanza
  const response = await apiRequest<FAQListResponse>('/faqs?page=1&limit=100')
  return response.faqs.faqs
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
