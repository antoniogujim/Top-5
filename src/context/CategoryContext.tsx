import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { api } from '../api/client'

export interface CategoryItem {
  value: string
  label: string
}

interface CategoryContextType {
  categories: CategoryItem[]
  addCategory: (label: string) => Promise<void>
  removeCategory: (value: string) => Promise<void>
}

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  addCategory: async () => {},
  removeCategory: async () => {},
})

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<CategoryItem[]>([])

  useEffect(() => {
    api.get<CategoryItem[]>('/categories')
      .then(setCategories)
      .catch(() => {})
  }, [])

  const addCategory = async (label: string): Promise<void> => {
    const trimmed = label.trim()
    if (!trimmed) return
    const value = trimmed.toLowerCase().replace(/\s+/g, '-')
    if (categories.find((c) => c.value === value)) return
    const created = await api.post<CategoryItem>('/categories', { label: trimmed })
    setCategories((prev) => [...prev, created])
  }

  const removeCategory = async (value: string): Promise<void> => {
    await api.del(`/categories/${value}`)
    setCategories((prev) => prev.filter((c) => c.value !== value))
  }

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
