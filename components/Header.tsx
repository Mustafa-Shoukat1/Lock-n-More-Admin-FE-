import React, { useState } from 'react';
import { Bell, Search, Globe, ChevronDown, Moon, Sun } from 'lucide-react';
import { useTranslation } from '../App';

const Header: React.FC = () => {
  const { lang, setLang, t } = useTranslation();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ms' : 'en');
  };

  return (
    <header className="h-16 bg-surface border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20 transition-colors duration-300 shadow-sm">
      <div className="flex items-center w-full max-w-lg">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white dark:focus:bg-slate-800 transition-all sm:text-sm"
            placeholder={t('searchPlaceholder')}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand hover:bg-brand/10 transition-all shadow-sm border border-transparent hover:border-brand/20"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button 
          onClick={toggleLang}
          className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand transition-all shadow-sm"
        >
          <Globe size={16} className="text-brand" />
          <span>{lang === 'en' ? 'English' : 'B. Melayu'}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
        
        <div className="relative">
          <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand transition-all shadow-sm border border-transparent hover:border-brand/20">
            <Bell size={20} />
          </button>
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white dark:border-slate-900"></span>
          </span>
        </div>
        
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Maxsure Trading</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sdn Bhd</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;