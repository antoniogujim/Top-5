export interface User {
  id: string
  username: string
  email: string
  password: string // plain text for practice — hash with bcrypt in production
  isPremium: boolean
}

export interface RankingItem {
  position: number
  title: string
  description?: string
}

export interface Ranking {
  id: string
  title: string
  category: string
  items: RankingItem[]
  userId: string
  createdAt: string
  isPublic: boolean
}

export interface Category {
  value: string
  label: string
}

export interface JwtPayload {
  userId: string
  email: string
}
