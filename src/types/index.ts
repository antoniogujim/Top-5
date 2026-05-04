export type Category = string

export interface RankingItem {
  position: number
  title: string
  description?: string
}

export interface Ranking {
  id: string
  title: string
  category: Category
  items: RankingItem[] // always max 5
  userId: string
  createdAt: string
  isPublic: boolean
}

export interface User {
  id: string
  username: string
  email: string
  isPremium: boolean
}
