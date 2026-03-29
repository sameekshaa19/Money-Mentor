export default function Card({ children, className = '', title }) {
  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold mb-4 text-slate-800">{title}</h3>}
      {children}
    </div>
  );
}
