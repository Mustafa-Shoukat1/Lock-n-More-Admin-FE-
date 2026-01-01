
import React, { useState } from 'react';
import { useApp } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLogo } from '../components/Icons';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, Info } from 'lucide-react';

const Login: React.FC = () => {
  const { setIsLoggedIn, setActiveUser, staff } = useApp();
  const [email, setEmail] = useState('mustafa@locksnmore.com');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const user = staff.find(s => s.email === email);
      if (user && password === 'admin') {
        setIsLoggedIn(true);
        setActiveUser(user);
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        setError('Unauthorized Perimeter Entry: Invalid Node Credentials.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-inter">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in duration-700">
        <div className="flex flex-col items-center text-center space-y-6">
          <AppLogo className="scale-125 mb-4" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white font-outfit tracking-tighter uppercase">Authorized Entry</h1>
            <p className="text-slate-500 text-sm font-medium">TOTO Perimeter Node Control Hub</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-8 sm:p-10 rounded-[3rem] shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold">
               <ShieldCheck size={18} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Credential Node</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-all" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white outline-none focus:border-brand/50 transition-all font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand transition-all" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white outline-none focus:border-brand/50 transition-all font-medium text-sm"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all">
            {loading ? 'Authenticating...' : 'Authorize Entry'}
            {!loading && <ArrowRight size={18} />}
          </button>

          <div className="p-4 bg-white/5 rounded-2xl flex items-start gap-3 border border-white/10">
            <Info size={16} className="text-brand shrink-0 mt-0.5" />
            <div className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
              System Test Node Active.<br/>
              PW: <span className="text-white">admin</span> for all staff signals.
            </div>
          </div>
        </form>

        <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">SYSTEM TOTO NODE // ENCRYPTED ALPHA</p>
      </div>
    </div>
  );
};

export default Login;
