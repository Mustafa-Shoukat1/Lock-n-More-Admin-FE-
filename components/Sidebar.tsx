import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3,
  MessageSquare, 
  BrainCircuit, 
  Package, 
  X,
  Settings,
  Users
} from 'lucide-react';
import { AppLogo } from './Icons';
import { useApp } from '../App';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, activeUser } = useApp();

  const navItems = [
    { name: t('dashboard'), icon: <LayoutDashboard size={22} />, path: '/dashboard' },
    { name: t('analytics'), icon: <BarChart3 size={22} />, path: '/analytics' },
    { name: t('inbox'), icon: <MessageSquare size={22} />, path: '/inbox' },
    { name: t('aiManager'), icon: <BrainCircuit size={22} />, path: '/ai-manager' },
    { name: t('products'), icon: <Package size={22} />, path: '/products' },
  ];

  const adminItems = [
    { name: 'Team Access', icon: <Users size={20} />, path: '/users' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-[100] w-72 bg-sidebar dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 
    transition-transform duration-0 ease-in-out transform
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:relative md:translate-x-0 md:flex md:flex-col md:flex-shrink-0
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 px-8">
            <AppLogo />
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-slate-500 md:hidden"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-none">
            <p className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Core Console</p>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl group ${
                    isActive
                      ? 'bg-brand text-white shadow-2xl shadow-brand/30 translate-x-1'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-brand'
                  }`
                }
              >
                <span className="mr-3.5">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}

            <div className="pt-8 space-y-2">
              <p className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Administration</p>
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-bold rounded-2xl group ${
                      isActive
                        ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xl translate-x-1'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-brand'
                    }`
                  }
                >
                  <span className="mr-3.5">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="p-6 mt-auto">
            <div className="flex items-center p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="relative">
                <div className="h-11 w-11 rounded-2xl bg-brand/10 flex items-center justify-center text-brand font-black font-outfit shadow-sm border border-brand/20 overflow-hidden">
                  {activeUser.avatar ? <img src={activeUser.avatar} className="w-full h-full object-cover" /> : activeUser.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-md"></div>
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-outfit">{activeUser.name}</p>
                <p className="text-[9px] text-brand font-black uppercase tracking-[0.15em] truncate mt-0.5">{activeUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;