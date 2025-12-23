import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, Moon, Sun, LogOut, Settings, Users, Camera } from 'lucide-react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { lang, t, searchQuery, setSearchQuery, activeUser, setActiveUser, notifications, setNotifications } = useApp();
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

  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          const result = re.target?.result as string;
          setActiveUser({...activeUser, avatar: result});
          setNotifications(prev => [{
            id: Date.now(),
            title: 'Identity Verified',
            message: 'Mustafa Shoukat, your profile image has been analyzed and synced across the ecosystem.',
            type: 'system',
            time: 'Just now',
            read: false
          }, ...prev]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <header className="h-20 bg-surface/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-[80] transition-all duration-500 shadow-sm">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-sm lg:max-w-md hidden sm:block group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 group-focus-within:text-brand transition-all duration-300" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-semibold shadow-sm"
            placeholder={t('searchPlaceholder')}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Persisting Theme Toggle UI */}
        <button 
          onClick={toggleTheme} 
          className="relative flex items-center h-10 w-20 px-1 bg-slate-200 dark:bg-slate-800 rounded-full transition-all duration-500 border border-slate-300/50 dark:border-slate-700/50 hover:shadow-lg"
        >
          <div className={`absolute flex items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-brand shadow-xl transition-all duration-500 transform ${isDark ? 'translate-x-10' : 'translate-x-0'}`}>
            {isDark ? <Moon size={16} className="text-white" /> : <Sun size={16} className="text-amber-500" />}
          </div>
          <div className="flex justify-between w-full px-2 opacity-40">
            <Sun size={14} className="text-slate-500" />
            <Moon size={14} className="text-slate-400" />
          </div>
        </button>

        <div className="relative" ref={notificationRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className={`p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-brand transition-all relative border border-slate-200 dark:border-slate-800 shadow-sm ${showNotifications ? 'ring-2 ring-brand/20 border-brand/50' : 'hover:scale-105'}`}>
            <Bell size={20} />
            {notifications.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>}
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
        
        <div className="relative" ref={profileRef}>
          <div onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-4 cursor-pointer group p-1.5 rounded-[1.5rem] hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-brand/10 flex items-center justify-center text-brand font-black font-outfit shadow-sm border border-brand/20 overflow-hidden ring-2 ring-transparent group-hover:ring-brand/30 transition-all">
                {activeUser.avatar ? <img src={activeUser.avatar} className="w-full h-full object-cover" /> : activeUser.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full"></div>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold leading-none text-slate-900 dark:text-white font-outfit">{activeUser.name}</p>
              <p className="text-[10px] text-brand uppercase font-black mt-2 tracking-widest">{activeUser.role}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-4 w-72 bg-surface dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 p-3 ring-1 ring-black/10">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 text-center relative">
                 <div className="relative inline-block mb-4 cursor-pointer group/avatar" onClick={handleAvatarUpload}>
                    <img src={activeUser.avatar || 'https://i.pravatar.cc/150'} className="w-24 h-24 rounded-[2rem] object-cover shadow-2xl border-4 border-white dark:border-slate-800 group-hover/avatar:brightness-75 transition-all" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all"><Camera size={24} className="text-white" /></div>
                 </div>
                 <h4 className="font-bold text-lg font-outfit">{activeUser.name}</h4>
              </div>
              <div className="p-2 space-y-1">
                <button onClick={() => {navigate('/settings'); setShowProfile(false);}} className="w-full flex items-center gap-4 px-5 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><Settings size={20} /> Settings</button>
                <button onClick={() => {navigate('/users'); setShowProfile(false);}} className="w-full flex items-center gap-4 px-5 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><Users size={20} /> Team</button>
                <button className="w-full flex items-center gap-4 px-5 py-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"><LogOut size={20} /> Sign out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;