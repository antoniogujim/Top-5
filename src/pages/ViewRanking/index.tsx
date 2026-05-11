import { useParams, Navigate, Link } from 'react-router-dom'
import { useRankings } from '../../context/RankingContext'
import { useCategories } from '../../context/CategoryContext'

export default function ViewRanking() {
  const { id } = useParams()
  const { rankings } = useRankings()
  const { categories } = useCategories()

  const ranking = rankings.find((r) => r.id === id)
  if (!ranking) return <Navigate to="/" replace />

  const categoryLabel = categories.find((c) => c.value === ranking.category)?.label ?? ranking.category

  return (
    <div className="max-w-md mx-auto px-6 py-10">

      {/* Categoría y título */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-full">
            {categoryLabel}
          </span>
          {!ranking.isPublic && (
            <span className="text-xs font-medium text-gray-500 dark:text-green-500 bg-gray-100 dark:bg-green-900 px-2 py-0.5 rounded-full">
              Privado
            </span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-bold dark:text-green-50">{ranking.title}</h1>
      </div>

      {/* Top 5 */}
      <ol className="flex flex-col gap-3">
        {ranking.items.map((item) => (
          <li
            key={item.position}
            className="flex items-center gap-4 bg-white dark:bg-green-950 border border-green-100 dark:border-green-800 rounded-2xl px-4 py-3"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 font-bold shrink-0">
              {item.position}
            </span>
            <span className="text-sm font-medium text-black dark:text-green-100">{item.title}</span>
          </li>
        ))}
      </ol>

      <Link
        to="/"
        className="mt-8 inline-block text-sm text-green-700 dark:text-green-400 hover:underline"
      >
        ← Ver todos los rankings
      </Link>
    </div>
  )
}
