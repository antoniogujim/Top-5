import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { RankingProvider } from './context/RankingContext'
import { CategoryProvider } from './context/CategoryContext'
import { AppRouter } from './router'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CategoryProvider>
          <RankingProvider>
            <AppRouter />
          </RankingProvider>
        </CategoryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
