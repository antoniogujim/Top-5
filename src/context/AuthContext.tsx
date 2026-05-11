import { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { api } from '../api/client'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  upgrade: () => Promise<void>
  downgrade: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  upgrade: async () => {},
  downgrade: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Si no hay token, ya estamos inicializados; si hay token, esperamos a /auth/me
  const [isInitialized, setIsInitialized] = useState(() => !localStorage.getItem('token'))

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    api.get<User>('/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setIsInitialized(true))
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    const { token } = await api.post<{ token: string }>('/auth/login', { email, password })
    localStorage.setItem('token', token)
    const me = await api.get<User>('/auth/me')
    setUser(me)
  }

  const register = async (username: string, email: string, password: string): Promise<void> => {
    await api.post('/auth/register', { username, email, password })
    await login(email, password)
  }

  const logout = (): void => {
    api.post('/auth/logout', {}).catch(() => {})
    localStorage.removeItem('token')
    setUser(null)
  }

  const upgrade = async (): Promise<void> => {
    const updated = await api.post<User>('/auth/upgrade', {})
    setUser(updated)
  }

  const downgrade = async (): Promise<void> => {
    const updated = await api.post<User>('/auth/downgrade', {})
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isInitialized, login, register, logout, upgrade, downgrade }}>
      {children}
    </AuthContext.Provider>
  )
}
