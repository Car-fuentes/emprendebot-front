import { apiRequest } from './apiClient'
import { mapFaqApiToUi } from './faqMappers'
import { mapProductApi } from './productApi'
import type { FAQ, FAQApi, Product, ProductApi } from '../types'

interface PublicFaqsResponse {
  success: boolean
  faqs: FAQApi[]
}

interface PublicProductsResponse {
  success: boolean
  productos: ProductApi[]
}

export async function getPublicFaqsApi(slug: string): Promise<FAQ[]> {
  const response = await apiRequest<PublicFaqsResponse>(
    `/public/chatbot/${slug}/faqs`,
    { auth: false },
  )
  return response.faqs.map(mapFaqApiToUi)
}

export async function getPublicProductsApi(slug: string): Promise<Product[]> {
  const response = await apiRequest<PublicProductsResponse>(
    `/public/chatbot/${slug}/products`,
    { auth: false },
  )
  return response.productos.map(mapProductApi)
}
