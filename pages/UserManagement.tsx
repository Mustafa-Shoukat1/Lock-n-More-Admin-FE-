import React, { useState } from 'react';
import { UserPlus, Shield, Activity, MoreVertical, Mail, Laptop, Smartphone, Globe, Lock, X, CheckCircle2, ShieldCheck, MailPlus } from 'lucide-react';
import { useApp } from '../App';

const UserManagement: React.FC = () => {
  const { t, staff, setStaff } = useApp();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');

  const handleInvite = () => {
    if (!inviteName || !inviteEmail) return;
    const newStaff = {
      id: `staff${staff.length + 1}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole as any,
      active: true,
      lastLogin: 'Never'
    };
    setStaff([...staff, newStaff]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-outfit">Staff & Permissions</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Manage your team accounts and security roles.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-brand/20 active:scale-95 transition-all"
        >
          <UserPlus size={16} /> {t('inviteStaff')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((s) => (
          <UserCard key={s.id} name={s.name} role={s.role} email={s.email} active={s.active} lastLogin={s.lastLogin} />
        ))}
      </div>

      <div className="bg-surface dark:bg-slate-800/50 p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-3">
            <Lock size={20} className="text-brand" /> Active Access Sessions
          </h3>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Globe size={14} /> Global IP Tracking Enabled
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Entity</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">IP Address</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Last Activity</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              <SessionRow device="Admin Panel (iPhone 15)" ip="103.1.94.2" time="2m ago" type="mobile" />
              <SessionRow device="Sales Portal (MacBook)" ip="210.4.55.1" time="Just now" type="desktop" />
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center">
                   <MailPlus size={24} />
                 </div>
                 <h2 className="text-2xl font-bold font-outfit dark:text-white">Invite Team Member</h2>
               </div>
               <button onClick={() => setShowInviteModal(false)} className="p-2 text-slate-400 hover:text-red-500"><X size={24}/></button>
             </div>

             <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">FULL NAME</label>
                  <input 
                    type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Siti Aminah"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold dark:text-white shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">EMAIL ADDRESS</label>
                  <input 
                    type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="staff@locksnmore.com"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold dark:text-white shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ACCESS ROLE</label>
                  <select 
                    value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold dark:text-white"
                  >
                    <option value="agent">Sales Agent</option>
                    <option value="admin">Admin Manager</option>
                  </select>
                </div>

                <div className="p-5 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 flex items-start gap-4">
                  <ShieldCheck size={20} className="text-emerald-500 mt-1" />
                  <p className="text-[11px] text-emerald-600 font-bold leading-relaxed uppercase">Invitees will receive a magic link for onboarding and 2FA setup.</p>
                </div>

                <button 
                  onClick={handleInvite}
                  className="w-full py-5 bg-brand text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 shadow-xl shadow-brand/30 transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={20} /> Deploy Invitation
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserCard = ({ name, role, email, active, lastLogin }: any) => (
  <div className="bg-surface p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-lg relative group transition-all hover:scale-[1.02] hover:border-brand/30">
    <div className={`absolute top-8 right-8 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${active ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-slate-300'}`}></div>
    <div className="flex items-start justify-between mb-6">
      <div className="w-14 h-14 rounded-2xl bg-brand/5 dark:bg-brand/10 border border-brand/10 flex items-center justify-center text-xl font-bold text-brand font-outfit uppercase shadow-inner">
        {name.charAt(0)}
      </div>
      <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"><MoreVertical size={18} /></button>
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">{name}</h3>
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand mb-6">
      <Shield size={10} strokeWidth={3} /> {role}
    </div>
    <div className="space-y-3 pt-5 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
        <Mail size={14} className="text-slate-400" /> {email}
      </div>
      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
        <Activity size={14} className="text-slate-400" /> Last seen {lastLogin}
      </div>
    </div>
  </div>
);

const SessionRow = ({ device, ip, time, type }: any) => (
  <tr className="group transition-colors">
    <td className="py-5 px-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-brand/5 rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-all shadow-sm">
          {type === 'mobile' ? <Smartphone size={16} /> : <Laptop size={16} />}
        </div>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{device}</span>
      </div>
    </td>
    <td className="py-5 px-4">
      <span className="text-[11px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{ip}</span>
    </td>
    <td className="py-5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{time}</td>
    <td className="py-5 px-4">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
      </div>
    </td>
  </tr>
);

export default UserManagement;