import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/NavBar'
import Home from './pages/Home'
import PortfolioXRay from './pages/PortfolioXRay'
import FirePlanner from './pages/FirePlanner'
import ZindagiGoals from './pages/ZindagiGoals'
import LifeEventAdvisor from './pages/LifeEventAdvisor'
import CouplePlanner from './pages/CouplePlanner'
import HealthScore from './pages/HealthScore'
import Profile from './pages/Profile'
import ProfileSetup from './pages/ProfileSetup'
import Login from './pages/Login'

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
    setLoading(false)
  }, [])

  // Listen for storage changes (for logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' && !e.newValue) {
        setIsAuthenticated(false)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c799ff]/30 border-t-[#c799ff] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#a9abb3] font-label">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        {/* Background layers */}
        <div className="aurora-bg"></div>
        <div className="constellation-overlay"></div>

        <Navbar />

        {/* Main content wrapper */}
        <main className="w-full flex-grow flex flex-col pt-20">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/xray" element={
              <ProtectedRoute>
                <PortfolioXRay />
              </ProtectedRoute>
            } />
            <Route path="/health" element={
              <ProtectedRoute>
                <HealthScore />
              </ProtectedRoute>
            } />
            <Route path="/fire" element={
              <ProtectedRoute>
                <FirePlanner />
              </ProtectedRoute>
            } />
            <Route path="/couple" element={
              <ProtectedRoute>
                <CouplePlanner />
              </ProtectedRoute>
            } />
            <Route path="/goals" element={
              <ProtectedRoute>
                <ZindagiGoals />
              </ProtectedRoute>
            } />
            <Route path="/life" element={
              <ProtectedRoute>
                <LifeEventAdvisor />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/profile-setup" element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-[#10131a] py-16 px-6 relative z-10 w-full mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="space-y-4">
              <span className="text-3xl font-black tracking-tighter text-[#c799ff] font-headline">Money Minter</span>
              <p className="text-[#a9abb3] max-w-xs text-sm font-body">AI-powered personal finance for modern India. Secure, private, and powered by the stars.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h5 className="font-headline font-bold text-[#ecedf6]">Navigate</h5>
                <nav className="flex flex-col gap-2 text-sm text-[#a9abb3] font-body">
                  <a href="/" className="hover:text-[#c799ff] transition-colors cursor-pointer">Dashboard</a>
                  <a href="/goals" className="hover:text-[#c799ff] transition-colors cursor-pointer">Zindagi Goals</a>
                  <a href="/life" className="hover:text-[#c799ff] transition-colors cursor-pointer">Life Events</a>
                  <a href="/fire" className="hover:text-[#c799ff] transition-colors cursor-pointer">FIRE Planner</a>
                </nav>
              </div>
              <div className="space-y-4">
                <h5 className="font-headline font-bold text-[#ecedf6]">Legal</h5>
                <nav className="flex flex-col gap-2 text-sm text-[#a9abb3] font-body">
                  <a className="hover:text-[#c799ff] transition-colors cursor-pointer">Privacy</a>
                  <a className="hover:text-[#c799ff] transition-colors cursor-pointer">Terms</a>
                  <a className="hover:text-[#c799ff] transition-colors cursor-pointer">Security</a>
                </nav>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#22262f] flex flex-col md:flex-row justify-between text-[10px] font-label text-[#a9abb3] tracking-[0.2em] uppercase">
            <p>© 2025 Money Minter. All rights reserved.</p>
            <p>Celestial Ledger — Designed for the digital elite.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}