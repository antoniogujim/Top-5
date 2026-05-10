import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { RankingProvider } from './context/RankingContext'
import { CategoryProvider } from './context/CategoryContext'
import { ToastProvider } from './context/ToastContext'
import { AppRouter } from './router'

function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <CategoryProvider>
            <RankingProvider>
              <AppRouter />
            </RankingProvider>
          </CategoryProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  )
}

export default App
