import type { Category } from '../types'

interface StoredCategory {
  value: string
  label: string
  userId: string
}

const DEFAULT_CATEGORIES: Category[] = [
  { value: 'comida',      label: 'Comida' },
  { value: 'peliculas',   label: 'Películas' },
  { value: 'series',      label: 'Series' },
  { value: 'canciones',   label: 'Canciones' },
  { value: 'videojuegos', label: 'Videojuegos' },
]

const categories: StoredCategory[] = []

export const categoriesService = {
  initUserCategories(userId: string): void {
    DEFAULT_CATEGORIES.forEach(({ value, label }) => {
      categories.push({ value, label, userId })
    })
  },

  getAll(userId?: string): Category[] {
    if (!userId) return DEFAULT_CATEGORIES
    return categories
      .filter((c) => c.userId === userId)
      .map(({ value, label }) => ({ value, label }))
  },

  add(label: string, userId: string): Category {
    const value = label.trim().toLowerCase().replace(/\s+/g, '-')
    const labelLower = label.trim().toLowerCase()
    const duplicate = categories.find(
      (c) => c.userId === userId && (c.value === value || c.label.toLowerCase() === labelLower)
    )
    if (duplicate) throw new Error('Category already exists')
    const stored: StoredCategory = { value, label: label.trim(), userId }
    categories.push(stored)
    return { value, label: stored.label }
  },

  remove(value: string, userId: string): void {
    const index = categories.findIndex((c) => c.value === value && c.userId === userId)
    if (index === -1) throw new Error('Category not found')
    categories.splice(index, 1)
  },
}
