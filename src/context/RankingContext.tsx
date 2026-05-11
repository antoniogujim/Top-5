import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Ranking } from '../types'
import { useAuth } from '../hooks/useAuth'
import { FREE_LIST_LIMIT } from '../utils/constants'
import { api } from '../api/client'
import { useToast } from './ToastContext'

const PAGE_SIZE = 9

type CreateRankingData = Omit<Ranking, 'id' | 'createdAt' | 'userId'>

interface PaginatedResponse {
  data: Ranking[]
  total: number
  page: number
  pages: number
}

interface RankingContextType {
  rankings: Ranking[]
  canCreate: boolean
  isLoading: boolean
  total: number
  page: number
  totalPages: number
  categoryFilter: string
  setCategoryFilter: (cat: string) => void
  goToPage: (page: number) => void
  refetch: () => void
  addRanking: (data: CreateRankingData) => Promise<boolean>
  removeRanking: (id: string) => Promise<void>
  updateRanking: (id: string, data: Partial<Ranking>) => Promise<boolean>
}

const RankingContext = createContext<RankingContextType>({
  rankings: [],
  canCreate: true,
  isLoading: false,
  total: 0,
  page: 1,
  totalPages: 1,
  categoryFilter: '',
  setCategoryFilter: () => {},
  goToPage: () => {},
  refetch: () => {},
  addRanking: async () => false,
  removeRanking: async () => {},
  updateRanking: async () => false,
})

export function RankingProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchKey, setFetchKey] = useState(0)
  const [categoryFilter, setCategoryFilterState] = useState('')

  const setCategoryFilter = (cat: string) => {
    if (cat === categoryFilter) return
    setCategoryFilterState(cat)
    setPage(1)
    setIsLoading(true)
  }
  const { showError } = useToast()

  const refetch = () => { setFetchKey((k) => k + 1); setIsLoading(true) }

  useEffect(() => {
    let active = true
    const catParam = categoryFilter ? `&category=${encodeURIComponent(categoryFilter)}` : ''
    api.get<PaginatedResponse>(`/rankings?page=${page}&limit=${PAGE_SIZE}${catParam}`)
      .then((res) => {
        if (!active) return
        if (res.data.length === 0 && page > 1) {
          setPage((p) => p - 1)
          return
        }
        setRankings(res.data)
        setTotal(res.total)
        setTotalPages(res.pages)
        setIsLoading(false)
      })
      .catch(() => {
        if (!active) return
        setRankings([])
        setIsLoading(false)
        showError('No se pudieron cargar los rankings')
      })
    return () => { active = false }
  // showError is stable, safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.isPremium, page, fetchKey, categoryFilter])

  const goToPage = (next: number) => { setPage(next); setIsLoading(true) }

  const canCreate = (user?.isPremium ?? false) || total < FREE_LIST_LIMIT

  const addRanking = async (data: CreateRankingData): Promise<boolean> => {
    if (!canCreate) return false
    try {
      await api.post<Ranking>('/rankings', data)
      refetch()
      return true
    } catch {
      showError('No se pudo crear el ranking')
      return false
    }
  }

  const removeRanking = async (id: string): Promise<void> => {
    try {
      await api.del(`/rankings/${id}`)
      refetch()
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
    <RankingContext.Provider value={{ rankings, canCreate, isLoading, total, page, totalPages, categoryFilter, setCategoryFilter, goToPage, refetch, addRanking, removeRanking, updateRanking }}>
      {children}
    </RankingContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRankings() {
  return useContext(RankingContext)
}
