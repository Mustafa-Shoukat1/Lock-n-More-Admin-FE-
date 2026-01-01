
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line
} from 'recharts';
import { 
  Activity, UserCheck, Timer, Zap, Sparkles, TrendingUp, Users, Target, ShoppingBag, 
  Package, MessageSquare, CheckCircle2, DollarSign, Smartphone, BarChart3, AlertCircle, Clock, ShieldCheck, 
  BrainCircuit, Users2, XCircle, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../App';
import { gemini } from '../services/gemini';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];

const Analytics: React.FC = () => {
  const { staff, conversations, orders } = useApp();
  const [activePanel, setActivePanel] = useState<'kpi' | 'sales' | 'product' | 'signals'>('kpi');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // --- 1. PERFORMANCE TRACKING LOGIC (MULTI-AGENT) ---
  const performanceKPIs = useMemo(() => {
    const humanAssigned = conversations.filter(c => c.assignedStaff);
    const aiManaged = conversations.filter(c => !c.isHumanTakeover);

    // Human Stats
    const hTotal = humanAssigned.length || 1;
    const hOpened = humanAssigned.filter(c => c.isOpenedByStaff).length;
    const hReplied = humanAssigned.filter(c => c.messages.some(m => m.sender === 'staff')).length;
    
    // Response Duration Tracking
    let totalLatency = 0;
    let respCount = 0;
    humanAssigned.forEach(c => {
      if (c.assignedAt && c.firstResponseAt) {
        const diff = (new Date(c.firstResponseAt).getTime() - new Date(c.assignedAt).getTime()) / 60000;
        if (diff > 0) { totalLatency += diff; respCount++; }
      }
    });
    const avgLatencyMinutes = respCount > 0 ? Math.round(totalLatency / respCount) : 18;

    return {
      human: {
        openRate: Math.round((hOpened / hTotal) * 100),
        replyRate: Math.round((hReplied / hTotal) * 100),
        avgResponse: avgLatencyMinutes > 60 ? `${(avgLatencyMinutes/60).toFixed(1)}h` : `${avgLatencyMinutes}m`,
        total: humanAssigned.length
      },
      ai: {
        openRate: 100, 
        replyRate: 100,
        avgResponse: `4.2s`, // Standard 3-5s
        complexLatency: `8.5s`, // Complex 7-10s
        total: aiManaged.length
      }
    };
  }, [conversations]);

  // --- 2. INDIVIDUAL NODE TELEMETRY ---
  const staffMetrics = useMemo(() => {
    return staff.map(s => {
      const assigned = conversations.filter(c => c.assignedStaff === s.name);
      const opened = assigned.filter(c => c.isOpenedByStaff).length;
      const replied = assigned.filter(c => c.messages.some(m => m.sender === 'staff')).length;
      
      let latSum = 0;
      let count = 0;
      assigned.forEach(c => {
        if (c.assignedAt && c.firstResponseAt) {
          const d = (new Date(c.firstResponseAt).getTime() - new Date(c.assignedAt).getTime()) / 60000;
          if (d > 0) { latSum += d; count++; }
        }
      });
      const avg = count > 0 ? Math.round(latSum / count) : 0;
      const isDelayed = avg > 300; // Highlight delays > 5 hours

      return {
        name: s.name,
        openRate: assigned.length > 0 ? Math.round((opened / assigned.length) * 100) : 0,
        replied: replied > 0,
        avgTime: avg,
        isDelayed,
        total: assigned.length
      };
    });
  }, [staff, conversations]);

  const triggerSynthesis = async () => {
    setIsLoadingInsight(true);
    const contextStr = `Human Open Rate: ${performanceKPIs.human.openRate}%, AI Latency: ${performanceKPIs.ai.avgResponse}. Staff Bottlenecks: ${staffMetrics.filter(m=>m.isDelayed).length}.`;
    const insight = await gemini.getAiResponseSuggestion("KPI Analysis Report", contextStr);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  useEffect(() => { triggerSynthesis(); }, []);

  return (
    <div className="p-4 sm:p-10 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-32">
      {/* KPI Hub Header */}
      <div className="bg-slate-900 p-8 sm:p-14 rounded-[3.5rem] text-white relative overflow-hidden flex flex-col lg:flex-row justify-between items-center text-center lg:text-left gap-10 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none text-brand">
           <Zap size={350} />
        </div>
        <div className="z-10 space-y-5">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand/10 border border-brand/20 rounded-full">
            <ShieldCheck size={16} className="text-brand" />
            <span className="text-[11px] font-black text-brand uppercase tracking-[0.2em]">KPI Analysis Node</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-outfit tracking-tighter leading-none">Performance Tracker</h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl">Unified telemetry comparing Human Agents vs. AI Cognition.</p>
        </div>
        <button onClick={triggerSynthesis} className="z-10 px-10 py-5 bg-brand text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl shadow-brand/40 hover:scale-[1.03] transition-all">
          {isLoadingInsight ? 'Calibrating Intelligence...' : 'Generate Synthesis'}
        </button>
      </div>

      {/* Analytics Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-2 shadow-sm">
        <TabButton active={activePanel === 'kpi'} onClick={() => setActivePanel('kpi')} icon={<Target size={16}/>} label="Conversation KPIs" />
        <TabButton active={activePanel === 'sales'} onClick={() => setActivePanel('sales')} icon={<DollarSign size={16}/>} label="Revenue Velocity" />
        <TabButton active={activePanel === 'product'} onClick={() => setActivePanel('product')} icon={<ShoppingBag size={16}/>} label="Product Insights" />
        <TabButton active={activePanel === 'signals'} onClick={() => setActivePanel('signals')} icon={<MessageSquare size={16}/>} label="Inbox Load" />
      </div>

      {/* Main Analysis View */}
      <div className="grid grid-cols-1 gap-10">
        {activePanel === 'kpi' && (
          <div className="space-y-12 animate-in slide-in-from-bottom duration-500">
            {/* COMPARATIVE DASHBOARD: HUMAN VS AI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <KpiCard 
                title="Human Agent Perimeter" 
                icon={<Users2 size={24} />} 
                stats={[
                  { label: "Open Rate", value: `${performanceKPIs.human.openRate}%`, hint: "Target 80%+" },
                  { label: "Reply Rate", value: `${performanceKPIs.human.replyRate}%`, hint: "Target 100%" },
                  { label: "Avg Latency", value: performanceKPIs.human.avgResponse, hint: "Target <15m" }
                ]}
                color="blue"
              />
              <KpiCard 
                title="AI Virtual Node" 
                icon={<BrainCircuit size={24} />} 
                stats={[
                  { label: "Standard Sync", value: performanceKPIs.ai.avgResponse, hint: "3-5s Range" },
                  { label: "Complex Reasoning", value: performanceKPIs.ai.complexLatency, hint: "7-10s Max" },
                  { label: "Uptime Health", value: "99.9%", hint: "Stable" }
                ]}
                color="emerald"
              />
            </div>

            {/* STAFF PERFORMANCE LEDGER */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-10 text-left">
                <div>
                   <h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter">Individual Performance Ledger</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Live tracking of active staff assignments and response bottlenecks</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                   <Clock size={14} className="text-brand"/> Authorized Node Tracking
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Node User</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Rate</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reply Status</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Response</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Node Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {staffMetrics.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                        <td className="py-6 flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-black text-xs">{m.name.charAt(0)}</div>
                           <span className="font-bold text-sm font-outfit">{m.name}</span>
                        </td>
                        <td className="py-6">
                           <div className="flex items-center gap-2">
                              <span className="font-black text-sm">{m.openRate}%</span>
                              <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <div className="bg-brand h-full" style={{width: `${m.openRate}%`}}></div>
                              </div>
                           </div>
                        </td>
                        <td className="py-6 text-center">
                           {m.replied ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto" /> : <XCircle size={18} className="text-red-300 mx-auto" />}
                        </td>
                        <td className={`py-6 font-black text-sm ${m.isDelayed ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                           {m.avgTime > 60 ? `${(m.avgTime/60).toFixed(1)}h` : `${m.avgTime}m`}
                           {m.isDelayed && <span className="ml-2 text-[8px] uppercase px-2 py-0.5 bg-red-500/10 rounded-md">Delayed</span>}
                        </td>
                        <td className="py-6 text-right">
                           <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${m.isDelayed ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                              {m.isDelayed ? 'Critical' : 'Optimal'}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sales & Revenue Focus */}
        {activePanel === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 text-left">
               <h3 className="text-xl font-bold font-outfit mb-8 uppercase tracking-tighter">Gross Flow Velocity</h3>
               <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{n:'Mon',v:4000},{n:'Tue',v:3200},{n:'Wed',v:9800},{n:'Thu',v:5600},{n:'Fri',v:11200},{n:'Sat',v:8500},{n:'Sun',v:14000}]}>
                       <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="n" hide />
                       <YAxis hide />
                       <Tooltip cursor={{stroke: '#2563EB', strokeWidth: 2}} />
                       <Area type="monotone" dataKey="v" stroke="#2563EB" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="bg-slate-950 p-12 rounded-[4rem] text-white flex flex-col justify-center border border-slate-800 shadow-2xl text-left">
               <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Master Settlement Flow</p>
               <h4 className="text-6xl font-bold font-outfit tracking-tighter leading-none">RM {orders.reduce((a,b)=>a+b.amount,0).toLocaleString()}</h4>
               <div className="mt-12 pt-10 border-t border-white/5 grid grid-cols-2 gap-8">
                  <div className="p-6 bg-white/5 rounded-2xl">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Fulfilled Nodes</p>
                     <p className="text-3xl font-black font-outfit text-emerald-500">{orders.filter(o=>o.status==='fulfilled').length}</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Conversion Yield</p>
                     <p className="text-3xl font-black font-outfit text-brand">+21%</p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Synthesis Node */}
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
        <div className="flex items-center gap-4 mb-10">
          <Sparkles className="text-brand" size={30}/>
          <h5 className="font-black text-brand uppercase text-xs tracking-[0.5em]">TOTO Synthesis Node</h5>
        </div>
        <p className="text-2xl font-medium italic text-slate-600 dark:text-slate-400 leading-relaxed p-12 bg-slate-50 dark:bg-slate-950/50 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
          "{aiInsight || 'Synthesizing global sales telemetry across perimeter nodes...'}"
        </p>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-brand text-white shadow-2xl shadow-brand/40 scale-105' : 'text-slate-500 hover:text-brand hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
     {icon} {label}
  </button>
);

const KpiCard = ({ title, icon, stats, color }: any) => {
  const isBlue = color === 'blue';
  return (
    <div className={`p-10 rounded-[3.5rem] border ${isBlue ? 'bg-brand text-white border-brand' : 'bg-emerald-500 text-white border-emerald-500'} shadow-2xl text-left`}>
       <div className="flex items-center justify-between mb-12">
          <div className="p-4 bg-white/20 rounded-2xl">{icon}</div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{title}</p>
       </div>
       <div className="grid grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="space-y-1">
               <p className="text-[9px] font-black uppercase opacity-60">{s.label}</p>
               <p className="text-3xl font-black font-outfit">{s.value}</p>
               <p className="text-[8px] font-bold opacity-40 uppercase">{s.hint}</p>
            </div>
          ))}
       </div>
    </div>
  );
};

export default Analytics;
