import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, [location]);

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint (optional but good practice)
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch('http://127.0.0.1:8000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.log('Backend logout failed, proceeding with local logout');
    }
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Update state
    setIsAuthenticated(false);
    setShowLogout(false);
    
    // Navigate to login
    navigate('/login');
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setShowLogout(!showLogout);
    } else {
      navigate('/login');
    }
  };

  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0b0e14]/80 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-[0_20px_50px_rgba(199,153,255,0.08)]">
      <div className="flex items-center gap-8">
        <span 
          onClick={() => navigate('/')} 
          className="text-2xl font-black tracking-tighter text-[#c799ff] font-headline cursor-pointer select-none"
        >
          Money Minter
        </span>
        <div className="hidden md:flex gap-6">
          <NavLink 
            to="/" 
            className={({isActive}) => `nav-link ${isActive ? 'active text-[#ecedf6]' : 'text-[#ecedf6]/60'} hover:text-[#ecedf6] transition-colors font-headline font-bold text-sm tracking-tight cursor-pointer`}
          >
            Home
          </NavLink>
          <NavLink 
            to="/xray" 
            className={({isActive}) => `nav-link ${isActive ? 'active text-[#ecedf6]' : 'text-[#ecedf6]/60'} hover:text-[#ecedf6] transition-colors font-headline font-bold text-sm tracking-tight cursor-pointer`}
          >
            Portfolio X-Ray
          </NavLink>
          <NavLink 
            to="/health" 
            className={({isActive}) => `nav-link ${isActive ? 'active text-[#ecedf6]' : 'text-[#ecedf6]/60'} hover:text-[#ecedf6] transition-colors font-headline font-bold text-sm tracking-tight cursor-pointer`}
          >
            Health Score
          </NavLink>
          <NavLink 
            to="/fire" 
            className={({isActive}) => `nav-link ${isActive ? 'active text-[#ecedf6]' : 'text-[#ecedf6]/60'} hover:text-[#ecedf6] transition-colors font-headline font-bold text-sm tracking-tight cursor-pointer`}
          >
            FIRE Planner
          </NavLink>
          <NavLink 
            to="/couple" 
            className={({isActive}) => `nav-link ${isActive ? 'active text-[#ecedf6]' : 'text-[#ecedf6]/60'} hover:text-[#ecedf6] transition-colors font-headline font-bold text-sm tracking-tight cursor-pointer`}
          >
            Couple's Planner
          </NavLink>
          <NavLink 
            to="/goals" 
            className={({isActive}) => `nav-link ${isActive ? 'active text-[#ecedf6]' : 'text-[#ecedf6]/60'} hover:text-[#ecedf6] transition-colors font-headline font-bold text-sm tracking-tight cursor-pointer`}
          >
            Zindagi Goals
          </NavLink>
          <NavLink 
            to="/life" 
            className={({isActive}) => `nav-link ${isActive ? 'active text-[#ecedf6]' : 'text-[#ecedf6]/60'} hover:text-[#ecedf6] transition-colors font-headline font-bold text-sm tracking-tight cursor-pointer`}
          >
            Life Events
          </NavLink>
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        <button className="p-2 hover:bg-[#282c36]/50 rounded-lg transition-all text-[#ecedf6] cursor-pointer">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="relative">
          <button 
            onClick={handleProfileClick} 
            className="p-2 hover:bg-[#282c36]/50 rounded-lg transition-all text-[#ecedf6] cursor-pointer"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          
          {showLogout && isAuthenticated && (
            <div className="absolute right-0 top-12 bg-[#1c2028] border border-[#22262f] rounded-lg shadow-lg py-2 min-w-[150px]">
              <button 
                onClick={() => { navigate('/profile'); setShowLogout(false); }}
                className="w-full px-4 py-2 text-left text-[#ecedf6] hover:bg-[#282c36]/50 transition-colors text-sm font-body"
              >
                Profile
              </button>
              <button 
                onClick={() => { navigate('/profile-setup'); setShowLogout(false); }}
                className="w-full px-4 py-2 text-left text-[#c799ff] hover:bg-[#282c36]/50 transition-colors text-sm font-body"
              >
                Edit Financial Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-[#ff6e84] hover:bg-[#282c36]/50 transition-colors text-sm font-body"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}