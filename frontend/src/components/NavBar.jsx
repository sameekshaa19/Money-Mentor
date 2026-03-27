import { NavLink, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate();

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
            Portfolio
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
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-[#282c36]/50 rounded-lg transition-all text-[#ecedf6] cursor-pointer">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 hover:bg-[#282c36]/50 rounded-lg transition-all text-[#ecedf6] cursor-pointer">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </nav>
  )
}