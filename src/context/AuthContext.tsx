import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (nombre: string, email: string, password: string, rubro: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// Mock de usuarios (hasta integrar el backend)
const MOCK_USERS_KEY = 'eb_users'
const CURRENT_USER_KEY = 'eb_current_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY)
    if (saved) setUser(JSON.parse(saved))
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simula llamada al backend
    await new Promise(r => setTimeout(r, 600))
    const stored = localStorage.getItem(MOCK_USERS_KEY)
    const users: (User & { password: string })[] = stored ? JSON.parse(stored) : []
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) throw new Error('Email o contraseña incorrectos')
    const { password: _, ...userData } = found
    setUser(userData)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData))
  }

  const register = async (nombre: string, email: string, password: string, _rubro: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 600))
    const stored = localStorage.getItem(MOCK_USERS_KEY)
    const users: (User & { password: string })[] = stored ? JSON.parse(stored) : []
    if (users.find(u => u.email === email)) throw new Error('El email ya está registrado')

    const slug = nombre.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    const newUser: User & { password: string } = {
      id: crypto.randomUUID(),
      email,
      nombre,
      slug,
      password,
    }
    users.push(newUser)
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
    const { password: _, ...userData } = newUser
    setUser(userData)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData))
    return userData
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
