import React, { useState } from 'react';
import { UserCircle, Users, Layers, Lock, ShieldCheck, Camera, Volume2, Save, Trash2, Smartphone, Zap, Activity, Mail, Key, X, MailPlus, CheckCircle2 } from 'lucide-react';
import { useApp } from '../App';

const Settings: React.FC = () => {
  const { activeUser, setActiveUser, staff, setStaff, playNotificationSound } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'api' | 'security'>('profile');
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Profile edit state
  const [editName, setEditName] = useState(activeUser.name);
  const [editEmail, setEditEmail] = useState(activeUser.email || '');

  // Team management state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');

  const handleSaveProfile = () => {
    setActiveUser({ ...activeUser, name: editName, email: editEmail });
    alert("Super Admin Identity node synchronized.");
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
      alert("Super Admin node cannot be deleted.");
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
      {/* Admin Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 bg-slate-900 p-12 rounded-[4rem] text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 pointer-events-none">
          <ShieldCheck size={300} className="text-brand" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand/20 border border-brand/30 rounded-full">
            <ShieldCheck size={16} className="text-brand" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Auth Level: Super Admin</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-outfit tracking-tighter leading-none">Command Center</h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl">Mustafa Shoukat, this is your centralized perimeter for system integrity and staff access node management.</p>
        </div>
        <div className="relative z-10 flex gap-4 w-full lg:w-auto">
           <button onClick={() => setShowInviteModal(true)} className="flex-1 lg:flex-none px-10 py-5 bg-brand text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand/40">New Staff Node</button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-12">
        <div className="w-full xl:w-80 space-y-3">
          <p className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Command Hierarchy</p>
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserCircle size={18} />} label="Identity Node" />
          <NavButton active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={<Users size={18} />} label="Staff Perimeter" />
          <NavButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={<Layers size={18} />} label="API Connectors" />
          <NavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Lock size={18} />} label="System Lockdown" />
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <HubSection title="Administrator Identity" description="Update your professional profile and biometric authorization nodes.">
                <div className="flex flex-col md:flex-row items-center gap-10 p-10 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] mb-10">
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
                         <span className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-[9px] font-black uppercase border border-emerald-500/20">Alpha Node Verified</span>
                         <span className="px-4 py-2 bg-blue-500/10 text-blue-600 rounded-xl text-[9px] font-black uppercase border border-blue-500/20">Shopify Root Access</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Admin Legal Name</label>
                    <input type="text" value={editName} onChange={(e)=>setEditName(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Contact Logic (Email)</label>
                    <input type="email" value={editEmail} onChange={(e)=>setEditEmail(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-brand" />
                  </div>
                </div>
                
                <button onClick={handleSaveProfile} className="px-10 py-5 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                   <Save size={18}/> Synchronize Identity
                </button>
              </HubSection>

              <HubSection title="Diagnostic Perimeter" description="Calibrate system signal tunes and alert telemetry.">
                <div className="p-10 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-brand/10 text-brand rounded-[1.5rem] shadow-sm">
                      <Volume2 size={32} />
                    </div>
                    <div>
                      <p className="text-xl font-bold font-outfit">Signal Notification Sound</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5">Node: High-Fidelity Signal Tune</p>
                    </div>
                  </div>
                  <button 
                    onClick={playNotificationSound}
                    className="w-full md:w-auto px-10 py-5 bg-white dark:bg-slate-800 text-brand dark:text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Volume2 size={18}/> Test Signal Tune
                  </button>
                </div>
              </HubSection>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-bold font-outfit tracking-tighter uppercase">Staff Perimeter</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Authorized Access Nodes: {staff.length}</p>
                </div>
                <button onClick={() => setShowInviteModal(true)} className="px-6 py-3 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand/20">Deploy New Node</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staff.map((s) => (
                  <StaffCard key={s.id} staff={s} onDelete={() => deleteStaffNode(s.id)} />
                ))}
              </div>
            </div>
          )}
          
          {/* API and Security placeholders consistent with previous design but focused on functioning UI */}
          {activeTab === 'api' && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <HubSection title="Platform Integration Nodes" description="Manage synchronization pipelines with external sales channels.">
                 <div className="space-y-4">
                    <ConnectorItem name="Shopify Inventory Cloud" detail="locksnmore.myshopify.com" status="CONNECTED" icon={<Smartphone className="text-emerald-500"/>} />
                    <ConnectorItem name="Meta Cloud API (WhatsApp)" detail="Phone ID: 104550111..." status="ACTIVE" icon={<Zap className="text-brand"/>} />
                 </div>
              </HubSection>
            </div>
          )}
        </div>
      </div>

      {/* Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[4rem] p-12 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-10">
               <h2 className="text-3xl font-bold font-outfit tracking-tighter uppercase">Authorize Staff Node</h2>
               <button onClick={() => setShowInviteModal(false)} className="p-2 text-slate-400"><X size={32}/></button>
             </div>
             <div className="space-y-8">
                <InputNode label="Node Identity (Name)" value={inviteName} onChange={(v: any) => setInviteName(v)} placeholder="e.g. Agent Daniel" />
                <InputNode label="Auth Email" value={inviteEmail} onChange={(v: any) => setInviteEmail(v)} placeholder="daniel@locksnmore.com" />
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Logic Role</label>
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setInviteRole('agent')} className={`p-5 rounded-2xl border font-bold text-sm transition-all ${inviteRole === 'agent' ? 'border-brand bg-brand/5 text-brand' : 'border-slate-100 dark:border-slate-800'}`}>Sales Agent</button>
                      <button onClick={() => setInviteRole('admin')} className={`p-5 rounded-2xl border font-bold text-sm transition-all ${inviteRole === 'admin' ? 'border-brand bg-brand/5 text-brand' : 'border-slate-100 dark:border-slate-800'}`}>Admin Hub</button>
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
  <div className="bg-surface dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="mb-10">
      <h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter leading-none text-slate-900 dark:text-white">{title}</h3>
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

const StaffCard = ({ staff, onDelete }: any) => (
  <div className="bg-surface dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-brand transition-all">
     <div className="flex items-start justify-between mb-6">
        <div className="relative">
           <img src={staff.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-xl border-2 border-white dark:border-slate-800" />
           <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${staff.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
        </div>
        <button onClick={onDelete} className="p-2 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
     </div>
     <h4 className="text-xl font-bold font-outfit leading-tight text-slate-900 dark:text-white">{staff.name}</h4>
     <p className="text-[9px] font-black text-brand uppercase tracking-widest mt-1.5 flex items-center gap-2"><Key size={10}/> {staff.role.replace('_', ' ')}</p>
     <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold"><Mail size={12}/> {staff.email}</div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold"><Activity size={12}/> Last Login: {staff.lastLogin}</div>
     </div>
  </div>
);

const ConnectorItem = ({ name, detail, status, icon }: any) => (
  <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-brand transition-all group">
     <div className="flex items-center gap-5">
       <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
       <div>
         <p className="text-sm font-bold text-slate-900 dark:text-white">{name}</p>
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
      className="w-full p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-brand transition-all dark:text-white" 
    />
  </div>
);

export default Settings;