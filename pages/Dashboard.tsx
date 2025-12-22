import React, { useState } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis
} from 'recharts';
import { TrendingUp, MessageSquare, ShoppingCart, Target, Search, ExternalLink, Activity, DollarSign, Zap, Clock, ChevronRight, BarChart3, Package, Calendar } from 'lucide-react';
import { useApp } from '../App';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';

const data = [
  { name: 'Mon', sales: 4200 },
  { name: 'Tue', sales: 3100 },
  { name: 'Wed', sales: 9800 },
  { name: 'Thu', sales: 4780 },
  { name: 'Fri', sales: 2890 },
  { name: 'Sat', sales: 6390 },
  { name: 'Sun', sales: 8490 },
];

const Dashboard: React.FC = () => {
  const { t } = useApp();
  const [reportDays, setReportDays] = useState('7');
  const [isGenerating, setIsGenerating] = useState(false);

  const activities = [
    { id: 1, name: 'Beh Chen', action: 'Inquiry', platform: 'whatsapp', detail: 'A100 Smart Pro', status: 'hot', time: 'Just now' },
    { id: 2, name: 'Sarah Lim', action: 'Checkout', platform: 'instagram', detail: 'X1 Deadbolt', status: 'warm', time: '12m ago' },
    { id: 3, name: 'Ahmad Faiz', action: 'Support', platform: 'tiktok', detail: 'Install guide', status: 'priority', time: '45m ago' },
    { id: 4, name: 'Siti Nor', action: 'Order', platform: 'whatsapp', detail: 'RM 1,299.00', status: 'completed', time: '2h ago' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1500);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      {/* Welcome & Report Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-surface dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-outfit tracking-tight">Ecosystem Feed</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Real-time sales intelligence and AI status
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none lg:min-w-[140px]">
             <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <select 
               value={reportDays}
               onChange={(e) => setReportDays(e.target.value)}
               className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand appearance-none"
             >
               <option value="7">7 Days</option>
               <option value="10">10 Days</option>
               <option value="15">15 Days</option>
               <option value="20">20 Days</option>
             </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex-1 lg:flex-none px-8 py-3 bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 shadow-xl shadow-brand/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isGenerating ? <Zap size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            {isGenerating ? 'Deploying...' : 'Deploy Report'}
          </button>
        </div>
      </div>

      {/* KPI GRID with Real Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashMetric label="Daily Revenue" value="RM 8,490" trend="+14%" icon={<DollarSign />} color="blue" />
        <DashMetric label="Lead Load" value="124 Active" trend="+12" icon={<Activity />} color="emerald" />
        <DashMetric label="Conversion" value="18.2%" trend="-0.5%" icon={<Target />} color="amber" />
        <DashMetric label="AI Runtime" value="99.9%" trend="Stable" icon={<Zap />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Performance Plot */}
        <div className="lg:col-span-2 bg-surface dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white font-outfit">Revenue Velocity</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Settled transactions (Last {reportDays} days)</p>
            </div>
            <div className="p-3 bg-brand/5 rounded-2xl text-brand group-hover:scale-110 transition-transform border border-brand/10">
               <BarChart3 size={20} />
            </div>
          </div>
          <div className="h-80 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} dx={-5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', color: '#fff' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '800' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563EB" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} dot={{ r: 5, fill: '#2563EB', strokeWidth: 3, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-surface dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-outfit">Live Funnel</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Recent touchpoints</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 border border-slate-100 dark:border-slate-700">
               <Activity size={18} />
            </div>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-thin">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-3xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center font-black text-brand text-lg font-outfit border border-slate-100 dark:border-slate-800">
                      {activity.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{activity.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <PlatformIcon platform={activity.platform} />
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{activity.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[11px] font-bold text-slate-400 italic">"{activity.detail}"</p>
                  <StatusPill status={activity.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'whatsapp': return <WhatsAppIcon size={14} />;
    case 'instagram': return <InstagramIcon size={14} />;
    case 'tiktok': return <TikTokIcon size={14} className="text-slate-900 dark:text-white" />;
    default: return null;
  }
};

const StatusPill = ({ status }: { status: string }) => {
  const styles = {
    hot: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
    warm: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    priority: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  };
  return (
    <span className={`text-[9px] font-black px-3 py-1 rounded-xl uppercase tracking-widest ${styles[status as keyof typeof styles]}`}>
      {status}
    </span>
  );
}

const DashMetric = ({ label, value, trend, icon, color }: any) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  };
  return (
    <div className="bg-surface dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:scale-[1.05] hover:shadow-2xl duration-500 group">
      <div className="flex items-center justify-between mb-8">
        <div className={`p-4 rounded-[1.5rem] transition-transform group-hover:rotate-12 ${(colors as any)[color]}`}>
          {React.cloneElement(icon, { size: 22 })}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-xl ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
          {trend}
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-outfit tracking-tighter leading-none">{value}</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">{label}</p>
      </div>
    </div>
  );
};

export default Dashboard;