import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Portfolio X-Ray', path: '/xray', icon: '🔍' },
  { name: 'Health Score', path: '/health', icon: '🏥' },
  { name: 'FIRE Plan', path: '/fire', icon: '🔥' },
  { name: 'Goals', path: '/goals', icon: '🎯' },
  { name: 'Life Events', path: '/events', icon: '📅' },
  { name: 'Couple Finance', path: '/couple', icon: '💑' },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            MoneyMentor
          </h1>
        </div>
        <nav className="flex-1 mt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600'
                  : 'hover:bg-slate-800'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        {children}
      </main>
    </div>
  );
}
