import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Navbar } from '../components/layout/Navbar'
import Home from '../pages/Home'
import CreateRanking from '../pages/CreateRanking'
import ViewRanking from '../pages/ViewRanking'
import Premium from '../pages/Premium'
import Profile from '../pages/Profile'
import Auth from '../pages/Auth'
import NotFound from '../pages/NotFound'
import { useAuth } from '../hooks/useAuth'

function AuthLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-green-200 border-t-green-600 animate-spin" />
    </div>
  )
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth()
  if (!isInitialized) return <AuthLoader />
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth()
  if (!isInitialized) return <AuthLoader />
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/create"      element={<PrivateRoute><CreateRanking /></PrivateRoute>} />
        <Route path="/edit/:id"    element={<PrivateRoute><CreateRanking /></PrivateRoute>} />
        <Route path="/ranking/:id" element={<ViewRanking />} />
        <Route path="/premium"     element={<Premium />} />
        <Route path="/profile"     element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/auth"        element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
        <Route path="*"            element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
