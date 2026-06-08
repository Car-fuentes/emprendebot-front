import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Business, DashboardStats } from '../types'

const BUSINESSES_KEY = 'eb_businesses'

interface BusinessContextType {
  business: Business | null
  stats: DashboardStats
  loadBusiness: (userId: string) => void
  loadBusinessBySlug: (slug: string) => Business | null
  saveBusiness: (data: Partial<Business> & { userId: string }) => Business
  updateBusiness: (data: Partial<Business>) => void
}

const DEFAULT_STATS: DashboardStats = {
  consultasPendientes: 3,
  presupuestosPendientes: 2,
  consultasResueltas: 8,
  porcentajeAutomatizacion: 67,
}

const BusinessContext = createContext<BusinessContextType | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null)

  const getAllBusinesses = (): Business[] => {
    const stored = localStorage.getItem(BUSINESSES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  const saveAll = (list: Business[]) => {
    localStorage.setItem(BUSINESSES_KEY, JSON.stringify(list))
  }

  const loadBusiness = useCallback((userId: string) => {
    const all = getAllBusinesses()
    const found = all.find(b => b.userId === userId) ?? null
    setBusiness(found)
  }, [])

  const loadBusinessBySlug = useCallback((slug: string): Business | null => {
    const all = getAllBusinesses()
    return all.find(b => b.slug === slug) ?? null
  }, [])

  const saveBusiness = useCallback((data: Partial<Business> & { userId: string }): Business => {
    const all = getAllBusinesses()
    const newBusiness: Business = {
      id: crypto.randomUUID(),
      productos: [],
      faq: [],
      rubro: '',
      ...data,
      nombre: data.nombre ?? '',
      descripcion: data.descripcion ?? '',
      horario: data.horario ?? '',
      telefono: data.telefono ?? '',
      mensajeBienvenida: data.mensajeBienvenida ?? '¡Hola! ¿En qué te puedo ayudar?',
      respuestaDerivacion: data.respuestaDerivacion ?? 'Te voy a conectar con un asesor en breve.',
      slug: data.slug ?? data.nombre?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') ?? crypto.randomUUID(),
    }
    all.push(newBusiness)
    saveAll(all)
    setBusiness(newBusiness)
    return newBusiness
  }, [])

  const updateBusiness = useCallback((data: Partial<Business>) => {
    if (!business) return
    const updated = { ...business, ...data }
    const all = getAllBusinesses().map(b => b.id === updated.id ? updated : b)
    saveAll(all)
    setBusiness(updated)
  }, [business])

  return (
    <BusinessContext.Provider value={{
      business,
      stats: DEFAULT_STATS,
      loadBusiness,
      loadBusinessBySlug,
      saveBusiness,
      updateBusiness,
    }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness debe usarse dentro de BusinessProvider')
  return ctx
}
