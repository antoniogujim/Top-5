import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Ranking } from '../types'
import { useAuth } from '../hooks/useAuth'
import { FREE_LIST_LIMIT } from '../utils/constants'
import { api } from '../api/client'
import { useToast } from './ToastContext'

type CreateRankingData = Omit<Ranking, 'id' | 'createdAt' | 'userId'>

interface RankingContextType {
  rankings: Ranking[]
  canCreate: boolean
  isLoading: boolean
  addRanking: (data: CreateRankingData) => Promise<boolean>
  removeRanking: (id: string) => Promise<void>
  updateRanking: (id: string, data: Partial<Ranking>) => Promise<boolean>
}

const RankingContext = createContext<RankingContextType>({
  rankings: [],
  canCreate: true,
  isLoading: false,
  addRanking: async () => false,
  removeRanking: async () => {},
  updateRanking: async () => false,
})

export function RankingProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showError } = useToast()

  useEffect(() => {
    let active = true
    api.get<Ranking[]>('/rankings')
      .then((data) => { if (active) setRankings(data) })
      .catch(() => {
        if (active) {
          setRankings([])
          showError('No se pudieron cargar los rankings')
        }
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  // showError is stable, safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.isPremium])

  const canCreate = (user?.isPremium ?? false) || rankings.length < FREE_LIST_LIMIT

  const addRanking = async (data: CreateRankingData): Promise<boolean> => {
    if (!canCreate) return false
    try {
      const created = await api.post<Ranking>('/rankings', data)
      setRankings((prev) => [created, ...prev])
      return true
    } catch {
      showError('No se pudo crear el ranking')
      return false
    }
  }

  const removeRanking = async (id: string): Promise<void> => {
    try {
      await api.del(`/rankings/${id}`)
      setRankings((prev) => prev.filter((r) => r.id !== id))
    } catch {
      showError('No se pudo eliminar el ranking')
    }
  }

  const updateRanking = async (id: string, data: Partial<Ranking>): Promise<boolean> => {
    try {
      const updated = await api.put<Ranking>(`/rankings/${id}`, data)
      setRankings((prev) => prev.map((r) => (r.id === id ? updated : r)))
      return true
    } catch {
      showError('No se pudo guardar el ranking')
      return false
    }
  }

  return (
    <RankingContext.Provider value={{ rankings, canCreate, isLoading, addRanking, removeRanking, updateRanking }}>
      {children}
    </RankingContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRankings() {
  return useContext(RankingContext)
}
