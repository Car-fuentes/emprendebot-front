import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../services/apiClient'
import { getPresupuestos } from '../services/presupuestoApi'

type DashboardMetricStatus = 'loading' | 'success' | 'error' | 'unavailable'

export interface DashboardMetric {
  value: number | string
  status: DashboardMetricStatus
  detail?: string
}

export interface DashboardStatsData {
  consultasPendientes: DashboardMetric
  presupuestosPendientes: DashboardMetric
  consultasResueltas: DashboardMetric
  porcentajeAutomatizacion: DashboardMetric
}

interface DashboardConsulta {
  estado?: string | null
  derivada?: boolean | null
  cerradaPor?: string | null
  mensajes?: Array<{ emisor?: string | null }> | null
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
export const normalizeDashboardStatus = (status?: string | null) =>
  status?.trim().toUpperCase().replace(/[\s-]+/g, '_') ?? ''

export const countDashboardConsultations = (consultas: DashboardConsulta[]) => {
  let pendientes = 0
  let resueltas = 0
  let automatizadasEstimadas = 0

  consultas.forEach(consulta => {
    const status = normalizeDashboardStatus(consulta.estado)
    if (status === 'NUEVA' || status === 'EN_PROCESO') pendientes += 1
    if (status === 'RESUELTA' || status === 'CERRADA') resueltas += 1

    const cerradaPorEmprendedor = normalizeDashboardStatus(consulta.cerradaPor) === 'EMPRENDEDOR'
    const tieneMensajeEmprendedor = consulta.mensajes?.some(mensaje => {
      const emisor = normalizeDashboardStatus(mensaje.emisor)
      return emisor === 'EMPRENDEDOR' || emisor === 'USUARIO'
    }) ?? false

    if (!consulta.derivada && !cerradaPorEmprendedor && !tieneMensajeEmprendedor) {
      automatizadasEstimadas += 1
    }
  })

  return {
    pendientes,
    resueltas,
    automatizadasEstimadas,
  }
}

const loadDashboardStats = async (): Promise<DashboardStatsData> => {
  const consultationsPromise = apiRequest<ConsultationsResponse>('/consultations')
  const budgetsPromise = getPresupuestos({ page: 1, limit: 1 })

  const [consultationsResult, budgetsResult] = await Promise.allSettled([
    consultationsPromise,
    budgetsPromise,
  ])

  let consultasPendientes: DashboardMetric
  let consultasResueltas: DashboardMetric
  let porcentajeAutomatizacion: DashboardMetric

  if (consultationsResult.status === 'fulfilled') {
    const consultas = consultationsResult.value.consultas
    const counts = countDashboardConsultations(consultas)
    consultasPendientes = {
      value: counts.pendientes,
      status: 'success',
    }
    consultasResueltas = {
      value: counts.resueltas,
      status: 'success',
    }
    porcentajeAutomatizacion = {
      value: `${consultas.length > 0
        ? Math.round((counts.automatizadasEstimadas / consultas.length) * 100)
        : 0}%`,
      status: 'success',
      detail: `${counts.automatizadasEstimadas} de ${consultas.length} consultas fueron atendidas sin intervención humana`,
    }
  } else {
    consultasPendientes = { value: '—', status: 'error' }
    consultasResueltas = { value: '—', status: 'error' }
    porcentajeAutomatizacion = { value: '—', status: 'error' }
  }

  const presupuestosPendientes: DashboardMetric = budgetsResult.status === 'fulfilled'
    ? {
        value: budgetsResult.value.paginacion.total,
        status: 'success',
      }
    : { value: '—', status: 'error' }

  return {
    consultasPendientes,
    presupuestosPendientes,
    consultasResueltas,
    porcentajeAutomatizacion,
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
  porcentajeAutomatizacion: LOADING_METRIC,
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
      void getCachedRequest(userId, true).then(result => {
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
