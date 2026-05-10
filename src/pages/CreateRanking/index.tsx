import { useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import type { Category } from '../../types'
import { TOP_SIZE } from '../../utils/constants'
import { useRankings } from '../../context/RankingContext'
import { useCategories } from '../../context/CategoryContext'

const EMPTY_ITEMS = Array(TOP_SIZE).fill('')

export default function CreateRanking() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const { addRanking, updateRanking, rankings, canCreate } = useRankings()
  const { categories, addCategory, removeCategory } = useCategories()

  const existing = isEditing ? rankings.find((r) => r.id === id) : null

  const [title, setTitle]       = useState(() => existing?.title ?? '')
  const [category, setCategory] = useState<Category>(() => existing?.category ?? 'movies')
  const [items, setItems]       = useState<string[]>(() =>
    existing ? EMPTY_ITEMS.map((_, i) => existing.items[i]?.title ?? '') : EMPTY_ITEMS
  )
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')

  if (isEditing && !existing) return <Navigate to="/" replace />
  if (!isEditing && !canCreate) return <Navigate to="/premium" replace />

  const updateItem = (index: number, value: string) =>
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)))

  const handleAddCategory = () => {
    if (!newLabel.trim()) return
    addCategory(newLabel)
    setNewLabel('')
    setIsAdding(false)
  }

  const handleRemoveCategory = (value: string) => {
    removeCategory(value)
    if (category === value) setCategory(categories[0]?.value ?? '')
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = 'El título es obligatorio'
    if (!items[0].trim()) next.item0 = 'La posición 1 es obligatoria'
    return next
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length > 0) { setErrors(next); return }

    const itemsFiltered = items
      .map((t, i) => ({ position: i + 1, title: t.trim() }))
      .filter((item) => item.title !== '')

    if (isEditing) {
      await updateRanking(id!, { title: title.trim(), category, items: itemsFiltered })
    } else {
      const ok = await addRanking({ title: title.trim(), category, isPublic: true, items: itemsFiltered })
      if (!ok) return
    }

    navigate('/')
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8 dark:text-green-50">
        {isEditing ? 'Editar Ranking' : 'Crear Ranking'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Título */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold dark:text-green-200">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })) }}
            placeholder="Ej: Mis películas favoritas"
            className="px-4 py-2 rounded-xl border border-green-200 dark:border-green-700 bg-white dark:bg-green-950 dark:text-green-50 outline-none focus:ring-2 focus:ring-green-400"
          />
          {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
        </div>

        {/* Categoría */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold dark:text-green-200">Categoría</label>
          <div className="flex flex-wrap gap-2 items-center">

            {categories.map((cat) => (
              <div
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full border text-sm font-medium cursor-pointer select-none ${
                  category === cat.value
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white dark:bg-green-950 border-green-200 dark:border-green-700 dark:text-green-200'
                }`}
              >
                <span>{cat.label}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemoveCategory(cat.value) }}
                  className={`w-4 h-4 flex items-center justify-center rounded-full text-xs leading-none ${
                    category === cat.value
                      ? 'hover:bg-green-500'
                      : 'text-gray-400 dark:text-green-500 hover:text-red-500 dark:hover:text-red-400'
                  }`}
                >
                  ×
                </button>
              </div>
            ))}

            {isAdding ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleAddCategory() }
                    if (e.key === 'Escape') { setIsAdding(false); setNewLabel('') }
                  }}
                  placeholder="Nueva categoría"
                  className="px-3 py-1.5 text-sm rounded-full border border-green-300 dark:border-green-600 bg-white dark:bg-green-950 dark:text-green-50 outline-none focus:ring-2 focus:ring-green-400 w-36"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-green-600 text-white text-sm hover:bg-green-700"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setNewLabel('') }}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-green-200 dark:border-green-700 text-gray-400 hover:text-red-500 text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-7 h-7 flex items-center justify-center rounded-full border border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 text-lg leading-none"
              >
                +
              </button>
            )}
          </div>
        </div>

        {/* Top 5 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold dark:text-green-200">Top 5</label>
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => { updateItem(i, e.target.value); if (i === 0) setErrors((p) => ({ ...p, item0: '' })) }}
                  placeholder={i === 0 ? 'Obligatorio' : 'Opcional'}
                  className="flex-1 px-4 py-2 rounded-xl border border-green-200 dark:border-green-700 bg-white dark:bg-green-950 dark:text-green-50 outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            ))}
          </div>
          {errors.item0 && <span className="text-xs text-red-500">{errors.item0}</span>}
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 py-2.5 rounded-xl border border-green-300 dark:border-green-700 text-sm font-medium dark:text-green-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
          >
            {isEditing ? 'Guardar cambios' : 'Crear ranking'}
          </button>
        </div>

      </form>
    </div>
  )
}
