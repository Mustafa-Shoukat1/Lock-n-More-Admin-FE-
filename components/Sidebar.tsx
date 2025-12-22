import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3,
  Inbox, 
  BrainCircuit, 
  Package, 
  X
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
    { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: t('analytics'), icon: <BarChart3 size={20} />, path: '/analytics' },
    { name: t('inbox'), icon: <Inbox size={20} />, path: '/inbox' },
    { name: t('aiManager'), icon: <BrainCircuit size={20} />, path: '/ai-manager' },
    { name: t('products'), icon: <Package size={20} />, path: '/products' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-[100] w-72 bg-sidebar border-r border-slate-200 dark:border-slate-800 
    transition-transform duration-300 ease-in-out transform
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:relative md:translate-x-0 md:flex md:flex-col md:flex-shrink-0
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-transparent md:border-none">
            <AppLogo />
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-slate-500 hover:text-brand md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-none">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand text-white shadow-lg shadow-brand/25'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-brand'
                  }`
                }
              >
                <span className="mr-3 transition-transform group-hover:scale-110">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center text-white font-black font-outfit shadow-md">
                  {activeUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{activeUser.name}</p>
                <p className="text-[10px] text-brand font-black uppercase tracking-wider truncate">{activeUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;