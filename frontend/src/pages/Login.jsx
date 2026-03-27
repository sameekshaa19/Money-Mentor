import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const payload = isSignUp ? { name, email, password } : { email, password };
      
      const res = await axios.post(`http://localhost:8000${endpoint}`, payload);
      const data = res.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', data.email);
      
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-page active flex items-center justify-center min-h-screen pt-20 pb-20 px-6">
      <div className="glass-card-static rounded-3xl p-8 md:p-12 max-w-md w-full fade-up relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c799ff]/10 blur-[80px] rounded-full z-0 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex justify-center mb-6 text-[#c799ff]">
            <span className="material-symbols-outlined text-5xl">stars</span>
          </div>
          <h2 className="font-headline text-3xl font-black tracking-tighter text-[#ecedf6] mb-2 text-center">{isSignUp ? 'Join the Stars' : 'Welcome Back'}</h2>
          <p className="text-[#a9abb3] text-sm font-body mb-8 text-center">{isSignUp ? 'Create your celestial identity.' : 'Access your secured ledger.'}</p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-[#ff6e84]/10 border border-[#ff6e84]/30 text-[#ff6e84] text-xs font-label text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest pl-1">Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-3 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors" />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest pl-1">Email Address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-3 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest pl-1">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-3 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors" />
            </div>

            <button type="submit" disabled={loading} className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#c799ff] to-[#bc87fe] rounded-xl text-[#340064] font-headline font-bold hover:shadow-[0_0_20px_rgba(199,153,255,0.3)] transition-all cursor-pointer disabled:opacity-70 uppercase tracking-widest text-xs">
              {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-[#22262f]">
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-[#a9abb3] hover:text-[#c799ff] text-[11px] font-label tracking-[0.2em] uppercase transition-colors cursor-pointer block w-full">
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Create one'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
