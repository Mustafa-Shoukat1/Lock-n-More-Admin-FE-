import React, { useState } from 'react';
import { Settings as SettingsIcon, CreditCard, Shield, Lock, Trash2, RefreshCw, Layers, Camera, UserCircle, Users, Activity, ShieldCheck, MailPlus, MoreVertical, Mail, X, CheckCircle2, Zap, Smartphone, Key, Volume2 } from 'lucide-react';
import { useApp } from '../App';

const Settings: React.FC = () => {
  const { activeUser, setActiveUser, staff, setStaff, playNotificationSound } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'api' | 'security'>('profile');
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Team management state
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

  const handleAvatarUpload = () => {
    const dummyAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100";
    setActiveUser({...activeUser, avatar: dummyAvatar});
    alert("Super Admin Identity Node Updated.");
  };

  return (
    <div className="p-4 sm:p-10 space-y-12 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">
      {/* Super Admin Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 bg-slate-900 p-12 rounded-[4rem] text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 pointer-events-none">
          <ShieldCheck size={300} className="text-brand" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand/20 border border-brand/30 rounded-full">
            <ShieldCheck size={16} className="text-brand" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Super Admin Level: Verified</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-outfit tracking-tighter leading-none">Admin Control Hub</h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl">Mustafa Shoukat, this is your centralized perimeter for system integrity, staff access, and commerce logic.</p>
        </div>
        <div className="relative z-10 flex gap-4 w-full lg:w-auto">
           <button className="flex-1 lg:flex-none px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">System Flush</button>
           <button onClick={() => setShowInviteModal(true)} className="flex-1 lg:flex-none px-10 py-5 bg-brand text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand/40">New Staff Node</button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-12">
        {/* Hub Navigation */}
        <div className="w-full xl:w-80 space-y-3">
          <p className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Command Hierarchy</p>
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserCircle size={18} />} label="Identity Node" />
          <NavButton active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={<Users size={18} />} label="Staff Perimeter" />
          <NavButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={<Layers size={18} />} label="API Connectors" />
          <NavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Lock size={18} />} label="System Lockdown" />
        </div>

        {/* Workspace Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <HubSection title="Administrator Identity" description="Update your professional profile and biometric access nodes.">
                <div className="flex flex-col md:flex-row items-center gap-10 p-10 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem]">
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
                      <p className="text-[10px] text-brand font-black uppercase tracking-[0.4em]">Primary Security Holder</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                         <span className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-[9px] font-black uppercase border border-emerald-500/20">Active Node</span>
                         <span className="px-4 py-2 bg-blue-500/10 text-blue-600 rounded-xl text-[9px] font-black uppercase border border-blue-500/20">Shopify Verified</span>
                      </div>
                   </div>
                </div>
              </HubSection>

              <HubSection title="Diagnostics & Audio" description="Test the platform signal tune and system alerts.">
                <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand/10 text-brand rounded-xl">
                      <Volume2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Signal Notification Sound</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Status: High-Fidelity Active</p>
                    </div>
                  </div>
                  <button 
                    onClick={playNotificationSound}
                    className="px-6 py-3 bg-brand text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Test Signal Tune
                  </button>
                </div>
              </HubSection>

              <HubSection title="Personal Perimeter" description="Manual overrides for your personal admin experience.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputNode label="Full Legal Name" value={activeUser.name} />
                  <InputNode label="Admin Contact" value="admin@locksnmore.com" />
                  <InputNode label="System Locale" value="Kuala Lumpur, MY" />
                  <InputNode label="Node ID" value="NODE-ADMIN-ALPHA-01" readOnly />
                </div>
              </HubSection>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-bold font-outfit tracking-tighter uppercase">Staff Perimeter</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Total Active Nodes: {staff.length}</p>
                </div>
                <button onClick={() => setShowInviteModal(true)} className="px-6 py-3 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand/20">Authorize New Member</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staff.map((s) => (
                  <StaffCard key={s.id} staff={s} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <HubSection title="Platform Integration Nodes" description="Manage synchronization pipelines with external sales channels.">
                 <div className="space-y-4">
                    <ConnectorItem name="Shopify Inventory Cloud" detail="locksnmore.myshopify.com" status="CONNECTED" icon={<Smartphone className="text-emerald-500"/>} />
                    <ConnectorItem name="Meta Cloud API (WhatsApp)" detail="Phone ID: 104550111..." status="ACTIVE" icon={<Zap className="text-brand"/>} />
                    <ConnectorItem name="TikTok Signal Hook" detail="TT-SALES-ALPHA-NODE" status="PENDING" icon={<Activity className="text-amber-500"/>} />
                 </div>
              </HubSection>

              <HubSection title="Gemini AI Configuration" description="Current logic model for sales intelligence.">
                <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] border border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="p-4 bg-brand/20 text-brand rounded-2xl"><Zap size={24}/></div>
                      <div>
                         <p className="text-sm font-bold">Model: Gemini 3 Flash Preview</p>
                         <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Uptime: 99.9% // Real-time Reasoning Active</p>
                      </div>
                   </div>
                   <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10">Configure Logic</button>
                </div>
              </HubSection>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <HubSection title="Security Operations" description="Real-time monitoring of admin session perimeter.">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SecurityStat label="Threat Level" value="Minimal" color="text-emerald-500" />
                    <SecurityStat label="Active Sessions" value="2" color="text-brand" />
                    <SecurityStat label="API Keys" value="Healthy" color="text-purple-500" />
                 </div>
                 
                 <div className="mt-10 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-4">Active Auth Nodes</p>
                    <AuthNode device="MacBook Pro 16" ip="121.23.4.1" lastSeen="Now" />
                    <AuthNode device="Mustafa's iPhone 15" ip="121.23.4.1" lastSeen="1h ago" />
                 </div>
              </HubSection>
              
              <div className="p-10 bg-red-500/5 border border-red-500/20 rounded-[3rem] flex items-center justify-between">
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl"><Shield size={24}/></div>
                    <div>
                       <p className="text-sm font-bold text-red-600">Panic Switch</p>
                       <p className="text-[10px] text-red-500 uppercase font-black tracking-widest mt-1">Immediately freeze all platform integrations.</p>
                    </div>
                 </div>
                 <button className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-500/30">LOCK SYSTEM</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staff Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[4rem] p-12 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-10">
               <h2 className="text-3xl font-bold font-outfit tracking-tighter uppercase">Invite Staff Node</h2>
               <button onClick={() => setShowInviteModal(false)} className="p-2 text-slate-400 hover:rotate-90 transition-transform"><X size={32}/></button>
             </div>
             <div className="space-y-8">
                <InputNode label="Agent Name" value={inviteName} onChange={(v: any) => setInviteName(v)} placeholder="e.g. Agent Daniel" />
                <InputNode label="Agent System Email" value={inviteEmail} onChange={(v: any) => setInviteEmail(v)} placeholder="daniel@locksnmore.com" />
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Security Level</label>
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setInviteRole('agent')} className={`p-5 rounded-2xl border font-bold text-sm transition-all ${inviteRole === 'agent' ? 'border-brand bg-brand/5 text-brand' : 'border-slate-100 dark:border-slate-800'}`}>Sales Agent</button>
                      <button onClick={() => setInviteRole('admin')} className={`p-5 rounded-2xl border font-bold text-sm transition-all ${inviteRole === 'admin' ? 'border-brand bg-brand/5 text-brand' : 'border-slate-100 dark:border-slate-800'}`}>Admin Manager</button>
                   </div>
                </div>
                <button onClick={handleInvite} className="w-full py-6 bg-brand text-white font-black text-xs uppercase tracking-[0.3em] rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-brand/30 hover:scale-[1.02] transition-all">
                  <MailPlus size={20} /> Deploy Access Node
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HubSection = ({ title, description, children }: any) => (
  <div className="bg-surface dark:bg-slate-900 p-8 sm:p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="mb-10">
      <h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter leading-none">{title}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 leading-relaxed">{description}</p>
    </div>
    {children}
  </div>
);

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${active ? 'bg-brand text-white shadow-2xl shadow-brand/30 translate-x-1' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
     {icon} {label}
  </button>
);

const StaffCard = ({ staff }: any) => (
  <div className="bg-surface dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-brand transition-all">
     <div className="flex items-start justify-between mb-6">
        <div className="relative">
           <img src={staff.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-xl border-2 border-white dark:border-slate-800" />
           <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${staff.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
        </div>
        <button className="p-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={20}/></button>
     </div>
     <h4 className="text-xl font-bold font-outfit leading-tight">{staff.name}</h4>
     <p className="text-[9px] font-black text-brand uppercase tracking-widest mt-1.5 flex items-center gap-2"><Key size={10}/> {staff.role.replace('_', ' ')}</p>
     <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold"><Mail size={12}/> {staff.email}</div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold"><Activity size={12}/> Login: {staff.lastLogin}</div>
     </div>
  </div>
);

const ConnectorItem = ({ name, detail, status, icon }: any) => (
  <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-brand transition-all group">
     <div className="flex items-center gap-5">
       <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
       <div>
         <p className="text-sm font-bold">{name}</p>
         <p className="text-[10px] text-slate-500 font-medium">{detail}</p>
       </div>
     </div>
     <span className={`text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] ${status === 'CONNECTED' || status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>{status}</span>
  </div>
);

const InputNode = ({ label, value, readOnly, placeholder, onChange }: any) => (
  <div className="space-y-2">
    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">{label}</label>
    <input 
      type="text" 
      defaultValue={value} 
      readOnly={readOnly} 
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-brand transition-all" 
    />
  </div>
);

const SecurityStat = ({ label, value, color }: any) => (
  <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
     <p className={`text-2xl font-bold font-outfit ${color}`}>{value}</p>
  </div>
);

const AuthNode = ({ device, ip, lastSeen }: any) => (
  <div className="flex items-center justify-between p-4 px-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
     <div className="flex items-center gap-4">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><Smartphone size={16}/></div>
        <div>
           <p className="text-xs font-bold">{device}</p>
           <p className="text-[9px] text-slate-400 font-mono uppercase">{ip}</p>
        </div>
     </div>
     <span className="text-[9px] font-black text-slate-400 uppercase">{lastSeen}</span>
  </div>
);

export default Settings;
