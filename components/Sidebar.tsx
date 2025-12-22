import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  BrainCircuit, 
  Package, 
  Users, 
  Settings
} from 'lucide-react';
import { AppLogo } from './Icons';
import { useTranslation } from '../App';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: t('inbox'), icon: <Inbox size={20} />, path: '/inbox' },
    { name: t('aiManager'), icon: <BrainCircuit size={20} />, path: '/ai-manager' },
    { name: t('products'), icon: <Package size={20} />, path: '/products' },
    { name: t('users'), icon: <Users size={20} />, path: '/users' },
    { name: t('settings'), icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-sidebar border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="flex flex-col h-0 flex-1">
          <div className="flex items-center h-16 flex-shrink-0 px-6">
            <AppLogo />
          </div>
          <nav className="flex-1 px-4 space-y-1 mt-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand/10 text-brand border border-brand/20 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="h-10 w-10 rounded-full bg-brand flex items-center justify-center text-white font-bold font-outfit">MS</div>
            <div className="ml-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Mustafa Shoukat</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;