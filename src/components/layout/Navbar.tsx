import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="flex items-center gap-6 px-6 py-4 border-b bg-green-200 border-green-200 dark:border-green-900 dark:bg-green-950">
      <Link to="/" className="font-bold text-xl dark:text-green-100">Top5</Link>
      {isAuthenticated && (
        <Link to="/create" className="dark:text-green-200">Crear</Link>
      )}
      <Link to="/premium" className="dark:text-green-200">Premium</Link>

      <div className="ml-auto flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="px-3 py-1.5 text-sm font-medium rounded-full border border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800 dark:text-green-200"
        >
          {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        </button>

        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              className="text-sm font-medium dark:text-green-200 hover:underline"
            >
              {user?.username}
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm font-medium rounded-full border border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800 dark:text-green-200"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/auth" className="dark:text-green-200">Acceder</Link>
        )}
      </div>
    </nav>
  )
}
