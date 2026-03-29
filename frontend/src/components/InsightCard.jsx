export default function InsightCard({ insight, type = 'info' }) {
  const types = {
    info: 'bg-blue-50 border-blue-100 text-blue-800 icon-🔵',
    warning: 'bg-amber-50 border-amber-100 text-amber-800 icon-🟠',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-800 icon-🟢',
  };

  const [bg, border, text, icon] = types[type].split(' ');

  return (
    <div className={`p-5 rounded-xl border ${bg} ${border} ${text} flex gap-4`}>
      <span className="text-2xl mt-1">{icon.split('-')[1]}</span>
      <div className="text-lg leading-relaxed font-medium">
        {insight}
      </div>
    </div>
  );
}
