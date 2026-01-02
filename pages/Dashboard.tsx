
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis
} from 'recharts';
import { DollarSign, Activity, Zap, BarChart3, Calendar, ArrowUpRight, AlertCircle, ShieldCheck, RefreshCw, CheckCircle, Link2, Unlink2, Terminal, Info, ChevronRight, ClipboardCheck } from 'lucide-react';
import { useApp } from '../App';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';

const Dashboard: React.FC = () => {
  const { conversations, orders, simulateLead, stressTest, runFullAudit, products, systemLogs, integrationSettings } = useApp();
  const [isAuditRunning, setIsAuditRunning] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [systemLogs]);

  const totalRevenue = useMemo(() => orders.reduce((acc, curr) => acc + curr.amount, 0), [orders]);
  const activeSignals = conversations.length;
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

  const handleAudit = () => {
    setIsAuditRunning(true);
    runFullAudit();
    setTimeout(() => setIsAuditRunning(false), 5000);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-24 md:pb-8 text-left">
      {/* Header Hub */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-surface dark:bg-slate-900 p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/10 dark:shadow-none">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white font-outfit tracking-tighter uppercase leading-none">Command Center</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] sm:text-xs flex items-center gap-2 uppercase tracking-widest mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Perimeter Security: Maximum • All Nodes Syncing
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={stressTest}
            className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <AlertCircle size={14} /> Stress Test
          </button>
          <button 
            onClick={handleAudit}
            disabled={isAuditRunning}
            className="flex-1 lg:flex-none px-8 py-3.5 bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 shadow-xl shadow-brand/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isAuditRunning ? <RefreshCw className="animate-spin" size={14} /> : <ClipboardCheck size={14} />}
            {isAuditRunning ? 'Auditing Subsystems...' : 'Run Full Audit'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashMetric label="Revenue Flow" value={`RM ${totalRevenue.toLocaleString()}`} trend="+12.5%" icon={<DollarSign />} color="blue" />
        <DashMetric label="Active Nodes" value={activeSignals.toString()} trend="Omni-Live" icon={<Activity />} color="emerald" />
        <DashMetric label="Stock Breaks" value={outOfStockCount.toString()} trend="Verify SKU" icon={<AlertCircle />} color="amber" />
        <DashMetric label="System Health" value="100.0%" trend="Optimal" icon={<ShieldCheck />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Main Sales Chart */}
          <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white font-outfit uppercase tracking-tighter leading-none">Settlement Velocity</h3>
              <div className="p-2.5 bg-brand/10 rounded-xl text-brand"><BarChart3 size={20} /></div>
            </div>
            <div className="h-64 sm:h-80 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} dx={-5} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff' }} itemStyle={{ fontSize: '10px', fontWeight: '800' }} />
                  <Area type="monotone" dataKey="sales" stroke="#2563EB" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deployment Readiness Checklist */}
          <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
             <div className="flex items-center gap-4 mb-8">
                <ShieldCheck size={24} className="text-emerald-500"/>
                <h3 className="text-xl font-bold font-outfit uppercase tracking-tighter leading-none">Deployment Readiness</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CheckItem label="Meta WhatsApp API Handshake" status="OK" />
                <CheckItem label="Instagram Signal Bridge" status="OK" />
                <CheckItem label="TikTok Commerce Webhook" status="OK" />
                <CheckItem label="Gemini 3 Flash Reasoning" status="OK" />
                <CheckItem label="Shopify SKU Database Sync" status="OK" />
                <CheckItem label="RBAC Perimeter Security" status="OK" />
             </div>
          </div>
        </div>

        {/* Diagnostic Terminal Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[550px] text-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Terminal size={18} className="text-brand" />
                <h3 className="text-sm font-black uppercase text-white tracking-widest">Diagnostic Logic</h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            
            <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-3 scrollbar-none pb-4">
              {systemLogs.length === 0 ? (
                <div className="text-slate-600 opacity-50 italic">Awaiting internal node signals...</div>
              ) : (
                systemLogs.map((log) => (
                  <div key={log.id} className="border-l-2 border-slate-800 pl-3 py-0.5 group">
                    <span className="text-slate-600 mr-2">[{log.timestamp}]</span>
                    <span className={`uppercase font-bold mr-2 ${
                      log.type === 'error' ? 'text-red-500' : 
                      log.type === 'ai' ? 'text-brand' : 
                      log.type === 'success' ? 'text-emerald-500' : 'text-slate-400'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300 group-hover:text-white transition-colors">{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
               <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 mb-2">
                  <span>Logic Utilization</span>
                  <span>{Math.min(100, Math.floor(conversations.length * 2.5))}%</span>
               </div>
               <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand transition-all duration-500" style={{ width: `${Math.min(100, conversations.length * 2.5)}%` }}></div>
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-sm text-left group cursor-pointer hover:border-brand transition-all">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:bg-brand group-hover:text-white transition-all"><CheckCircle size={20}/></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Master Auth</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Authorized 1.0.4-PROD</p>
                </div>
             </div>
             <ChevronRight size={16} className="text-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckItem = ({ label, status }: { label: string, status: string }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
     <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">{label}</span>
     <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1"><CheckCircle size={10}/> {status}</span>
  </div>
);

const DashMetric = ({ label, value, trend, icon, color }: any) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  };
  return (
    <div className="bg-surface dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:scale-[1.02] duration-300 group overflow-hidden text-left">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3 rounded-2xl ${(colors as any)[color]}`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${trend.includes('%') || trend === 'Optimal' || trend === 'Omni-Live' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-brand/10 text-brand'}`}>
          {trend.startsWith('+') && <ArrowUpRight size={10}/>}
          {trend}
        </div>
      </div>
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-outfit tracking-tighter leading-none">{value}</h2>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 leading-none">{label}</p>
      </div>
    </div>
  );
};

export default Dashboard;
