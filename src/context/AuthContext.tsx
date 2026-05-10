import { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { api } from '../api/client'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    api.get<User>('/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
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
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
