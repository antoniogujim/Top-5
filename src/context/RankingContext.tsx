import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Ranking } from '../types'
import { useAuth } from '../hooks/useAuth'
import { FREE_LIST_LIMIT } from '../utils/constants'
import { api } from '../api/client'

type CreateRankingData = Omit<Ranking, 'id' | 'createdAt' | 'userId'>

interface RankingContextType {
  rankings: Ranking[]
  canCreate: boolean
  isLoading: boolean
  addRanking: (data: CreateRankingData) => Promise<boolean>
  removeRanking: (id: string) => Promise<void>
  updateRanking: (id: string, data: Partial<Ranking>) => Promise<void>
}

const RankingContext = createContext<RankingContextType>({
  rankings: [],
  canCreate: true,
  isLoading: false,
  addRanking: async () => false,
  removeRanking: async () => {},
  updateRanking: async () => {},
})

export function RankingProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get<Ranking[]>('/rankings')
      .then((data) => { if (active) setRankings(data) })
      .catch(() => { if (active) setRankings([]) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [isAuthenticated])

  const canCreate = (user?.isPremium ?? false) || rankings.length < FREE_LIST_LIMIT

  const addRanking = async (data: CreateRankingData): Promise<boolean> => {
    if (!canCreate) return false
    const created = await api.post<Ranking>('/rankings', data)
    setRankings((prev) => [created, ...prev])
    return true
  }

  const removeRanking = async (id: string): Promise<void> => {
    await api.del(`/rankings/${id}`)
    setRankings((prev) => prev.filter((r) => r.id !== id))
  }

  const updateRanking = async (id: string, data: Partial<Ranking>): Promise<void> => {
    const updated = await api.put<Ranking>(`/rankings/${id}`, data)
    setRankings((prev) => prev.map((r) => (r.id === id ? updated : r)))
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
