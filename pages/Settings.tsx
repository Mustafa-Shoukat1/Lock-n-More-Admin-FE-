
import React, { useState } from 'react';
import { UserCircle, Users, Layers, Lock, ShieldCheck, Camera, Volume2, Save, Trash2, Smartphone, Zap, Activity, Mail, LogOut, MailPlus, CheckCircle2, X, AlertTriangle, ShieldAlert, Key, Globe } from 'lucide-react';
import { useApp } from '../App';
// Fix: Import useNavigate from 'react-router' to resolve missing export errors from 'react-router-dom'.
import { useNavigate } from 'react-router';

const Settings: React.FC = () => {
  const { activeUser, setActiveUser, staff, setStaff, playNotificationSound } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'integrations' | 'system'>('profile');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const navigate = useNavigate();
  
  const [editName, setEditName] = useState(activeUser.name);
  const [editEmail, setEditEmail] = useState(activeUser.email || '');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');

  const handleSaveProfile = () => {
    setActiveUser({ ...activeUser, name: editName, email: editEmail });
    alert("Super Admin profile successfully synchronized across the TOTO ecosystem.");
  };

  const handleInvite = () => {
    if (!inviteName || !inviteEmail) return;
    const newStaff = {
      id: `staff-${Date.now()}`,
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
      alert("Unauthorized: Primary Super Admin node cannot be decommissioned.");
      return;
    }
    if (window.confirm("Authorize permanent node decommissioning?")) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const handleAvatarUpload = () => {
    const dummyAvatar = `https://i.pravatar.cc/150?u=${Date.now()}`;
    setActiveUser({...activeUser, avatar: dummyAvatar});
  };

  return (
    <div className="p-4 sm:p-10 space-y-12 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">
      {/* Admin Hub Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 bg-slate-900 p-12 rounded-[4rem] text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 pointer-events-none text-brand">
          <ShieldAlert size={300} />
        </div>
        <div className="relative z-10 space-y-5 text-left">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand/20 border border-brand/30 rounded-full">
            <ShieldCheck size={20} className="text-brand" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Node ID: Super Admin Alpha</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-outfit tracking-tighter leading-none">Command Center</h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl">Mustafa Shoukat, your root-level perimeter controls are centralized here. Manage identity, team access, and system integrity.</p>
        </div>
        <div className="relative z-10 flex gap-4 w-full lg:w-auto">
           <button onClick={() => setShowInviteModal(true)} className="flex-1 lg:flex-none px-10 py-5 bg-brand text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl shadow-brand/40 active:scale-95">Authorize New Node</button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-12 text-left">
        {/* Navigation Layers Sidebar */}
        <div className="w-full xl:w-80 space-y-2">
          <p className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 border-l-2 border-transparent">System Hierarchy</p>
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserCircle size={20} />} label="Identity Hub" />
          <NavButton active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={<Users size={20} />} label="User Access Nodes" />
          <NavButton active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} icon={<Layers size={20} />} label="Signal Gateways" />
          <NavButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Lock size={20} />} label="System Lockdown" />
          <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-5 px-8 py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border border-transparent hover:border-red-500/20">
               <LogOut size={20} /> End Session
            </button>
          </div>
        </div>

        {/* Content Node Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <HubSection title="Administrator Identity" description="Edit your root biometric profile and authorized contact logic.">
                <div className="flex flex-col md:flex-row items-center gap-12 p-12 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[4rem] mb-12 shadow-sm">
                   <div className="relative group">
                      <div className="w-48 h-48 rounded-[3.5rem] bg-brand/10 border-4 border-white dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.03]">
                        {activeUser.avatar ? <img src={activeUser.avatar} className="w-full h-full object-cover" /> : <UserCircle size={100} className="text-brand opacity-20"/>}
                      </div>
                      <button onClick={handleAvatarUpload} className="absolute -bottom-4 -right-4 p-5 bg-brand text-white rounded-[2rem] shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-white dark:border-slate-900">
                         <Camera size={26} />
                      </button>
                   </div>
                   <div className="flex-1 text-center md:text-left space-y-5">
                      <h4 className="text-4xl font-bold font-outfit text-slate-900 dark:text-white leading-none tracking-tight">{activeUser.name}</h4>
                      <p className="text-[11px] text-brand font-black uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-2 leading-none"><CheckCircle2 size={14}/> Root Security Node</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-3">
                         <span className="px-5 py-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl text-[10px] font-black uppercase border border-emerald-500/20 shadow-sm flex items-center gap-2"><Key size={12}/> Biometrics Verified</span>
                         <span className="px-5 py-2.5 bg-blue-500/10 text-blue-600 rounded-2xl text-[10px] font-black uppercase border border-blue-500/20 shadow-sm flex items-center gap-2"><Globe size={12}/> Global Admin Access</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-6">Identity Alias</label>
                    <input type="text" value={editName} onChange={(e)=>setEditName(e.target.value)} className="w-full p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-sm font-bold outline-none focus:border-brand transition-all shadow-sm focus:ring-4 focus:ring-brand/5" />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-6">Credential Email Node</label>
                    <input type="email" value={editEmail} onChange={(e)=>setEditEmail(e.target.value)} className="w-full p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-sm font-bold outline-none focus:border-brand transition-all shadow-sm focus:ring-4 focus:ring-brand/5" />
                  </div>
                </div>
                
                <button onClick={handleSaveProfile} className="px-12 py-6 bg-brand text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-brand/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4">
                   <Save size={22}/> Re-Synchronize Core Node
                </button>
              </HubSection>

              <HubSection title="System Diagnostics" description="Test high-fidelity notification perimeters and signal tunes.">
                <div className="p-10 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm">
                  <div className="flex items-center gap-8 text-left">
                    <div className="p-6 bg-brand/10 text-brand rounded-[2rem] shadow-inner">
                      <Volume2 size={40} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-outfit">Lead Notification Signal</p>
                      <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-2 leading-relaxed">Authorized Signal Tone (v1.0.4)</p>
                    </div>
                  </div>
                  <button 
                    onClick={playNotificationSound}
                    className="w-full md:w-auto px-10 py-5 bg-white dark:bg-slate-800 text-brand dark:text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                    <Zap size={22} fill="currentColor"/> Trigger Signal Node
                  </button>
                </div>
              </HubSection>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-12 animate-in slide-in-from-right duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-brand/5 p-12 rounded-[4rem] border border-brand/20 shadow-sm">
                <div className="text-left flex items-center gap-8">
                   <div className="p-6 bg-brand text-white rounded-[2rem] shadow-2xl shadow-brand/40"><ShieldCheck size={48}/></div>
                   <div>
                      <h3 className="text-3xl font-bold font-outfit tracking-tighter uppercase leading-none">Access Node Control</h3>
                      <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-4">Authorized active nodes: {staff.length}</p>
                   </div>
                </div>
                <button onClick={() => setShowInviteModal(true)} className="w-full md:w-auto px-12 py-6 bg-brand text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-brand/30 hover:scale-[1.05] transition-all">Authorize Agent</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staff.map((s) => (
                  <StaffNodeCard key={s.id} staff={s} onDelete={() => deleteStaffNode(s.id)} />
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'system' && (
            <div className="space-y-12 animate-in slide-in-from-right duration-500">
              <HubSection title="Root System Control" description="Authorized maintenance signals and perimeter security configurations.">
                 <div className="grid grid-cols-1 gap-6">
                    <SystemToggle label="Maintenance Perimeter" desc="Deactivate all sales nodes for immediate system updates." active={false} />
                    <SystemToggle label="Gemini Cognitive Guard" desc="Enforce strict NDA-compliant AI reasoning for all agents." active={true} />
                    <SystemToggle label="Global Sales Alerts" desc="Broadcast notification signals to all active perimeters." active={true} />
                    <SystemToggle label="Mobile Node Sync" desc="Authorize high-fidelity real-time sync for mobile agents." active={true} />
                 </div>
                 <div className="mt-12 p-10 bg-red-500/5 border border-red-500/20 rounded-[3rem] flex items-center gap-10 text-left">
                    <ShieldAlert className="text-red-500 shrink-0" size={48} />
                    <div>
                       <h5 className="text-base font-black text-red-600 uppercase tracking-widest">Emergency Perimeter Purge</h5>
                       <p className="text-xs text-red-400 font-bold mt-2 leading-relaxed italic">Executing this command will disconnect all active staff nodes immediately and reset token keys. Use only in event of a credential breach.</p>
                       <button className="mt-8 px-10 py-4 bg-red-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/30 hover:bg-red-700 hover:scale-[1.02] transition-all">Authorize Purge</button>
                    </div>
                 </div>
              </HubSection>
            </div>
          )}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[4rem] p-12 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-12">
               <h2 className="text-3xl font-bold font-outfit tracking-tighter uppercase leading-none">Authorize New Node</h2>
               <button onClick={() => setShowInviteModal(false)} className="p-3 text-slate-400 hover:text-red-500 transition-all"><X size={40}/></button>
             </div>
             <div className="space-y-8 text-left">
                <div className="space-y-4">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-6">Staff Node Alias</label>
                   <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="w-full p-6 bg-slate-100 dark:bg-slate-950 border-none rounded-[2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-brand/10 transition-all shadow-inner" placeholder="e.g. Agent Daniel" />
                </div>
                <div className="space-y-4">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-6">Staff Auth Email</label>
                   <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full p-6 bg-slate-100 dark:bg-slate-950 border-none rounded-[2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-brand/10 transition-all shadow-inner" placeholder="daniel@locksnmore.com" />
                </div>
                <div className="space-y-6">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-6">Authorized Perimeter Role</label>
                   <div className="grid grid-cols-2 gap-6">
                      <button onClick={() => setInviteRole('agent')} className={`p-10 rounded-[2.5rem] border-2 font-black text-xs uppercase transition-all flex flex-col items-center gap-5 ${inviteRole === 'agent' ? 'border-brand bg-brand/5 text-brand shadow-2xl shadow-brand/10 scale-105' : 'border-slate-100 dark:border-slate-800 opacity-60'}`}>
                         <Activity size={24}/> Sales Agent
                      </button>
                      <button onClick={() => setInviteRole('admin')} className={`p-10 rounded-[2.5rem] border-2 font-black text-xs uppercase transition-all flex flex-col items-center gap-5 ${inviteRole === 'admin' ? 'border-brand bg-brand/5 text-brand shadow-2xl shadow-brand/10 scale-105' : 'border-slate-100 dark:border-slate-800 opacity-60'}`}>
                         <ShieldCheck size={24}/> Admin Node
                      </button>
                   </div>
                </div>
                <button onClick={handleInvite} className="w-full py-7 bg-brand text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-[2.5rem] flex items-center justify-center gap-5 shadow-2xl shadow-brand/40 hover:scale-[1.02] transition-all active:scale-95">
                  <MailPlus size={24} /> Deploy Activation Link
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HubSection = ({ title, description, children }: any) => (
  <div className="bg-white dark:bg-slate-900 p-12 rounded-[4.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left transition-all hover:shadow-xl">
    <div className="mb-12">
      <h3 className="text-3xl font-bold font-outfit uppercase tracking-tighter leading-none text-slate-900 dark:text-white">{title}</h3>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-4 leading-relaxed max-w-xl">{description}</p>
    </div>
    {children}
  </div>
);

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-6 px-8 py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${active ? 'bg-brand text-white border-brand shadow-2xl shadow-brand/30 translate-x-1.5' : 'text-slate-500 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-brand'}`}>
     {icon} {label}
  </button>
);

const StaffNodeCard = ({ staff, onDelete }: any) => (
  <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-brand transition-all text-left">
     <div className="flex items-start justify-between mb-10">
        <div className="relative">
           <img src={staff.avatar} className="w-28 h-28 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white dark:border-slate-800 transition-transform group-hover:scale-105" />
           <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-white dark:border-slate-950 shadow-lg ${staff.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
        </div>
        <button onClick={() => onDelete(staff.id)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all hover:scale-110 shadow-sm"><Trash2 size={26}/></button>
     </div>
     <h4 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white leading-tight tracking-tight">{staff.name}</h4>
     <p className="text-[11px] font-black text-brand uppercase tracking-[0.3em] mt-3.5 flex items-center gap-2"><ShieldCheck size={16}/> {staff.role.replace('_', ' ')} Perimeter</p>
     <div className="mt-10 pt-10 border-t border-slate-50 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500"><Mail size={18} className="opacity-40"/> {staff.email}</div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500"><Activity size={18} className="opacity-40"/> Signal Access: {staff.lastLogin}</div>
     </div>
  </div>
);

const SystemToggle = ({ label, desc, active }: any) => {
  const [isOn, setIsOn] = useState(active);
  return (
    <div className="flex items-center justify-between p-10 bg-slate-50 dark:bg-slate-950/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 group hover:border-brand transition-all shadow-inner">
       <div className="text-left space-y-2">
          <p className="text-xl font-bold font-outfit text-slate-900 dark:text-white leading-none">{label}</p>
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest opacity-60">{desc}</p>
       </div>
       <button 
         onClick={() => setIsOn(!isOn)}
         className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isOn ? 'bg-brand' : 'bg-slate-200 dark:bg-slate-800'}`}
       >
         <span className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out ${isOn ? 'translate-x-9' : 'translate-x-0'}`} />
       </button>
    </div>
  );
};

export default Settings;
