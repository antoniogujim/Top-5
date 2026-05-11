import type { Ranking } from '../types'
import { config } from '../config'

const rankings: Ranking[] = [
  {
    id: 'demo-1',
    title: 'Mejores pelis de acción',
    category: 'peliculas',
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
    id: 'demo-2',
    title: 'Canciones del verano',
    category: 'canciones',
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
    id: 'demo-3',
    title: 'Videojuegos imprescindibles',
    category: 'videojuegos',
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

export const rankingsService = {
  getPublic(page: number, limit: number, category?: string): { data: Ranking[]; total: number } {
    let all = rankings.filter((r) => r.isPublic)
    if (category) all = all.filter((r) => r.category === category)
    return { data: all.slice((page - 1) * limit, page * limit), total: all.length }
  },

  getByUser(userId: string, page: number, limit: number, category?: string): { data: Ranking[]; total: number } {
    let all = rankings.filter((r) => r.userId === userId)
    if (category) all = all.filter((r) => r.category === category)
    return { data: all.slice((page - 1) * limit, page * limit), total: all.length }
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

  removeByCategory(userId: string, category: string): void {
    const indices = rankings
      .map((r, i) => (r.userId === userId && r.category === category ? i : -1))
      .filter((i) => i !== -1)
      .reverse()
    indices.forEach((i) => rankings.splice(i, 1))
  },

  trimToLimit(userId: string, limit: number): number {
    const userRankings = rankings
      .filter((r) => r.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const toDelete = userRankings.slice(limit)
    toDelete.forEach((r) => {
      const index = rankings.findIndex((x) => x.id === r.id)
      if (index !== -1) rankings.splice(index, 1)
    })
    return toDelete.length
  },
}
