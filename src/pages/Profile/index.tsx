import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useRankings } from '../../context/RankingContext'
import { FREE_LIST_LIMIT } from '../../utils/constants'

export default function Profile() {
  const { user } = useAuth()
  const { rankings, canCreate } = useRankings()

  if (!user) return null

  const initials = user.username.slice(0, 2).toUpperCase()
  const rankingsUsed = rankings.length
  const isPremium = user.isPremium

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-green-50">Mi perfil</h1>

      <div className="bg-white dark:bg-green-950 border border-green-100 dark:border-green-800 rounded-2xl p-6 flex items-center gap-5 mb-4">
        <div className="w-16 h-16 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center text-2xl font-bold text-green-800 dark:text-green-100 shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-xl font-semibold dark:text-green-50">{user.username}</p>
          <p className="text-sm text-gray-500 dark:text-green-400">{user.email}</p>
          <span className={`mt-1.5 inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
            isPremium
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
          }`}>
            {isPremium ? 'Premium' : 'Gratis'}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-green-950 border border-green-100 dark:border-green-800 rounded-2xl p-6 mb-4">
        <h2 className="font-semibold mb-4 dark:text-green-100">Tu plan</h2>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500 dark:text-green-400">Rankings creados</span>
          <span className="font-medium dark:text-green-100">
            {rankingsUsed}{!isPremium && ` / ${FREE_LIST_LIMIT}`}
          </span>
        </div>
        {!isPremium && (
          <div className="w-full bg-green-100 dark:bg-green-800 rounded-full h-1.5 mb-4">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min((rankingsUsed / FREE_LIST_LIMIT) * 100, 100)}%` }}
            />
          </div>
        )}
        {isPremium ? (
          <p className="text-sm text-green-600 dark:text-green-400">Rankings ilimitados incluidos.</p>
        ) : (
          <div>
            <p className="text-sm text-gray-500 dark:text-green-400 mb-1">
              {Math.max(FREE_LIST_LIMIT - rankingsUsed, 0)} rankings disponibles.
            </p>
            <Link to="/premium" className="text-xs font-medium text-green-700 dark:text-green-400 hover:underline">
              Mejorar plan →
            </Link>
          </div>
        )}
      </div>

      <Link
        to={canCreate ? '/create' : '/premium'}
        className="block w-full text-center py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
      >
        {canCreate ? 'Crear nuevo ranking' : 'Mejorar plan para crear más'}
      </Link>
    </div>
  )
}
