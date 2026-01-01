
import React, { useState, useMemo } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis
} from 'recharts';
import { DollarSign, Activity, Target, Zap, MessageSquare, Smartphone, BarChart3, Calendar, ArrowUpRight, AlertCircle, History, ShieldCheck, RefreshCw, Cpu, BrainCircuit, ShieldAlert, CheckCircle } from 'lucide-react';
import { useApp, SafeText } from '../App';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { conversations, orders, simulateLead, products, systemLogs } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Dynamic Calculations
  const totalRevenue = useMemo(() => orders.reduce((acc, curr) => acc + curr.amount, 0), [orders]);
  const activeSignals = conversations.length;
  const pendingLeadsCount = conversations.filter(c => c.unreadCount > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const salesData = useMemo(() => [
    { name: 'Mon', sales: 4200 },
    { name: 'Tue', sales: 3100 },
    { name: 'Wed', sales: 5800 },
    { name: 'Thu', sales: 4780 },
    { name: 'Fri', sales: 7890 },
    { name: 'Sat', sales: 9390 },
    { name: 'Today', sales: totalRevenue },
  ], [totalRevenue]);

  const handleGenerate = () => {
    setIsGenerating(true);
    simulateLead();
    setTimeout(() => setIsGenerating(false), 600);
  };

  const milestones = [
    { name: 'Admin Hub UI', days: 'Day 5', status: 'done', cost: '$300' },
    { name: 'WhatsApp API', days: 'Day 10', status: 'done', cost: '$400' },
    { name: 'Gemini AI Brain', days: 'Day 15', status: 'active', cost: '$350' },
    { name: 'Shopify Sync', days: 'Day 20', status: 'pending', cost: '$300' },
    { name: 'Social Omnichannel', days: 'Day 30', status: 'pending', cost: '$400' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-24 md:pb-8 text-left">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-surface dark:bg-slate-900 p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white font-outfit tracking-tighter">Command Center</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            System Integrity: Optimal • {activeSignals} Perimeter Nodes Active
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Implementation Cost</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">$2,500 Full System</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Roadmap Status</p>
              <p className="text-sm font-bold text-brand mt-1">Day 12 / 35</p>
            </div>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 lg:flex-none px-8 py-3.5 bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 shadow-xl shadow-brand/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
            {isGenerating ? 'Injecting...' : 'Simulate Signal'}
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashMetric label="Net Settlement" value={`RM ${totalRevenue.toLocaleString()}`} trend="+12.5%" icon={<DollarSign />} color="blue" />
        <DashMetric label="Active Signals" value={activeSignals.toString()} trend={`${pendingLeadsCount} unread`} icon={<Activity />} color="emerald" />
        <DashMetric label="Stock Critical" value={outOfStockCount.toString()} trend="Action Needed" icon={<AlertCircle />} color="amber" />
        <DashMetric label="AI Uptime" value="100%" trend="Secure" icon={<ShieldCheck />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white font-outfit tracking-tight">Revenue Velocity</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Authorized transaction flow</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <BarChart3 size={20} className="text-brand" />
            </div>
          </div>
          <div className="h-64 sm:h-80 -ml-4">
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
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ fontSize: '10px', fontWeight: '800' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563EB" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} dot={{ r: 5, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar - Implementation Roadmap Tracker */}
        <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-8 rounded-3xl sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-auto">
          <div className="flex items-center justify-between mb-8 text-left">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-brand" />
              <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">Roadmap Progress</h3>
            </div>
            <span className="px-3 py-1 bg-brand/10 text-brand rounded-full text-[9px] font-black uppercase tracking-widest">35 Days</span>
          </div>
          
          <div className="flex-1 space-y-4 pr-2 scrollbar-none text-left">
            {milestones.map((m, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                m.status === 'done' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-800/50' : 
                m.status === 'active' ? 'bg-brand/5 border-brand/20 shadow-lg' : 'bg-slate-50 dark:bg-slate-800/30 border-transparent'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${m.status === 'done' ? 'bg-emerald-500 text-white' : m.status === 'active' ? 'bg-brand text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    {m.status === 'done' ? <CheckCircle size={14}/> : m.status === 'active' ? <Zap size={14}/> : <Calendar size={14}/>}
                  </div>
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-tight ${m.status === 'done' ? 'text-emerald-700 dark:text-emerald-400' : m.status === 'active' ? 'text-brand' : 'text-slate-500'}`}>{m.name}</p>
                    <p className="text-[9px] font-bold text-slate-400">{m.days} • {m.cost}</p>
                  </div>
                </div>
                {m.status === 'active' && <span className="text-[8px] font-black text-brand uppercase animate-bounce">Live</span>}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-slate-900 dark:bg-black rounded-2xl border border-slate-800">
             <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase">System Completion</p>
                <p className="text-[10px] font-black text-brand">42%</p>
             </div>
             <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand w-[42%] shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashMetric = ({ label, value, trend, icon, color }: any) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  };
  return (
    <div className="bg-surface dark:bg-slate-900 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:scale-[1.02] duration-300 group overflow-hidden text-left">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl transition-transform group-hover:rotate-6 ${(colors as any)[color]}`}>
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <div className={`flex items-center gap-1.5 text-[9px] font-black px-3 py-1.5 rounded-xl ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : (['Secure', 'Optimal'].includes(trend) ? 'bg-brand/10 text-brand' : 'bg-red-500/10 text-red-500')}`}>
          {trend.startsWith('+') && <ArrowUpRight size={12}/>}
          {trend}
        </div>
      </div>
      <div>
        <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white font-outfit tracking-tighter leading-none">{value}</h2>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">{label}</p>
      </div>
    </div>
  );
};

export default Dashboard;
