import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-6xl font-bold text-green-500">404</span>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Página no encontrada
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        La URL que buscas no existe o fue eliminada.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-lg bg-green-500 px-5 py-2 text-white hover:bg-green-600 transition-colors"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
