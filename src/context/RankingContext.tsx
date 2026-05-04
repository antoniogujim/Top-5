import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Ranking } from '../types'
import { useAuth } from '../hooks/useAuth'
import { FREE_LIST_LIMIT } from '../utils/constants'

const INITIAL_RANKINGS: Ranking[] = [
  {
    id: '1',
    title: 'Mejores pelis de acción',
    category: 'movies',
    userId: 'demo',
    createdAt: '2024-01-01',
    isPublic: true,
    items: [
      { position: 1, title: 'The Dark Knight' },
      { position: 2, title: 'Inception' },
      { position: 3, title: 'Interstellar' },
      { position: 4, title: 'Mad Max: Fury Road' },
      { position: 5, title: 'John Wick' },
    ],
  },
  {
    id: '2',
    title: 'Canciones del verano',
    category: 'songs',
    userId: 'demo',
    createdAt: '2024-01-02',
    isPublic: true,
    items: [
      { position: 1, title: 'Blinding Lights' },
      { position: 2, title: 'As It Was' },
      { position: 3, title: 'Stay' },
      { position: 4, title: 'Levitating' },
      { position: 5, title: 'Heat Waves' },
    ],
  },
  {
    id: '3',
    title: 'Videojuegos imprescindibles',
    category: 'videogames',
    userId: 'demo',
    createdAt: '2024-01-03',
    isPublic: true,
    items: [
      { position: 1, title: 'The Last of Us' },
      { position: 2, title: 'Red Dead Redemption 2' },
      { position: 3, title: 'Elden Ring' },
      { position: 4, title: 'God of War' },
      { position: 5, title: 'Hollow Knight' },
    ],
  },
]

interface RankingContextType {
  rankings: Ranking[]
  canCreate: boolean
  addRanking: (ranking: Ranking) => boolean
  removeRanking: (id: string) => void
  updateRanking: (id: string, data: Partial<Ranking>) => void
}

const RankingContext = createContext<RankingContextType>({
  rankings: [],
  canCreate: true,
  addRanking: () => false,
  removeRanking: () => {},
  updateRanking: () => {},
})

export function RankingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const isPremium = user?.isPremium ?? false

  const [rankings, setRankings] = useState<Ranking[]>(() => {
    try {
      const saved = localStorage.getItem('rankings')
      return saved ? (JSON.parse(saved) as Ranking[]) : INITIAL_RANKINGS
    } catch {
      return INITIAL_RANKINGS
    }
  })

  useEffect(() => {
    localStorage.setItem('rankings', JSON.stringify(rankings))
  }, [rankings])

  const canCreate = isPremium || rankings.length < FREE_LIST_LIMIT

  const addRanking = (ranking: Ranking): boolean => {
    if (!canCreate) return false
    setRankings((prev) => [ranking, ...prev])
    return true
  }

  const removeRanking = (id: string) =>
    setRankings((prev) => prev.filter((r) => r.id !== id))

  const updateRanking = (id: string, data: Partial<Ranking>) =>
    setRankings((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))

  return (
    <RankingContext.Provider value={{ rankings, canCreate, addRanking, removeRanking, updateRanking }}>
      {children}
    </RankingContext.Provider>
  )
}

export function useRankings() {
  return useContext(RankingContext)
}
