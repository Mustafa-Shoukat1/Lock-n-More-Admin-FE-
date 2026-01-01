import React, { useState, useMemo } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis
} from 'recharts';
import { DollarSign, Activity, Target, Zap, MessageSquare, Smartphone, BarChart3, Calendar, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { conversations, orders, simulateLead } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const totalRevenue = useMemo(() => orders.reduce((acc, curr) => acc + curr.amount, 0), [orders]);
  
  const salesData = useMemo(() => [
    { name: 'Mon', sales: 4200 },
    { name: 'Tue', sales: 3100 },
    { name: 'Wed', sales: 9800 },
    { name: 'Thu', sales: 4780 },
    { name: 'Fri', sales: 2890 },
    { name: 'Sat', sales: 6390 },
    { name: 'Sun', sales: totalRevenue > 20000 ? totalRevenue : 8490 },
  ], [totalRevenue]);

  const handleGenerate = () => {
    setIsGenerating(true);
    simulateLead();
    setTimeout(() => setIsGenerating(false), 800);
  };

  const pendingLeads = useMemo(() => conversations.filter(c => c.unreadCount > 0), [conversations]);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-24 md:pb-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-surface dark:bg-slate-900 p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white font-outfit tracking-tighter">Ecosystem Pulse</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm flex items-center gap-2">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time sales signals from {conversations.length} perimeter nodes
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none lg:min-w-[140px]">
             <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <select 
               className="w-full pl-9 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-brand/10 appearance-none cursor-pointer"
             >
               <option value="7">Last 7 Days</option>
               <option value="30">30D Velocity</option>
             </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex-1 lg:flex-none px-6 sm:px-8 py-3 bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 shadow-xl shadow-brand/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isGenerating ? <Zap size={14} className="animate-spin" /> : <BarChart3 size={14} />}
            {isGenerating ? 'Simulating...' : 'Simulate Signal'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashMetric label="Revenue Flow" value={`RM ${(totalRevenue / 1000).toFixed(1)}k`} trend="+22%" icon={<DollarSign />} color="blue" />
        <DashMetric label="Active Signals" value={conversations.length.toString()} trend={`+${pendingLeads.length} unread`} icon={<Activity />} color="emerald" />
        <DashMetric label="Closure Rate" value="21.2%" trend="+3.4%" icon={<Target />} color="amber" />
        <DashMetric label="TOTO Uptime" value="99.98%" trend="Optimal" icon={<Zap />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white font-outfit tracking-tight">Revenue Velocity</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Settled transactions across nodes</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-brand/5 text-brand text-[9px] font-black uppercase rounded-lg border border-brand/10"><Smartphone size={10}/> Official WhatsApp API</span>
            </div>
          </div>
          <div className="h-60 sm:h-80 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} dx={-5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.4)', color: '#fff' }}
                  itemStyle={{ fontSize: '10px', fontWeight: '800' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563EB" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} dot={{ r: 5, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl sm:rounded-[3rem] text-white border border-slate-800 shadow-xl relative overflow-hidden group">
            <h3 className="text-lg sm:text-xl font-bold font-outfit mb-6 flex items-center gap-2"><Zap size={20} className="text-brand" /> Hub Management</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
               <button onClick={() => navigate('/inbox')} className="p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-left">
                  <MessageSquare size={18} className="text-brand mb-2 sm:mb-3" />
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Open Inbox</p>
                  <p className="text-xs sm:text-sm font-bold mt-1">Manage Feeds</p>
               </button>
               <button onClick={() => navigate('/ai-manager')} className="p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-left">
                  <Target size={18} className="text-amber-500 mb-2 sm:mb-3" />
                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">TOTO Logic</p>
                  <p className="text-xs sm:text-sm font-bold mt-1">Calibrate AI</p>
               </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-8 rounded-3xl sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[350px] sm:h-[400px]">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">Priority Signal</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Unread Leads ({pendingLeads.length})</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-500/10 rounded-2xl text-red-500">
                <AlertCircle size={18} />
              </div>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-none">
              {pendingLeads.length > 0 ? pendingLeads.map((lead) => (
                <div key={lead.id} onClick={() => navigate('/inbox')} className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center font-black text-brand text-xs font-outfit border border-slate-100 dark:border-slate-800 shrink-0">
                        {lead.customerName.charAt(0)}
                      </div>
                      <p className="text-xs sm:text-sm font-bold truncate max-w-[100px] sm:max-w-[120px] text-slate-900 dark:text-white">{lead.customerName}</p>
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-black text-red-500 uppercase tracking-widest shrink-0">{lead.lastTimestamp}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate italic">"{lead.lastMessage}"</p>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4">
                  <CheckCheck size={40} />
                  <p className="text-xs font-black uppercase tracking-widest">All signals clear</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCheck = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M7 13L10 16L17 9M1 13L4 16L11 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DashMetric = ({ label, value, trend, icon, color }: any) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  };
  return (
    <div className="bg-surface dark:bg-slate-900 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:scale-[1.02] duration-500 group overflow-hidden">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-[1.25rem] transition-transform group-hover:scale-110 shadow-sm ${(colors as any)[color]}`}>
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <div className={`flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : (trend === 'Optimal' ? 'bg-brand/10 text-brand' : 'bg-slate-100 dark:bg-slate-800 text-slate-500')}`}>
          {trend.startsWith('+') && <ArrowUpRight size={12}/>}
          {trend}
        </div>
      </div>
      <div>
        <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white font-outfit tracking-tighter leading-none">{value}</h2>
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 sm:mt-4">{label}</p>
      </div>
    </div>
  );
};

export default Dashboard;