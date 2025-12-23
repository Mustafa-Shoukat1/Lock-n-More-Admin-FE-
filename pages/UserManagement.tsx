import React, { useState } from 'react';
import { UserPlus, Shield, Activity, MoreVertical, Mail, Laptop, Smartphone, Lock, X, CheckCircle2, MailPlus } from 'lucide-react';
import { useApp } from '../App';

const UserManagement: React.FC = () => {
  const { staff, setStaff } = useApp();
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
      lastLogin: 'Never',
      avatar: `https://i.pravatar.cc/150?u=${inviteName}`
    };
    setStaff([...staff, newStaff]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
  };

  return (
    <div className="p-6 md:p-12 space-y-10 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-outfit">Staff Perimeter</h1>
          <p className="text-slate-500">Manage team accounts and security roles.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="w-full sm:w-auto px-10 py-4 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-md"
        >
          <UserPlus size={16} className="inline mr-2" /> Invite Node
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {staff.map((s) => (
          <UserCard key={s.id} name={s.name} role={s.role} email={s.email} active={s.active} lastLogin={s.lastLogin} avatar={s.avatar} />
        ))}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80">
          <div className="bg-surface dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl">
             <div className="flex items-center justify-between mb-10">
               <h2 className="text-2xl font-bold font-outfit">Invite Team Member</h2>
               <button onClick={() => setShowInviteModal(false)} className="p-2 text-slate-400"><X size={28}/></button>
             </div>
             <div className="space-y-6">
                <input 
                  type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full p-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold"
                />
                <input 
                  type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold"
                />
                <select 
                  value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold"
                >
                  <option value="agent">Sales Agent</option>
                  <option value="admin">Admin Manager</option>
                </select>
                <button onClick={handleInvite} className="w-full py-5 bg-brand text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3">
                  <MailPlus size={20} /> Send magic link
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserCard = ({ name, role, email, active, lastLogin, avatar }: any) => (
  <div className="bg-surface p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 relative shadow-sm">
    <div className={`absolute top-6 right-6 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${active ? 'bg-emerald-500 shadow-md' : 'bg-slate-300'}`}></div>
    <div className="flex items-start justify-between mb-6">
      <img src={avatar} className="w-16 h-16 rounded-2xl object-cover shadow-inner" />
      <button className="p-2 text-slate-400"><MoreVertical size={20} /></button>
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-outfit tracking-tight">{name}</h3>
    <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-2 flex items-center gap-2"><Shield size={10} /> {role}</p>
    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 space-y-3">
      <div className="flex items-center gap-3 text-xs font-medium text-slate-500"><Mail size={14}/> {email}</div>
      <div className="flex items-center gap-3 text-xs font-medium text-slate-500"><Activity size={14}/> Last activity {lastLogin}</div>
    </div>
  </div>
);

export default UserManagement;