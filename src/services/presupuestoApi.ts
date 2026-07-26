import { apiRequest } from './apiClient'
import type {
  CotizarPresupuestoPayload,
  CreatePresupuestoPayload,
  CreatePresupuestoResponse,
  PresupuestoResponse,
  PresupuestosFilters,
  PresupuestosListResponse,
  UpdatePresupuestoEstadoPayload,
} from '../types/presupuesto'

const toQuery = (filters: PresupuestosFilters): string => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const createPresupuesto = (payload: CreatePresupuestoPayload) =>
  apiRequest<CreatePresupuestoResponse>('/presupuestos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const getPresupuestos = (filters: PresupuestosFilters = {}) =>
  apiRequest<PresupuestosListResponse>(`/presupuestos${toQuery(filters)}`)

export const getPresupuestoById = (id: number) =>
  apiRequest<PresupuestoResponse>(`/presupuestos/${id}`)

export const updatePresupuestoEstado = (
  id: number,
  payload: UpdatePresupuestoEstadoPayload,
) =>
  apiRequest<PresupuestoResponse>(`/presupuestos/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const cotizarPresupuesto = (id: number, payload: CotizarPresupuestoPayload) =>
  apiRequest<PresupuestoResponse>(`/presupuestos/${id}/cotizar`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
