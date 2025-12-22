import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Globe, ChevronDown, Moon, Sun, X, MessageSquare, Info, AlertTriangle, User, LogOut, Settings, Users, Check, Menu } from 'lucide-react';
import { useApp } from '../App';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from './Icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { lang, setLang, t, searchQuery, setSearchQuery, activeUser, setActiveUser, notifications, setNotifications } = useApp();
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
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.theme = newTheme;
    setIsDark(!isDark);
  };

  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          setActiveUser({...activeUser, avatar: re.target?.result as string});
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <header className="h-16 bg-surface/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-[80] transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-xs lg:max-w-md hidden sm:block group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400 group-focus-within:text-brand transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-medium shadow-inner"
            placeholder={t('searchPlaceholder')}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <button 
          onClick={toggleTheme} 
          className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand hover:bg-brand/10 transition-all border border-transparent hover:border-brand/30 shadow-sm"
          title="Toggle Light/Dark Mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className={`p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand transition-all relative border border-transparent shadow-sm ${showNotifications ? 'bg-brand/10 text-brand border-brand/30 ring-2 ring-brand/10' : ''}`}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-slate-100 dark:border-slate-800 rounded-full"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-surface dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden ring-1 ring-black/5">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <h4 className="font-bold text-sm">Alerts</h4>
                <button onClick={() => setNotifications([])} className="text-[10px] font-black text-brand uppercase hover:underline">Clear all</button>
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-thin">
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group">
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-xl h-fit ${n.type === 'lead' ? 'bg-brand/10 text-brand' : 'bg-red-500/10 text-red-500'}`}>
                        {n.type === 'lead' ? <MessageSquare size={14} /> : <AlertTriangle size={14} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold group-hover:text-brand transition-colors">{n.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                        <span className="text-[9px] font-medium text-slate-400 mt-2 block">{n.time}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-slate-400 text-xs italic">No new alerts</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
        
        <div className="relative" ref={profileRef}>
          <div onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2.5 cursor-pointer group p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand font-black font-outfit shadow-sm border border-brand/20 overflow-hidden ring-2 ring-transparent group-hover:ring-brand/20 transition-all">
                {activeUser.avatar ? <img src={activeUser.avatar} className="w-full h-full object-cover" /> : activeUser.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
            </div>
            <div className="hidden lg:block text-left mr-1">
              <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">{activeUser.name}</p>
              <p className="text-[9px] text-slate-500 uppercase font-black mt-1.5 tracking-widest">{activeUser.role}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-72 bg-surface dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl animate-in zoom-in duration-200 p-2 overflow-hidden ring-1 ring-black/10">
              <div className="p-5 border-b border-slate-50 dark:border-slate-800 text-center">
                 <div className="relative inline-block mb-3 group/avatar">
                    <img src={activeUser.avatar || 'https://i.pravatar.cc/150'} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-xl border-4 border-white dark:border-slate-800" />
                    <button 
                      onClick={handleAvatarUpload}
                      className="absolute -bottom-1 -right-1 p-2 bg-brand text-white rounded-xl shadow-lg opacity-0 group-hover/avatar:opacity-100 transition-all scale-90"
                    >
                      <User size={14} />
                    </button>
                 </div>
                 <h4 className="font-bold text-slate-900 dark:text-white">{activeUser.name}</h4>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{activeUser.role}</p>
              </div>
              <div className="p-2 space-y-1">
                <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all group">
                  <Settings size={18} className="group-hover:text-brand" /> Account settings
                </button>
                <button onClick={() => navigate('/users')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all group">
                  <Users size={18} className="group-hover:text-brand" /> Team members
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4"></div>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all">
                  <LogOut size={18} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;