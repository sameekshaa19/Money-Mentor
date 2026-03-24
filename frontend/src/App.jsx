import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import PortfolioXRay from './pages/PortfolioXRay'
import CouplePlanner from './pages/CouplePlanner'
import HealthScore from './pages/HealthScore'
import FirePlanner from './pages/FirePlanner'
import ZindagiGoals from './pages/ZindagiGoals'
import LifeEventAdvisor from './pages/LifeEventAdvisor'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3' }}>
        <Navbar />
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
          <Routes>
            <Route path="/" element={<PortfolioXRay />} />
            <Route path="/couple" element={<CouplePlanner />} />
            <Route path="/health" element={<HealthScore />} />
            <Route path="/fire" element={<FirePlanner />} />
            <Route path="/goals" element={<ZindagiGoals />} />
            <Route path="/life" element={<LifeEventAdvisor />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}