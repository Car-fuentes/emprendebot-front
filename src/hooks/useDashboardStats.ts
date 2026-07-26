import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../services/apiClient'
import { getPresupuestos } from '../services/presupuestoApi'

type DashboardMetricStatus = 'loading' | 'success' | 'error' | 'unavailable'

export interface DashboardMetric {
  value: number | string
  status: DashboardMetricStatus
}

export interface DashboardStatsData {
  consultasPendientes: DashboardMetric
  presupuestosPendientes: DashboardMetric
  consultasResueltas: DashboardMetric
  porcentajeAutomatizacion: DashboardMetric
}

interface DashboardConsulta {
  estado?: string | null
}

interface ConsultationsResponse {
  success: boolean
  consultas: DashboardConsulta[]
}

interface CachedDashboardStats {
  expiresAt: number
  promise: Promise<DashboardStatsData>
}

const CACHE_TTL_MS = 10_000
const requestCache = new Map<string, CachedDashboardStats>()

const LOADING_METRIC: DashboardMetric = { value: '—', status: 'loading' }
const UNAVAILABLE_AUTOMATION: DashboardMetric = { value: '—', status: 'unavailable' }

export const normalizeDashboardStatus = (status?: string | null) =>
  status?.trim().toUpperCase().replace(/[\s-]+/g, '_') ?? ''

export const countDashboardConsultations = (consultas: DashboardConsulta[]) => {
  const statuses = consultas.map(consulta => normalizeDashboardStatus(consulta.estado))
  return {
    pendientes: statuses.filter(status => status === 'NUEVA' || status === 'EN_PROCESO').length,
    resueltas: statuses.filter(status => status === 'RESUELTA' || status === 'CERRADA').length,
  }
}

const loadDashboardStats = async (): Promise<DashboardStatsData> => {
  const consultationsPromise = apiRequest<ConsultationsResponse>('/consultations')
  const budgetsPromise = Promise.all([
    getPresupuestos({ estado: 'PENDIENTE', page: 1, limit: 1 }),
    getPresupuestos({ estado: 'EN_PROCESO', page: 1, limit: 1 }),
  ])

  const [consultationsResult, budgetsResult] = await Promise.allSettled([
    consultationsPromise,
    budgetsPromise,
  ])

  let consultasPendientes: DashboardMetric
  let consultasResueltas: DashboardMetric

  if (consultationsResult.status === 'fulfilled') {
    const counts = countDashboardConsultations(consultationsResult.value.consultas)
    consultasPendientes = {
      value: counts.pendientes,
      status: 'success',
    }
    consultasResueltas = {
      value: counts.resueltas,
      status: 'success',
    }
  } else {
    consultasPendientes = { value: '—', status: 'error' }
    consultasResueltas = { value: '—', status: 'error' }
  }

  const presupuestosPendientes: DashboardMetric = budgetsResult.status === 'fulfilled'
    ? {
        value: budgetsResult.value.reduce(
          (total, response) => total + response.paginacion.total,
          0,
        ),
        status: 'success',
      }
    : { value: '—', status: 'error' }

  return {
    consultasPendientes,
    presupuestosPendientes,
    consultasResueltas,
    porcentajeAutomatizacion: UNAVAILABLE_AUTOMATION,
  }
}

const getCachedRequest = (userId: string, force: boolean): Promise<DashboardStatsData> => {
  const cached = requestCache.get(userId)
  if (!force && cached && cached.expiresAt > Date.now()) return cached.promise

  const promise = loadDashboardStats()
  requestCache.set(userId, { expiresAt: Date.now() + CACHE_TTL_MS, promise })
  return promise
}

const INITIAL_STATS: DashboardStatsData = {
  consultasPendientes: LOADING_METRIC,
  presupuestosPendientes: LOADING_METRIC,
  consultasResueltas: LOADING_METRIC,
  porcentajeAutomatizacion: UNAVAILABLE_AUTOMATION,
}

export function useDashboardStats(userId?: string) {
  const [stats, setStats] = useState<DashboardStatsData>(INITIAL_STATS)

  const load = useCallback(async (force = false) => {
    if (!userId) return
    setStats(INITIAL_STATS)
    const result = await getCachedRequest(userId, force)
    setStats(result)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    let active = true
    const timeoutId = window.setTimeout(() => {
      void getCachedRequest(userId, false).then(result => {
        if (active) setStats(result)
      })
    }, 0)
    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [userId])

  return {
    stats,
    refetch: () => load(true),
  }
}
