import { apiRequest } from './apiClient'
import { mapFaqApiToUi } from './faqMappers'
import type { FAQ, FAQApi } from '../types'

interface PublicFaqsResponse {
  success: boolean
  faqs: FAQApi[]
}

export async function getPublicFaqsApi(slug: string): Promise<FAQ[]> {
  const response = await apiRequest<PublicFaqsResponse>(
    `/public/chatbot/${slug}/faqs`,
    { auth: false },
  )
  return response.faqs.map(mapFaqApiToUi)
}
