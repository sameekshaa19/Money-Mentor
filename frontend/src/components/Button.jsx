export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false,
  ...props 
}) {
  const base = "px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-slate-800 hover:text-slate-800",
    ghost: "text-slate-500 hover:bg-slate-100",
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
}
