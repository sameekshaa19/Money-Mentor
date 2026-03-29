import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  
  const userName = localStorage.getItem('userName') || 'Guest User';
  const userEmail = localStorage.getItem('userEmail') || 'guest@celestial.xyz';
  
  return (
    <div className="section-page active">
      <div className="relative min-h-screen pt-10 pb-32">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-12 fade-up">
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-[#ecedf6] leading-none mb-4">
              User <span className="text-[#c799ff]">Profile</span>
            </h1>
            <p className="text-[#a9abb3] text-lg font-body">Manage your celestial identity and secure your ledger.</p>
          </div>

          <div className="glass-card-static rounded-3xl p-8 md:p-12 fade-up relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c799ff]/10 blur-[80px] rounded-full"></div>
            
            <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
              <div className="w-32 h-32 rounded-full border-4 border-[#22262f] bg-[#0d1117] flex items-center justify-center relative shadow-2xl shrink-0">
                <span className="material-symbols-outlined text-7xl text-[#30363d]">account_circle</span>
                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#c799ff] to-[#bc87fe] text-[#340064] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-[0_0_20px_rgba(199,153,255,0.4)]">
                  <span className="material-symbols-outlined text-sm font-bold">edit</span>
                </button>
              </div>

              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-8 border-b border-[#22262f] pb-4">
                  <h3 className="font-headline font-bold text-2xl text-[#ecedf6]">Identity Details</h3>
                  <button onClick={() => setIsEditing(!isEditing)} className="px-5 py-2 rounded-xl text-xs font-label font-bold tracking-widest uppercase transition-all border border-[#30363d] text-[#a9abb3] hover:text-[#c799ff] hover:border-[#c799ff]/40 cursor-pointer">
                    {isEditing ? 'Save Details' : 'Edit Profile'}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">Full Name</label>
                       <input type="text" defaultValue={userName} disabled={!isEditing}
                         className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">Email Address</label>
                       <input type="email" defaultValue={userEmail} disabled={!isEditing}
                         className="w-full bg-[#0d1117]/80 border border-[#22262f] rounded-xl px-4 py-3.5 text-[#ecedf6] font-body focus:border-[#c799ff]/50 outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                       />
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                     <label className="text-[10px] font-label text-[#a9abb3] uppercase tracking-widest block pl-1">Security Status</label>
                     <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#4af8e3]/5 border border-[#4af8e3]/20 hover:bg-[#4af8e3]/10 transition-colors">
                       <div className="w-10 h-10 rounded-full bg-[#4af8e3]/10 flex items-center justify-center shrink-0">
                         <span className="material-symbols-outlined text-[#4af8e3]">verified_user</span>
                       </div>
                       <div>
                         <p className="font-headline font-bold text-sm text-[#4af8e3]">Two-Factor Authentication Active</p>
                         <p className="text-xs text-[#a9abb3] font-body mt-1">Your account is secured with biometric access.</p>
                       </div>
                       <button className="ml-auto text-xs font-bold text-[#4af8e3] uppercase tracking-widest hover:text-[#33e9d5] transition-colors cursor-pointer hidden sm:block">
                         Manage
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#22262f] flex justify-between items-center relative z-10">
              <button 
                onClick={() => alert('A password reset link has been sent to your registered email address.')}
                className="text-[#a9abb3] hover:text-[#ecedf6] font-label text-xs tracking-widest uppercase font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">lock_reset</span> Change Password
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  navigate('/');
                }}
                className="text-[#ff6e84] hover:bg-[#ff6e84]/10 px-6 py-2.5 rounded-xl font-label text-xs tracking-widest uppercase font-bold transition-all cursor-pointer flex items-center gap-2 border border-[#ff6e84]/20 hover:border-[#ff6e84]/40"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
