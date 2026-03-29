export default function MetricCard({ label, value, subtext, color = 'blue' }) {
  const colors = {
    blue: 'text-[#4af8e3]',
    emerald: 'text-[#33e9d5]',
    amber: 'text-[#c799ff]',
    rose: 'text-[#ff6e84]',
  };

  return (
    <div className="p-4 rounded-xl border border-white/5 bg-[#22262f]/30">
      <div className="text-xs font-label font-bold text-[#a9abb3] uppercase mb-1">{label}</div>
      <div className={`text-2xl font-headline font-bold ${colors[color]}`}>{value}</div>
      {subtext && <div className="text-[10px] text-[#a9abb3] font-label mt-1">{subtext}</div>}
    </div>
  );
}
