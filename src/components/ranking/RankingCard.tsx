import { useState } from 'react'
import type { Ranking } from '../../types'
import { useCategories } from '../../context/CategoryContext'
import { useShare } from '../../hooks/useShare'
import { Modal } from '../ui/Modal'

interface RankingCardProps {
  ranking: Ranking
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function RankingCard({ ranking, onEdit, onDelete }: RankingCardProps) {
  const { categories } = useCategories()
  const { share, copied } = useShare()
  const [showConfirm, setShowConfirm] = useState(false)

  const categoryLabel = categories.find((c) => c.value === ranking.category)?.label ?? ranking.category

  return (
    <div className="bg-white dark:bg-green-950 rounded-2xl shadow-lg shadow-green-200 dark:shadow-green-950 border border-green-100 dark:border-green-800 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-green-100 dark:border-green-800">
        <span className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-full">
          {categoryLabel}
        </span>
        <h2 className="mt-2 text-base font-bold text-black dark:text-green-50 leading-tight">
          {ranking.title}
        </h2>
      </div>

      {/* Items */}
      <ol className="flex-1 px-4 py-3 space-y-2">
        {ranking.items.map((item) => (
          <li key={item.position} className="flex items-center gap-3">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-bold shrink-0">
              {item.position}
            </span>
            <span className="text-sm text-black dark:text-green-100">{item.title}</span>
          </li>
        ))}
      </ol>

      {/* Actions */}
      <div className="flex border-t border-green-100 dark:border-green-800">
        <button
          onClick={() => onEdit(ranking.id)}
          className="flex-1 py-2 text-sm font-medium text-black dark:text-green-200 hover:bg-green-50 dark:hover:bg-green-900"
        >
          Editar
        </button>
        <button
          onClick={() => share(ranking.id, ranking.title)}
          className="flex-1 py-2 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 border-x border-green-100 dark:border-green-800"
        >
          {copied ? '¡Copiado!' : 'Compartir'}
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex-1 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
        >
          Eliminar
        </button>
      </div>

      {showConfirm && (
        <Modal
          title="Eliminar ranking"
          confirmLabel="Eliminar"
          confirmDanger
          onConfirm={() => onDelete(ranking.id)}
          onCancel={() => setShowConfirm(false)}
        >
          ¿Seguro que quieres eliminar <strong>"{ranking.title}"</strong>? Esta acción no se puede deshacer.
        </Modal>
      )}
    </div>
  )
}
