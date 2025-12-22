
import React from 'react';
import { Settings as SettingsIcon, Bell, CreditCard, Link2, Smartphone, Database } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Configure global parameters and third-party integrations.</p>
      </div>

      <div className="space-y-6">
        <SettingSection 
          icon={<Link2 className="text-blue-600" />} 
          title="Integrations" 
          description="Manage connections to external services."
        >
          <div className="space-y-4 mt-4">
            <IntegrationItem name="WhatsApp Cloud API" status="Connected" color="bg-emerald-500" />
            <IntegrationItem name="Shopify Admin API" status="Connected" color="bg-emerald-500" />
            <IntegrationItem name="Stripe Payments" status="Pending Setup" color="bg-amber-500" />
            <IntegrationItem name="Instagram Graph API" status="Connected" color="bg-emerald-500" />
          </div>
        </SettingSection>

        <SettingSection 
          icon={<Bell className="text-purple-600" />} 
          title="Notification Preferences" 
          description="Customize how and when staff are notified."
        >
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm font-semibold text-slate-700">Push Notifications for New Leads</span>
              <div className="relative inline-block w-10 h-6">
                <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                <span className="absolute cursor-pointer inset-0 bg-slate-200 rounded-full transition peer-checked:bg-blue-600"></span>
                <span className="absolute cursor-pointer left-1 bottom-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-4"></span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm font-semibold text-slate-700">Email Daily Analytics Summary</span>
              <div className="relative inline-block w-10 h-6">
                <input type="checkbox" className="opacity-0 w-0 h-0 peer" />
                <span className="absolute cursor-pointer inset-0 bg-slate-200 rounded-full transition peer-checked:bg-blue-600"></span>
                <span className="absolute cursor-pointer left-1 bottom-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-4"></span>
              </div>
            </div>
          </div>
        </SettingSection>

        <SettingSection 
          icon={<Database className="text-amber-600" />} 
          title="Data Management" 
          description="Control your data storage and retention."
        >
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button className="p-4 bg-white border border-slate-200 rounded-xl text-left hover:bg-slate-50 transition-all">
              <p className="text-sm font-bold text-slate-800 mb-1">Backup Chat History</p>
              <p className="text-xs text-slate-500">Download all data as JSON</p>
            </button>
            <button className="p-4 bg-white border border-slate-200 rounded-xl text-left hover:bg-slate-50 transition-all">
              <p className="text-sm font-bold text-slate-800 mb-1">Clear Cache</p>
              <p className="text-xs text-slate-500">Refreshes product embeddings</p>
            </button>
          </div>
        </SettingSection>
      </div>
    </div>
  );
};

const SettingSection: React.FC<{icon: React.ReactNode, title: string, description: string, children: React.ReactNode}> = ({icon, title, description, children}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-slate-100 rounded-xl">{icon}</div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    </div>
    <p className="text-sm text-slate-500 ml-12">{description}</p>
    <div className="ml-12 mt-4">{children}</div>
  </div>
);

const IntegrationItem: React.FC<{name: string, status: string, color: string}> = ({name, status, color}) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
    <span className="text-sm font-bold text-slate-700">{name}</span>
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-xs font-bold text-slate-500 uppercase">{status}</span>
    </div>
  </div>
);

export default Settings;
