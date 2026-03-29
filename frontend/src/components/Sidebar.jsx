import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Portfolio X-Ray' },
  { to: '/health', label: 'Health Score' },
  { to: '/fire', label: 'FIRE Planner' },
  { to: '/couple', label: "Couple's Planner" },
  { to: '/goals', label: 'Zindagi Goals' },
  { to: '/life', label: 'Life Events' },
]

export default function Navbar() {
  return (
    <nav style={{
      background: '#161b22',
      borderBottom: '1px solid #30363d',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      height: '60px',
    }}>
      <span style={{
        fontWeight: 700,
        fontSize: '16px',
        color: '#e6edf3',
        marginRight: '24px',
        whiteSpace: 'nowrap',
      }}>
        AI Money Minter
      </span>

      <div style={{
        display: 'flex',
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '50px',
        padding: '4px',
        gap: '2px',
      }}>
        {nav.map(({ to, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            padding: '6px 14px',
            borderRadius: '50px',
            fontSize: '13px',
            fontWeight: isActive ? 600 : 400,
            color: isActive ? '#0d1117' : '#8b949e',
            background: isActive ? '#e6edf3' : 'transparent',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            fontFamily: 'Poppins, sans-serif',
          })}>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}