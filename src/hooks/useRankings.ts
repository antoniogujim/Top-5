import { useState } from 'react'
import type { Ranking } from '../types'
import { FREE_LIST_LIMIT } from '../utils/constants'

export function useRankings(isPremium: boolean) {
  const [rankings, setRankings] = useState<Ranking[]>([])

  const canCreate = isPremium || rankings.length < FREE_LIST_LIMIT

  const addRanking = (ranking: Ranking): boolean => {
    if (!canCreate) return false
    setRankings((prev) => [...prev, ranking])
    return true
  }

  const removeRanking = (id: string) => {
    setRankings((prev) => prev.filter((r) => r.id !== id))
  }

  const updateRanking = (id: string, data: Partial<Ranking>) => {
    setRankings((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }

  return { rankings, canCreate, addRanking, removeRanking, updateRanking }
}
