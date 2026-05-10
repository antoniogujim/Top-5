import type { Ranking } from '../types'
import { config } from '../config'

const rankings: Ranking[] = [
  {
    id: '1',
    title: 'Mejores pelis de acción',
    category: 'movies',
    userId: '1',
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
    userId: '1',
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
]

export const rankingsService = {
  getPublic(): Ranking[] {
    return rankings.filter((r) => r.isPublic)
  },

  getByUser(userId: string): Ranking[] {
    return rankings.filter((r) => r.userId === userId)
  },

  getById(id: string): Ranking | undefined {
    return rankings.find((r) => r.id === id)
  },

  canCreate(userId: string, isPremium: boolean): boolean {
    if (isPremium) return true
    const userRankings = rankings.filter((r) => r.userId === userId)
    return userRankings.length < config.freeListLimit
  },

  create(data: Omit<Ranking, 'id' | 'createdAt'>): Ranking {
    const ranking: Ranking = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date().toISOString().split('T')[0],
    }
    rankings.push(ranking)
    return ranking
  },

  update(id: string, userId: string, data: Partial<Ranking>): Ranking {
    const index = rankings.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('Ranking not found')
    if (rankings[index].userId !== userId) throw new Error('Forbidden')
    rankings[index] = { ...rankings[index], ...data, id, userId }
    return rankings[index]
  },

  remove(id: string, userId: string): void {
    const index = rankings.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('Ranking not found')
    if (rankings[index].userId !== userId) throw new Error('Forbidden')
    rankings.splice(index, 1)
  },
}
