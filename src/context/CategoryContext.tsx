import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { api } from '../api/client'
import { useToast } from './ToastContext'

export interface CategoryItem {
  value: string
  label: string
}

interface CategoryContextType {
  categories: CategoryItem[]
  isLoading: boolean
  addCategory: (label: string) => Promise<void>
  removeCategory: (value: string) => Promise<void>
}

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  isLoading: false,
  addCategory: async () => {},
  removeCategory: async () => {},
})

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showError } = useToast()

  useEffect(() => {
    api.get<CategoryItem[]>('/categories')
      .then(setCategories)
      .catch(() => { showError('No se pudieron cargar las categorías') })
      .finally(() => setIsLoading(false))
  // showError is stable, safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addCategory = async (label: string): Promise<void> => {
    const trimmed = label.trim()
    if (!trimmed) return
    const value = trimmed.toLowerCase().replace(/\s+/g, '-')
    if (categories.find((c) => c.value === value)) return
    try {
      const created = await api.post<CategoryItem>('/categories', { label: trimmed })
      setCategories((prev) => [...prev, created])
    } catch {
      showError('No se pudo agregar la categoría')
    }
  }

  const removeCategory = async (value: string): Promise<void> => {
    try {
      await api.del(`/categories/${value}`)
      setCategories((prev) => prev.filter((c) => c.value !== value))
    } catch {
      showError('No se pudo eliminar la categoría')
    }
  }

  return (
    <CategoryContext.Provider value={{ categories, isLoading, addCategory, removeCategory }}>
      {children}
    </CategoryContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCategories() {
  return useContext(CategoryContext)
}
