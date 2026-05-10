import type { Category } from '../types'

const categories: Category[] = [
  { value: 'food', label: 'Comida' },
  { value: 'movies', label: 'Películas' },
  { value: 'series', label: 'Series' },
  { value: 'songs', label: 'Canciones' },
  { value: 'videogames', label: 'Videojuegos' },
]

export const categoriesService = {
  getAll(): Category[] {
    return categories
  },

  add(label: string): Category {
    const value = label.trim().toLowerCase().replace(/\s+/g, '-')
    if (categories.find((c) => c.value === value)) {
      throw new Error('Category already exists')
    }
    const category: Category = { value, label: label.trim() }
    categories.push(category)
    return category
  },

  remove(value: string): void {
    const index = categories.findIndex((c) => c.value === value)
    if (index === -1) throw new Error('Category not found')
    categories.splice(index, 1)
  },
}
