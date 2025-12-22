import React from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis
} from 'recharts';
import { TrendingUp, MessageSquare, ShoppingCart, Target } from 'lucide-react';
import { useTranslation } from '../App';

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 9000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 5390 },
  { name: 'Sun', sales: 7490 },
];

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-outfit">{t('overview')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring Real Estate & Lock sales agents.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-surface border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all">Last 7 Days</button>
          <button className="px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-brand/20 transition-all active:scale-95">Export Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<TrendingUp className="text-[#2563EB]" />} label={t('totalSales')} value="RM 12,450.00" trend="+12.5%" color="bg-[#2563EB]/10" />
        <StatCard icon={<MessageSquare className="text-[#0EA5E9]" />} label={t('activeChats')} value="156" trend="+8%" color="bg-[#0EA5E9]/10" />
        <StatCard icon={<ShoppingCart className="text-[#10B981]" />} label={t('conversion')} value="14.2%" trend="-2%" color="bg-[#10B981]/10" />
        <StatCard icon={<Target className="text-[#F59E0B]" />} label={t('aiAccuracy')} value="98.4%" trend="+0.5%" color="bg-[#F59E0B]/10" />
      </div>

      <div className="bg-surface dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white font-outfit">Sales Performance</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brand"></div>
              <span className="text-xs font-bold text-slate-500">Revenue</span>
            </div>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dx={-10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  border: 'none', 
                  borderRadius: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  padding: '12px 16px'
                }}
                itemStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                cursor={{ stroke: '#2563EB', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="sales" stroke="#2563EB" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} dot={{ r: 6, fill: '#2563EB', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{icon: React.ReactNode, label: string, value: string, trend: string, color: string}> = ({icon, label, value, trend, color}) => (
  <div className="bg-surface p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:translate-y-[-4px] hover:shadow-xl hover:border-brand/30 group duration-300">
    <div className="flex items-center gap-4 mb-6">
      <div className={`p-3.5 ${color} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-end justify-between">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">{value}</h2>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
        {trend}
      </span>
    </div>
  </div>
);

export default Dashboard;