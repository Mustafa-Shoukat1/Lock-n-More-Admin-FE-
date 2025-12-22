import React from 'react';
import { UserPlus, Shield, Activity, MoreVertical, Mail, Lock, Smartphone, Globe } from 'lucide-react';
import { useTranslation } from '../App';

const UserManagement: React.FC = () => {
  const { t, lang } = useTranslation();

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-outfit">{t('users')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage team permissions and track active staff sessions.</p>
        </div>
        <button className="px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-brand/20 transition-all flex items-center gap-2 active:scale-95">
          <UserPlus size={18} /> {t('inviteStaff')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { name: 'Mustafa Shoukat', role: 'super_admin', email: 'mustafa@maxsure.com', active: true },
          { name: 'Siti Aminah', role: 'admin', email: 'siti@maxsure.com', active: true },
          { name: 'John Doe', role: 'agent', email: 'john@maxsure.com', active: false },
        ].map((user) => (
          <div key={user.name} className="bg-surface p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative group transition-all hover:border-brand/30">
            <div className={`absolute top-6 right-6 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${user.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 rounded-3xl bg-brand/5 dark:bg-brand/10 border border-brand/10 flex items-center justify-center text-2xl font-bold text-brand font-outfit">
                {user.name.charAt(0)}
              </div>
              <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"><MoreVertical size={20} /></button>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-outfit mb-1">{user.name}</h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand mb-6">
              <Shield size={12} /> {user.role.replace('_', ' ')}
            </div>
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                <Mail size={16} className="text-slate-400" /> {user.email}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                <Activity size={16} className="text-slate-400" /> {lang === 'en' ? 'Last active' : 'Aktif terakhir'}: {user.active ? 'Kini' : '2 hari lalu'}
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand transition-all">
                Permissions
              </button>
              <button className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand transition-all">
                Sessions
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3 font-outfit">
          <Smartphone size={22} className="text-brand" /> {t('sessions')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device / Browser</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location / IP</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Login Time</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { device: 'iPhone 15 Pro (Safari)', location: 'Kuala Lumpur, MY (1.9.3.4)', time: '2 Jam Lalu' },
                { device: 'MacBook Pro (Chrome)', location: 'Petaling Jaya, MY (110.2.1.0)', time: 'Sekarang' },
                { device: 'Windows 11 (Edge)', location: 'Shah Alam, MY (192.168.1.1)', time: 'Semalam' },
              ].map((session, idx) => (
                <tr key={idx} className="group transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-brand/5 rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-all"><Smartphone size={16} /></div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{session.device}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">{session.location}</span>
                    </div>
                  </td>
                  <td className="py-5 text-xs font-bold text-slate-500">{session.time}</td>
                  <td className="py-5">
                    <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg uppercase tracking-tighter">Active</span>
                  </td>
                  <td className="py-5 text-right">
                    <button className="text-[10px] font-black text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;