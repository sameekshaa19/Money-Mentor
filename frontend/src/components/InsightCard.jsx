export default function InsightCard({ insight, type = 'info' }) {
  const types = {
    info: 'bg-[#c799ff]/10 border-[#c799ff]/20 text-[#c799ff] icon-✦',
    warning: 'bg-[#ff6e84]/10 border-[#ff6e84]/20 text-[#ff6e84] icon-⚠',
    success: 'bg-[#4af8e3]/10 border-[#4af8e3]/20 text-[#4af8e3] icon-◈',
  };

  const [bg, border, text, icon] = types[type].split(' ');

  return (
    <div className={`p-5 rounded-xl border ${bg} ${border} ${text} flex gap-4 glass-card transition-all`}>
      <span className="text-xl mt-0.5">{icon.split('-')[1]}</span>
      <div className="text-sm leading-relaxed font-body font-bold">
        {insight}
      </div>
    </div>
  );
}
