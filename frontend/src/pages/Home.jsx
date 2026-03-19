import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Financial Wisdom, <br />
          <span className="text-blue-600">Powered by Gemini.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          The all-in-one AI financial mentor for the modern Indian investor. 
          Analyze portfolios, track FIRE goals, and optimize taxes in seconds.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="secondary" className="px-10 py-4 text-lg" onClick={() => navigate('/xray')}>
            Start Portfolio X-Ray
          </Button>
          <Button variant="outline" className="px-10 py-4 text-lg" onClick={() => navigate('/health')}>
            Check Health Score
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Portfolio X-Ray', desc: 'upload CAMS/KFintech PDFs for instant XIRR & overlap analysis.', icon: '🔍', path: '/xray' },
          { title: 'FIRE Planner', desc: 'Calculate your retirement corpus & monthly SIP to escape the 9-5.', icon: '🔥', path: '/fire' },
          { title: 'Couple Finance', desc: 'Optimize joint taxes, HRA, and NPS for you and your partner.', icon: '💑', path: '/couple' }
        ].map((feat) => (
          <Card key={feat.title} className="hover:shadow-xl transition-all cursor-pointer border-none bg-white/50" onClick={() => navigate(feat.path)}>
            <div className="text-4xl mb-4">{feat.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
            <p className="text-slate-500 leading-relaxed">{feat.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
