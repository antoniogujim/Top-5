import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface CategoryItem {
  value: string
  label: string
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { value: 'food',       label: 'Comida' },
  { value: 'movies',     label: 'Películas' },
  { value: 'series',     label: 'Series' },
  { value: 'songs',      label: 'Canciones' },
  { value: 'videogames', label: 'Videojuegos' },
]

interface CategoryContextType {
  categories: CategoryItem[]
  addCategory: (label: string) => void
  removeCategory: (value: string) => void
}

const CategoryContext = createContext<CategoryContextType>({
  categories: DEFAULT_CATEGORIES,
  addCategory: () => {},
  removeCategory: () => {},
})

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES)

  const addCategory = (label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return
    const value = trimmed.toLowerCase().replace(/\s+/g, '-')
    if (categories.find((c) => c.value === value)) return
    setCategories((prev) => [...prev, { value, label: trimmed }])
  }

  const removeCategory = (value: string) =>
    setCategories((prev) => prev.filter((c) => c.value !== value))

  return (
    <CategoryContext.Provider value={{ categories, addCategory, removeCategory }}>
      {children}
    </CategoryContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCategories() {
  return useContext(CategoryContext)
}
