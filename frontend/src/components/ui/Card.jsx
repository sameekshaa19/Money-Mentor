export function Card({ children, className = '', style = {}, onClick }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        padding: '20px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...style,
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
      {children}
    </div>
  )
}