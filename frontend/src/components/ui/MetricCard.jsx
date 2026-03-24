export function MetricCard({ label, value, sub, color = '#a78bfa' }) {
  return (
    <div
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        padding: '16px 20px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#7c3aed'
        e.currentTarget.style.boxShadow = '0 0 0 1px #7c3aed40, 0 0 20px #7c3aed20'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#30363d'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}