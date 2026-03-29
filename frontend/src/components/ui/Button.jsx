export function Button({ children, onClick, variant = 'primary', disabled, style = {} }) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
      color: '#fff',
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: '#8b949e',
      border: '1px solid #30363d',
    },
    danger: {
      background: 'transparent',
      color: '#f85149',
      border: '1px solid #f8514940',
    },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 18px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.2s, transform 0.1s',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        ...variants[variant],
        ...style,
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={e => !disabled && (e.currentTarget.style.opacity = '1')}
    >
      {children}
    </button>
  )
}