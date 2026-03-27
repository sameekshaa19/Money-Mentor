import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/NavBar'
import PortfolioXRay from './pages/PortfolioXRay'
import FirePlanner from './pages/FirePlanner'
import ZindagiGoals from './pages/ZindagiGoals'
import LifeEventAdvisor from './pages/LifeEventAdvisor'
import CouplePlanner from './pages/CouplePlanner'
import HealthScore from './pages/HealthScore'
import Profile from './pages/Profile'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      {/* Background layers */}
      <div className="aurora-bg"></div>
      <div className="constellation-overlay"></div>

      <Navbar />

      {/* Main content wrapper */}
      <main className="w-full flex-grow flex flex-col pt-20">
        <Routes>
          <Route path="/" element={<PortfolioXRay />} />
          <Route path="/health" element={<HealthScore />} />
          <Route path="/fire" element={<FirePlanner />} />
          <Route path="/couple" element={<CouplePlanner />} />
          <Route path="/goals" element={<ZindagiGoals />} />
          <Route path="/life" element={<LifeEventAdvisor />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
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
    </BrowserRouter>
  )
}