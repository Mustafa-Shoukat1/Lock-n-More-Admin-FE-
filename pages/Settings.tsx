
import React, { useState } from 'react';
import { UserCircle, Users, Layers, Lock, ShieldCheck, Camera, Volume2, Save, Trash2, Smartphone, Zap, Activity, Mail, LogOut, MailPlus, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { activeUser, setActiveUser, staff, setStaff, playNotificationSound } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'integrations' | 'security'>('profile');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const navigate = useNavigate();
  
  const [editName, setEditName] = useState(activeUser.name);
  const [editEmail, setEditEmail] = useState(activeUser.email || '');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');

  const handleSaveProfile = () => {
    setActiveUser({ ...activeUser, name: editName, email: editEmail });
    alert("Super Admin profile node successfully re-synchronized.");
  };

  const handleInvite = () => {
    if (!inviteName || !inviteEmail) return;
    const newStaff = {
      id: `staff${Date.now()}`,
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

  const deleteStaffNode = (id: string) => {
    if (staff.find(s => s.id === id)?.role === 'super_admin') {
      alert("Unauthorized Error: Primary Root Node cannot be deleted.");
      return;
    }
    setStaff(staff.filter(s => s.id !== id));
  };

  const handleAvatarUpload = () => {
    const dummyAvatar = `https://i.pravatar.cc/150?u=${Date.now()}`;
    setActiveUser({...activeUser, avatar: dummyAvatar});
  };

  return (
    <div className="p-4 sm:p-10 space-y-12 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 bg-slate-900 p-12 rounded-[4rem] text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 pointer-events-none text-brand">
          <ShieldCheck size={300} />
        </div>
        <div className="relative z-10 space-y-4 text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand/20 border border-brand/30 rounded-full">
            <ShieldCheck size={16} className="text-brand" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Auth Node: Super Admin</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-outfit tracking-tighter leading-none">Admin Hub</h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl">Manage your identity, team perimeters, and system-wide security logic.</p>
        </div>
        <div className="relative z-10 flex gap-4 w-full lg:w-auto">
           <button onClick={() => setShowInviteModal(true)} className="flex-1 lg:flex-none px-10 py-5 bg-brand text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand/40">New Staff Node</button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-12 text-left">
        {/* Navigation Sidebar */}
        <div className="w-full xl:w-80 space-y-2">
          <p className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Management Layers</p>
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserCircle size={18} />} label="My Identity" />
          <NavButton active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={<Users size={18} />} label="User Access Control" />
          <NavButton active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations'} icon={<Layers size={18} />} label="Signal Gateways" />
          <NavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Lock size={18} />} label="Logic Lockdown" />
          <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-4 px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
               <LogOut size={18} /> Exit Admin Hub
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <HubSection title="Administrator Profile" description="Edit your root identity details and biometric representation.">
                <div className="flex flex-col md:flex-row items-center gap-10 p-10 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3.5rem] mb-10 shadow-sm">
                   <div className="relative group">
                      <div className="w-40 h-40 rounded-[3rem] bg-brand/10 border-4 border-white dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02]">
                        {activeUser.avatar ? <img src={activeUser.avatar} className="w-full h-full object-cover" /> : <UserCircle size={80} className="text-brand opacity-20"/>}
                      </div>
                      <button onClick={handleAvatarUpload} className="absolute -bottom-4 -right-4 p-4 bg-brand text-white rounded-[1.5rem] shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-white dark:border-slate-900">
                         <Camera size={20} />
                      </button>
                   </div>
                   <div className="flex-1 text-center md:text-left space-y-4">
                      <h4 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white leading-none">{activeUser.name}</h4>
                      <p className="text-[10px] text-brand font-black uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-2"><CheckCircle2 size={12}/> Root Security Admin</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                         <span className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-[9px] font-black uppercase border border-emerald-500/20 shadow-sm">Fully Verified</span>
                         <span className="px-4 py-2 bg-blue-500/10 text-blue-600 rounded-xl text-[9px] font-black uppercase border border-blue-500/20 shadow-sm">Shopify Admin</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Full Identity Name</label>
                    <input type="text" value={editName} onChange={(e)=>setEditName(e.target.value)} className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Contact Logic (Email)</label>
                    <input type="email" value={editEmail} onChange={(e)=>setEditEmail(e.target.value)} className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand transition-all" />
                  </div>
                </div>
                
                <button onClick={handleSaveProfile} className="px-10 py-5 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                   <Save size={18}/> Update Root Identity
                </button>
              </HubSection>

              <HubSection title="Telemetry Signal Test" description="Verify high-fidelity notification tunes across all active perimeters.">
                <div className="p-10 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-brand/10 text-brand rounded-[1.5rem] shadow-inner">
                      <Volume2 size={32} />
                    </div>
                    <div>
                      <p className="text-xl font-bold font-outfit">Notification Signal</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5 leading-relaxed">High-Fidelity "Ding" Tune (v1.0)</p>
                    </div>
                  </div>
                  <button 
                    onClick={playNotificationSound}
                    className="w-full md:w-auto px-10 py-5 bg-white dark:bg-slate-800 text-brand dark:text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Zap size={18} fill="currentColor"/> Trigger Signal
                  </button>
                </div>
              </HubSection>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-brand/5 p-8 rounded-[3rem] border border-brand/20">
                <div className="text-left flex items-center gap-6">
                   <div className="p-4 bg-brand text-white rounded-2xl shadow-xl shadow-brand/30"><ShieldCheck size={32}/></div>
                   <div>
                      <h3 className="text-2xl font-bold font-outfit tracking-tighter uppercase leading-none">User Access Control</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-3">Active staff perimeters: {staff.length}</p>
                   </div>
                </div>
                <button onClick={() => setShowInviteModal(true)} className="w-full md:w-auto px-10 py-5 bg-brand text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand/40">Authorize New Access Node</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staff.map((s) => (
                  <StaffCard key={s.id} staff={s} onDelete={() => deleteStaffNode(s.id)} />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'integrations' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <HubSection title="Platform Node Integration" description="Live synchronization gateways with external business perimeters.">
                 <div className="space-y-4">
                    <ConnectorItem name="Shopify Commerce Brain" detail="locksnmore.myshopify.com" status="CONNECTED" icon={<Smartphone className="text-emerald-500"/>} />
                    <ConnectorItem name="WhatsApp Cloud Signals" detail="Meta ID: 104550111..." status="ACTIVE" icon={<Zap className="text-brand"/>} />
                    <ConnectorItem name="Meta Messenger Node" detail="Instagram API Activated" status="ACTIVE" icon={<Activity size={18} className="text-blue-500"/>} />
                 </div>
              </HubSection>
            </div>
          )}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[4rem] p-12 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-10">
               <h2 className="text-3xl font-bold font-outfit tracking-tighter uppercase">Authorize Access Node</h2>
               <button onClick={() => setShowInviteModal(false)} className="p-2 text-slate-400 hover:text-red-500"><X size={32}/></button>
             </div>
             <div className="space-y-8 text-left">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Node Identity Name</label>
                   <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="w-full p-5 bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] text-sm font-bold outline-none" placeholder="e.g. Agent Daniel" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Auth Node Email</label>
                   <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full p-5 bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] text-sm font-bold outline-none" placeholder="daniel@locksnmore.com" />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Auth Access Role</label>
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setInviteRole('agent')} className={`p-6 rounded-2xl border-2 font-black text-xs uppercase transition-all ${inviteRole === 'agent' ? 'border-brand bg-brand/5 text-brand shadow-xl' : 'border-slate-100 dark:border-slate-800'}`}>Sales Agent</button>
                      <button onClick={() => setInviteRole('admin')} className={`p-6 rounded-2xl border-2 font-black text-xs uppercase transition-all ${inviteRole === 'admin' ? 'border-brand bg-brand/5 text-brand shadow-xl' : 'border-slate-100 dark:border-slate-800'}`}>Admin Node</button>
                   </div>
                </div>
                <button onClick={handleInvite} className="w-full py-6 bg-brand text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2.5rem] flex items-center justify-center gap-3 shadow-2xl shadow-brand/40">
                  <MailPlus size={20} /> Deploy Access Signal
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HubSection = ({ title, description, children }: any) => (
  <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="mb-10 text-left">
      <h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter leading-none text-slate-900 dark:text-white">{title}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 leading-relaxed max-w-lg">{description}</p>
    </div>
    {children}
  </div>
);

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${active ? 'bg-brand text-white shadow-2xl shadow-brand/30 translate-x-1' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-brand'}`}>
     {icon} {label}
  </button>
);

const StaffCard = ({ staff, onDelete }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-brand transition-all text-left">
     <div className="flex items-start justify-between mb-8">
        <div className="relative">
           <img src={staff.avatar} className="w-20 h-20 rounded-[2rem] object-cover shadow-xl border-4 border-white dark:border-slate-800" />
           <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 ${staff.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
        </div>
        <button onClick={onDelete} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
     </div>
     <h4 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white leading-tight">{staff.name}</h4>
     <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mt-3 flex items-center gap-2"><ShieldCheck size={14}/> {staff.role.replace('_', ' ')} Node</p>
     <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><Mail size={14}/> {staff.email}</div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><Activity size={14}/> Last Access: {staff.lastLogin}</div>
     </div>
  </div>
);

const ConnectorItem = ({ name, detail, status, icon }: any) => (
  <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-brand transition-all group shadow-sm">
     <div className="flex items-center gap-6">
       <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm group-hover:scale-110 transition-all group-hover:bg-brand group-hover:text-white">{icon}</div>
       <div>
         <p className="text-lg font-bold text-slate-900 dark:text-white font-outfit">{name}</p>
         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-60">{detail}</p>
       </div>
     </div>
     <span className={`text-[9px] font-black px-5 py-2.5 rounded-xl uppercase tracking-[0.2em] shadow-sm ${status === 'CONNECTED' || status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>{status}</span>
  </div>
);

export default Settings;
