import { useNavigate } from 'react-router-dom'
import { useRankings } from '../../context/RankingContext'
import { RankingCard } from '../../components/ranking/RankingCard'

export default function Home() {
  const navigate = useNavigate()
  const { rankings, removeRanking } = useRankings()

  const handleEdit   = (id: string) => navigate(`/edit/${id}`)
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-green-50">Mis Rankings</h1>
      {rankings.length === 0 ? (
        <p className="text-gray-500 dark:text-green-400">Aún no tienes rankings. ¡Crea uno!</p>
      ) : (
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
      )}
    </div>
  )
}
