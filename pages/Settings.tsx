import React, { useState } from 'react';
import { Settings as SettingsIcon, CreditCard, Shield, Lock, Trash2, RefreshCw, Layers, Camera, UserCircle } from 'lucide-react';
import { useApp } from '../App';

const Settings: React.FC = () => {
  const { activeUser, setActiveUser } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'security'>('profile');

  const handleAvatarUpload = () => {
    // Simulated upload logic
    const dummyAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100";
    setActiveUser({...activeUser, avatar: dummyAvatar});
    alert("Profile image uploaded and analyzed. Identity verified.");
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-outfit">Settings</h1>
        <p className="text-slate-500 font-medium">Manage ecosystem integrations and account security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserCircle size={18} />} label="Profile" />
          <NavButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={<Layers size={18} />} label="API Connect" />
          <NavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield size={18} />} label="Security" />
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <ConfigSection title="Account Identity" description="Update your professional presence in the flow.">
                <div className="flex items-center gap-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem]">
                   <div className="relative group">
                      <div className="w-24 h-24 rounded-[2rem] bg-brand/10 border-2 border-brand/20 flex items-center justify-center overflow-hidden shadow-xl">
                        {activeUser.avatar ? <img src={activeUser.avatar} className="w-full h-full object-cover" /> : <UserCircle size={40} className="text-brand opacity-30"/>}
                      </div>
                      <button onClick={handleAvatarUpload} className="absolute -bottom-2 -right-2 p-2.5 bg-brand text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
                         <Camera size={16} />
                      </button>
                   </div>
                   <div className="flex-1">
                      <p className="text-sm font-bold">{activeUser.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Super Admin Role</p>
                      <button className="mt-4 text-[10px] font-black text-brand uppercase hover:underline">Revoke Access</button>
                   </div>
                </div>
              </ConfigSection>

              <ConfigSection title="Business Profile" description="Organization details for automated AI context.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputBox label="Organization" value="Locks & More MY" />
                  <InputBox label="Support Email" value="support@locksnmore.com" />
                </div>
              </ConfigSection>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <ConfigSection title="Platform Sync" description="Manage Shopify and social webhooks.">
                 <IntegrationItem name="Shopify Engine" detail="locksnmore.myshopify.com" status="ACTIVE" />
                 <IntegrationItem name="Meta Cloud API" detail="WhatsApp Business ID: 10455..." status="ACTIVE" />
              </ConfigSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>{icon} {label}</button>
);

const ConfigSection = ({ title, description, children }: any) => (
  <div className="bg-surface dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
    <div className="mb-6">
      <h3 className="text-lg font-bold font-outfit uppercase tracking-tighter">{title}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{description}</p>
    </div>
    {children}
  </div>
);

const IntegrationItem = ({ name, detail, status }: any) => (
  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
     <div>
       <p className="text-xs font-bold">{name}</p>
       <p className="text-[10px] text-slate-500">{detail}</p>
     </div>
     <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-lg uppercase tracking-widest">{status}</span>
  </div>
);

const InputBox = ({ label, value }: any) => (
  <div>
    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
    <input type="text" readOnly className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold" defaultValue={value} />
  </div>
);

export default Settings;