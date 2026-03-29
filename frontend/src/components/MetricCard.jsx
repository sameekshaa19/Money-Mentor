export default function MetricCard({ label, value, subtext, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-white">
      <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colors[color].split(' ')[1]}`}>{value}</div>
      {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
    </div>
  );
}
