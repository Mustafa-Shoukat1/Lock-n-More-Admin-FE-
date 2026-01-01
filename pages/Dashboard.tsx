
import React, { useState, useMemo } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis
} from 'recharts';
// Added RefreshCw to imports
import { DollarSign, Activity, Target, Zap, MessageSquare, Smartphone, BarChart3, Calendar, ArrowUpRight, AlertCircle, History, ShieldCheck, RefreshCw } from 'lucide-react';
import { useApp, SafeText } from '../App';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { conversations, orders, simulateLead, products } = useApp();
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
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 lg:flex-none px-8 py-3.5 bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 shadow-xl shadow-brand/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {/* Using RefreshCw which is now imported above */}
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

        {/* Right Sidebar - Recent Activity */}
        <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-8 rounded-3xl sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px] sm:h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <History size={20} className="text-brand" />
              <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">System Logs</h3>
            </div>
            <span className="px-3 py-1 bg-brand/10 text-brand rounded-full text-[9px] font-black uppercase">Live</span>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-none">
            {conversations.slice(0, 10).map((conv) => (
              <div key={conv.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-black text-xs">
                      {conv.customerName.charAt(0)}
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{conv.customerName}</p>
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">{conv.lastTimestamp}</p>
                </div>
                <p className="text-[10px] text-slate-500 italic line-clamp-2">
                  <SafeText text={conv.lastMessage} />
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${conv.aiEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {conv.aiEnabled ? 'AI Active' : 'Human Mode'}
                  </span>
                  <button onClick={() => navigate('/inbox')} className="text-[8px] font-black text-brand uppercase hover:underline">Intercept</button>
                </div>
              </div>
            ))}
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
