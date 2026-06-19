import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Consulta, EstadoConsultaNombre } from '../types'
import { getConsultas, updateConsultaEstado } from '../services/consultaStorage'

export type ConsultaFilter = 'todas' | EstadoConsultaNombre

interface UseConsultasResult {
  consultas: Consulta[]
  filteredConsultas: Consulta[]
  selectedConsulta: Consulta | null
  selectedConsultaId: string | null
  filter: ConsultaFilter
  isLoading: boolean
  setFilter: (filter: ConsultaFilter) => void
  selectConsulta: (consultaId: string) => void
  closeConsulta: (consultaId: string) => Promise<void>
  reloadConsultas: () => Promise<void>
}

export function useConsultas(userId?: string): UseConsultasResult {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [selectedConsultaId, setSelectedConsultaId] = useState<string | null>(null)
  const [filter, setFilter] = useState<ConsultaFilter>('todas')
  const [isLoading, setIsLoading] = useState(true)

  const reloadConsultas = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getConsultas(userId)
      setConsultas(data)
      setSelectedConsultaId(current => current ?? data[0]?.id ?? null)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void reloadConsultas()
  }, [reloadConsultas])

  const filteredConsultas = useMemo(() => {
    if (filter === 'todas') return consultas
    return consultas.filter(consulta => consulta.estadoConsulta.nombre === filter)
  }, [consultas, filter])

  const selectedConsulta = useMemo(() => {
    if (!selectedConsultaId) return filteredConsultas[0] ?? null
    return filteredConsultas.find(consulta => consulta.id === selectedConsultaId) ?? filteredConsultas[0] ?? null
  }, [filteredConsultas, selectedConsultaId])

  const selectConsulta = useCallback((consultaId: string) => {
    setSelectedConsultaId(consultaId)
  }, [])

  const closeConsulta = useCallback(async (consultaId: string) => {
    const updated = await updateConsultaEstado(consultaId, 'cerrada', userId)
    if (!updated) return

    setConsultas(current => current.map(consulta => (
      consulta.id === consultaId ? updated : consulta
    )))
    setSelectedConsultaId(consultaId)
  }, [userId])

  return {
    consultas,
    filteredConsultas,
    selectedConsulta,
    selectedConsultaId,
    filter,
    isLoading,
    setFilter,
    selectConsulta,
    closeConsulta,
    reloadConsultas,
  }
}
