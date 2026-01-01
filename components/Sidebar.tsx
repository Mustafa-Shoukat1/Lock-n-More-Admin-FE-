
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3,
  MessageSquare, 
  BrainCircuit, 
  Package, 
  X,
  Settings,
  BookOpen,
  ShoppingCart,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { AppLogo } from './Icons';
import { useApp } from '../App';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, activeUser, setIsLoggedIn, setActiveUser } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveUser(null);
    navigate('/login');
    onClose?.();
  };

  const navItems = [
    { name: t('dashboard'), icon: <LayoutDashboard size={22} />, path: '/dashboard' },
    { name: t('analytics'), icon: <BarChart3 size={22} />, path: '/analytics' },
    { name: t('inbox'), icon: <MessageSquare size={22} />, path: '/inbox' },
    { name: 'Orders', icon: <ShoppingCart size={22} />, path: '/orders' },
    { name: t('aiManager'), icon: <BrainCircuit size={22} />, path: '/ai-manager', role: ['super_admin', 'admin'] },
    { name: t('products'), icon: <Package size={22} />, path: '/products' },
  ];

  const secondaryItems = [
    { name: 'System Docs', icon: <BookOpen size={20} />, path: '/docs' },
    { name: 'Admin Hub', icon: <ShieldCheck size={20} />, path: '/settings' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-[100] w-72 bg-sidebar dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 
    transition-transform duration-300 ease-in-out transform
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:relative md:translate-x-0 md:flex md:flex-col md:flex-shrink-0
  `;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[95] bg-slate-900/50 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 px-8">
            <AppLogo />
            <button onClick={onClose} className="p-2 -mr-2 text-slate-500 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-none">
            <p className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Core Ops</p>
            {navItems.filter(i => !i.role || (activeUser && i.role.includes(activeUser.role))).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl group transition-all duration-300 ${
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
              <p className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Management</p>
              {secondaryItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-bold rounded-2xl group transition-all duration-300 ${
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

          <div className="p-6 mt-auto space-y-2">
            <NavLink to="/settings" onClick={() => onClose?.()}>
              <div className="flex items-center p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-brand transition-all group">
                <div className="relative">
                  <div className="h-11 w-11 rounded-2xl bg-brand/10 flex items-center justify-center text-brand font-black font-outfit shadow-sm border border-brand/20 overflow-hidden group-hover:scale-105 transition-all">
                    {activeUser?.avatar ? <img src={activeUser.avatar} className="w-full h-full object-cover" /> : activeUser?.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-md"></div>
                </div>
                <div className="ml-3 min-w-0 text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-outfit leading-tight">{activeUser?.name}</p>
                  <p className="text-[9px] text-brand font-black uppercase tracking-[0.15em] truncate mt-0.5">{activeUser?.role.replace('_', ' ')} Node</p>
                </div>
              </div>
            </NavLink>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all">
              <LogOut size={16}/> End Session
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
