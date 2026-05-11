import { useNavigate } from 'react-router-dom'
import { useRankings } from '../../context/RankingContext'
import { useCategories } from '../../context/CategoryContext'
import { RankingCard } from '../../components/ranking/RankingCard'

export default function Home() {
  const navigate = useNavigate()
  const { rankings, removeRanking, isLoading, page, totalPages, goToPage, categoryFilter, setCategoryFilter } = useRankings()
  const { categories } = useCategories()

  const handleEdit = (id: string) => navigate(`/edit/${id}`)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-green-50">Mis Rankings</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategoryFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            categoryFilter === ''
              ? 'bg-green-600 text-white border-green-600'
              : 'border-green-200 dark:border-green-700 text-gray-600 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900'
          }`}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              categoryFilter === cat.value
                ? 'bg-green-600 text-white border-green-600'
                : 'border-green-200 dark:border-green-700 text-gray-600 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
        </div>
      ) : rankings.length === 0 ? (
        <p className="text-gray-500 dark:text-green-400">Aún no tienes rankings. ¡Crea uno!</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rankings.map((ranking) => (
              <RankingCard
                key={ranking.id}
                ranking={ranking}
                onEdit={handleEdit}
                onDelete={removeRanking}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-green-200 dark:border-green-700 text-sm font-medium dark:text-green-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-50 dark:hover:bg-green-900"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-500 dark:text-green-400 px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-green-200 dark:border-green-700 text-sm font-medium dark:text-green-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-50 dark:hover:bg-green-900"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
