import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { useRankings } from '../../context/RankingContext'

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const { canCreate } = useRankings()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const pillClass = 'px-3 py-1.5 text-sm font-medium rounded-full border border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800 dark:text-green-200'

  return (
    <nav className="px-4 sm:px-6 py-3 border-b bg-green-200 border-green-200 dark:border-green-900 dark:bg-green-950">

      {/* Fila principal */}
      <div className="flex items-center gap-3 sm:gap-6">
        <Link to="/" className="font-bold text-xl dark:text-green-100 shrink-0">Top5</Link>

        {/* Links de nav — solo en desktop */}
        {isAuthenticated && (
          <Link to={canCreate ? '/create' : '/premium'} className="hidden sm:block dark:text-green-200">
            {canCreate ? 'Crear' : 'Mejorar'}
          </Link>
        )}
        <Link to="/premium" className="hidden sm:block dark:text-green-200">Premium</Link>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggleTheme} className={pillClass}>
            <span className="hidden sm:inline">{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
            <span className="sm:hidden">{theme === 'light' ? 'Oscuro' : 'Claro'}</span>
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className={`hidden sm:inline-flex ${pillClass}`}>
                {user?.username}
              </Link>
              <button onClick={handleLogout} className={pillClass}>
                <span className="hidden sm:inline">Cerrar sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </>
          ) : (
            <Link to="/auth" className="dark:text-green-200">Acceder</Link>
          )}
        </div>
      </div>

      {/* Segunda fila — solo en móvil cuando hay sesión */}
      {isAuthenticated && (
        <div className="flex sm:hidden items-center gap-4 pt-2 mt-2 border-t border-green-300 dark:border-green-800">
          <Link to={canCreate ? '/create' : '/premium'} className="text-sm dark:text-green-200">
            {canCreate ? 'Crear' : 'Mejorar'}
          </Link>
          <Link to="/premium" className="text-sm dark:text-green-200">Premium</Link>
          <Link to="/profile" className="text-sm font-medium dark:text-green-200 ml-auto">
            {user?.username}
          </Link>
        </div>
      )}

    </nav>
  )
}
