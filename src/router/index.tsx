import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import Home from '../pages/Home'
import CreateRanking from '../pages/CreateRanking'
import ViewRanking from '../pages/ViewRanking'
import Premium from '../pages/Premium'
import Profile from '../pages/Profile'
import Auth from '../pages/Auth'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/create"      element={<CreateRanking />} />
        <Route path="/edit/:id"    element={<CreateRanking />} />
        <Route path="/ranking/:id" element={<ViewRanking />} />
        <Route path="/premium"     element={<Premium />} />
        <Route path="/profile"     element={<Profile />} />
        <Route path="/auth"        element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}
