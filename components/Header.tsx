
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, Moon, Sun, LogOut, Settings, Users, Camera, X, MessageCircle, AlertCircle, RefreshCw, Menu, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../App';
// Fix: Import useNavigate from 'react-router' to resolve export issues in specific environments.
import { useNavigate } from 'react-router';

const Header: React.FC = () => {
  const { lang, t, searchQuery, setSearchQuery, activeUser, setActiveUser, notifications, setNotifications, setSidebarOpen } = useApp();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <header className="h-20 bg-surface/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-[80] transition-all duration-500 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-6 flex-1">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-slate-500 dark:text-slate-400 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
        >
          <Menu size={24} />
        </button>

        <div className="relative w-full max-w-[200px] sm:max-w-sm lg:max-w-md block group">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400 group-focus-within:text-brand transition-all duration-300" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand focus:bg-white dark:focus:bg-slate-900 transition-all text-xs sm:text-sm font-semibold shadow-sm"
            placeholder={t('searchPlaceholder')}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-5">
        <button 
          onClick={toggleTheme} 
          className="relative hidden sm:flex items-center h-10 w-20 px-1 bg-slate-200 dark:bg-slate-800 rounded-full transition-all duration-500 border border-slate-300/50 dark:border-slate-700/50 hover:shadow-lg"
        >
          <div className={`absolute flex items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-brand shadow-xl transition-all duration-500 transform ${isDark ? 'translate-x-10' : 'translate-x-0'}`}>
            {isDark ? <Moon size={16} className="text-white" /> : <Sun size={16} className="text-amber-500" />}
          </div>
        </button>

        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className={`p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-brand transition-all relative border border-slate-200 dark:border-slate-800 shadow-sm ${showNotifications ? 'ring-2 ring-brand/20 border-brand/50' : 'hover:scale-105'}`}
          >
            <Bell size={20} />
            {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[calc(100vw-2rem)] sm:w-96 bg-surface dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl p-2 overflow-hidden ring-1 ring-black/10 animate-in slide-in-from-top-4 duration-300">
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
                <h4 className="font-bold text-lg font-outfit text-slate-900 dark:text-white">Signals</h4>
                <button onClick={markAllRead} className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline">Mark read</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto scrollbar-none p-2 space-y-1">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-2xl flex gap-4 transition-all relative group ${n.read ? 'opacity-40' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${n.type === 'lead' ? 'bg-brand/10 text-brand' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {n.type === 'lead' ? <MessageCircle size={16}/> : <RefreshCw size={16}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-outfit truncate text-slate-900 dark:text-white">{n.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{n.message}</p>
                        <span className="text-[9px] font-black text-slate-400 uppercase mt-2 block">{n.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center opacity-30">
                    <AlertCircle size={40} className="mx-auto mb-4" />
                    <p className="text-sm font-bold font-outfit">Signals Clear</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 sm:mx-2"></div>
        
        {/* Super Admin Control Center Dropdown */}
        <div className="relative" ref={profileRef}>
          <div onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 sm:gap-4 cursor-pointer group p-1 sm:p-1.5 rounded-[1.5rem] hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <div className="relative">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-brand/10 flex items-center justify-center text-brand font-black font-outfit shadow-sm border border-brand/20 overflow-hidden group-hover:scale-105 transition-all">
                {activeUser.avatar ? <img src={activeUser.avatar} className="w-full h-full object-cover" /> : activeUser.name.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full"></div>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold leading-none text-slate-900 dark:text-white font-outfit">{activeUser.name}</p>
              <p className="text-[10px] text-brand uppercase font-black mt-2 tracking-[0.2em]">Super Admin</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 hidden sm:block transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-4 w-72 sm:w-80 bg-surface dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] p-4 ring-1 ring-black/10 animate-in slide-in-from-top-4 duration-300">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-3xl mb-4 border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-4 mb-4">
                    <img src={activeUser.avatar} className="w-14 h-14 rounded-2xl object-cover" />
                    <div className="min-w-0">
                       <h4 className="font-bold text-base font-outfit truncate">{activeUser.name}</h4>
                       <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1"><ShieldCheck size={10}/> Security Alpha</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <div className="flex-1 bg-white dark:bg-slate-800 p-2 rounded-xl text-center">
                       <p className="text-[8px] font-black text-slate-400 uppercase">Integrity</p>
                       <p className="text-xs font-bold text-brand">100%</p>
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-800 p-2 rounded-xl text-center">
                       <p className="text-[8px] font-black text-slate-400 uppercase">Latency</p>
                       <p className="text-xs font-bold text-brand">0.8ms</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-1">
                <p className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Control Nodes</p>
                <button onClick={() => {navigate('/settings'); setShowProfile(false);}} className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all group">
                   <div className="flex items-center gap-3"><Settings size={18} className="group-hover:rotate-45 transition-transform" /> Command Center</div>
                   <Zap size={14} className="text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all"><LogOut size={18} /> End Auth Session</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
