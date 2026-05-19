
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, BarChart, Bar
} from 'recharts';
import { 
  Activity, UserCheck, Zap, Sparkles, Target, ShoppingBag, 
  MessageSquare, CheckCircle2, DollarSign, BarChart3, Clock, ShieldCheck, 
  BrainCircuit, Users2, XCircle, TrendingUp, Filter, AlertTriangle, ArrowUpRight, Box, Package, RefreshCw
} from 'lucide-react';
import { useApp, SafeText } from '../App';
import { gemini } from '../services/gemini';

const Analytics: React.FC = () => {
  const { staff, conversations, orders, products } = useApp();
  const [activePanel, setActivePanel] = useState<'kpi' | 'sales' | 'product' | 'signals'>('kpi');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

  // Performance Tracking Logic
  const performanceKPIs = useMemo(() => {
    const humanAssigned = conversations.filter(c => c.assignedStaff);
    const hTotal = humanAssigned.length || 1;
    const hOpened = humanAssigned.filter(c => c.isOpenedByStaff).length;
    const hReplied = humanAssigned.filter(c => c.messages.some(m => m.sender === 'staff')).length;
    
    let totalLatency = 0;
    let respCount = 0;
    humanAssigned.forEach(c => {
      if (c.assignedAt && c.firstResponseAt) {
        const diff = (new Date(c.firstResponseAt).getTime() - new Date(c.assignedAt).getTime()) / 60000;
        if (diff > 0) { totalLatency += diff; respCount++; }
      }
    });
    const avgLatencyMin = respCount > 0 ? Math.round(totalLatency / respCount) : 18;

    return {
      human: { openRate: Math.round((hOpened / hTotal) * 100), replyRate: Math.round((hReplied / hTotal) * 100), avgResp: `${avgLatencyMin}m` },
      ai: { openRate: 100, replyRate: 100, avgResp: `4.2s` }
    };
  }, [conversations]);

  const platformDistribution = useMemo(() => {
    const data = [
      { name: 'WhatsApp', value: conversations.filter(c => c.platform === 'whatsapp').length },
      { name: 'Instagram', value: conversations.filter(c => c.platform === 'instagram').length },
      { name: 'TikTok', value: conversations.filter(c => c.platform === 'tiktok').length },
    ];
    return data;
  }, [conversations]);

  const productPerformance = useMemo(() => {
    return products.slice(0, 5).map(p => ({
      name: p.sku,
      sales: p.salesCount || 0,
      stock: p.stock
    }));
  }, [products]);

  const triggerSynthesis = async () => {
    setIsLoadingInsight(true);
    const context = `Human Open Rate: ${performanceKPIs.human.openRate}%, AI Latency: ${performanceKPIs.ai.avgResp}. Staff Bottlenecks: ${staff.length}. Platform Mix: WA=${platformDistribution[0].value}, IG=${platformDistribution[1].value}, TT=${platformDistribution[2].value}.`;
    const insight = await gemini.getAiResponseSuggestion("KPI Analysis Hub", context);
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
            <span className="text-[11px] font-black text-brand uppercase tracking-[0.2em]">KPI Performance Tracker</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-outfit tracking-tighter leading-none">Intelligence Hub</h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl text-left">Unified telemetry comparing Human Sales Agents vs. AI Virtual Nodes across all social perimeters.</p>
        </div>
        <button onClick={triggerSynthesis} className="z-10 px-10 py-5 bg-brand text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.03] transition-all flex items-center gap-3">
          {isLoadingInsight ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16}/>}
          {isLoadingInsight ? 'Calibrating...' : 'Sync Synthesis'}
        </button>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-2 shadow-sm">
        <TabButton active={activePanel === 'kpi'} onClick={() => setActivePanel('kpi')} icon={<Target size={16}/>} label="Performance" />
        <TabButton active={activePanel === 'sales'} onClick={() => setActivePanel('sales')} icon={<DollarSign size={16}/>} label="Revenue" />
        <TabButton active={activePanel === 'product'} onClick={() => setActivePanel('product')} icon={<ShoppingBag size={16}/>} label="Catalog" />
        <TabButton active={activePanel === 'signals'} onClick={() => setActivePanel('signals')} icon={<MessageSquare size={16}/>} label="Loads" />
      </div>

      <div className="grid grid-cols-1 gap-10">
        {activePanel === 'kpi' && (
          <div className="space-y-12 animate-in slide-in-from-bottom duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <KpiCard title="Human Agent Node" icon={<Users2 size={24} />} stats={[{ l: "Open Rate", v: `${performanceKPIs.human.openRate}%` }, { l: "Reply Rate", v: `${performanceKPIs.human.replyRate}%` }, { l: "Avg Resp", v: performanceKPIs.human.avgResp }]} color="blue" />
              <KpiCard title="AI Virtual Node" icon={<BrainCircuit size={24} />} stats={[{ l: "Availability", v: "100%" }, { l: "Accuracy", v: "92%" }, { l: "Latency", v: performanceKPIs.ai.avgResp }]} color="emerald" />
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter">Individual Performance Ledger</h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                   <Clock size={14} className="text-brand"/>authorized node tracking
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Node User</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Rate</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reply Status</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Latency (Avg)</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Node Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {staff.map((s, i) => {
                      const assigned = conversations.filter(c => c.assignedStaff === s.name);
                      const rate = assigned.length > 0 ? Math.round((assigned.filter(c => c.isOpenedByStaff).length / assigned.length) * 100) : 0;
                      return (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                          <td className="py-6 flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-black text-xs">{s.name.charAt(0)}</div>
                             <span className="font-bold text-sm font-outfit">{s.name}</span>
                          </td>
                          <td className="py-6"><span className="font-black text-sm">{rate}%</span></td>
                          <td className="py-6 text-center">{rate > 0 ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto" /> : <XCircle size={18} className="text-red-300 mx-auto" />}</td>
                          <td className="py-6 font-black text-sm text-slate-700 dark:text-slate-300">12m</td>
                          <td className="py-6 text-right"><span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${rate > 50 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{rate > 50 ? 'Optimal' : 'Low Output'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom text-left">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold font-outfit uppercase tracking-tighter">Gross Flow Velocity</h3>
                  <TrendingUp className="text-emerald-500" />
               </div>
               <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={(() => {
                       const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
                       const now = new Date();
                       return Array.from({length:7}, (_,i) => {
                         const d = new Date(now); d.setDate(d.getDate() - (6 - i));
                         const dayOrders = orders.filter(o => {
                           if (!o.date || o.date === 'N/A') return false;
                           const od = new Date(o.date);
                           return od.toDateString() === d.toDateString();
                         });
                         return { n: days[d.getDay()], v: dayOrders.reduce((a,b) => a + (Number(b.amount) || 0), 0) };
                       });
                    })()}>
                       <defs><linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient></defs>
                       <XAxis dataKey="n" hide /><YAxis hide /><Tooltip cursor={{stroke: '#2563EB', strokeWidth: 2}} /><Area type="monotone" dataKey="v" stroke="#2563EB" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="bg-slate-950 p-12 rounded-[4rem] text-white flex flex-col justify-center border border-slate-800 shadow-2xl">
               <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Master Settlement Flow</p>
               <h4 className="text-6xl font-bold font-outfit tracking-tighter leading-none">RM {orders.reduce((a,b)=>a+b.amount,0).toLocaleString()}</h4>
               <div className="mt-12 pt-10 border-t border-white/5 grid grid-cols-2 gap-8">
                  <div className="p-6 bg-white/5 rounded-2xl"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Fulfilled Nodes</p><p className="text-3xl font-black font-outfit text-emerald-500">{orders.filter(o=>o.status==='fulfilled').length}</p></div>
                  <div className="p-6 bg-white/5 rounded-2xl"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Yield Gain</p><p className="text-3xl font-black font-outfit text-brand">+21.2%</p></div>
               </div>
            </div>
          </div>
        )}

        {activePanel === 'product' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                 <h3 className="text-xl font-bold font-outfit mb-10 uppercase tracking-tighter flex items-center gap-3"><Package className="text-brand"/> Top Performing SKUs</h3>
                 <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={productPerformance} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
                          <Tooltip cursor={{fill: 'rgba(37,99,235,0.05)'}} />
                          <Bar dataKey="sales" fill="#2563EB" radius={[0, 10, 10, 0]} barSize={20} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="p-8 bg-amber-500 text-white rounded-[2.5rem] shadow-xl text-left">
                    <AlertTriangle className="mb-4" size={32}/>
                    <h4 className="text-4xl font-black font-outfit leading-none">{products.filter(p=>p.stock === 0).length}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-2">Critical Stock Breaks</p>
                 </div>
                 <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm text-left">
                    <TrendingUp className="text-brand mb-4" size={32}/>
                    <h4 className="text-2xl font-bold font-outfit leading-none">Digital Locks</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Highest Yield Category</p>
                 </div>
              </div>
           </div>
        )}

        {activePanel === 'signals' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom text-left">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
                 <h3 className="text-xl font-bold font-outfit mb-8 uppercase tracking-tighter self-start">Platform Signal Mix</h3>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={platformDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                             {platformDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex gap-6 mt-4">
                    {platformDistribution.map((p, i) => (
                       <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                          <span className="text-[10px] font-black uppercase text-slate-500">{p.name}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                 <div>
                    <h3 className="text-xl font-bold font-outfit mb-2 uppercase tracking-tighter">Signal Saturation</h3>
                    <p className="text-xs text-slate-400 font-bold mb-8">Average signal load per active staff node.</p>
                 </div>
                 <div className="space-y-6">
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex justify-between items-center">
                       <span className="text-xs font-black uppercase text-slate-500">Current Load Index</span>
                       <span className="text-2xl font-black font-outfit text-brand">24.2 / Node</span>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex justify-between items-center">
                       <span className="text-xs font-black uppercase text-slate-500">Peak Signal Period</span>
                       <span className="text-2xl font-black font-outfit text-emerald-500">10 PM - 12 AM</span>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
        <div className="flex items-center gap-4 mb-10"><Sparkles className="text-brand" size={30}/><h5 className="font-black text-brand uppercase text-xs tracking-[0.5em]">TOTO Synthesis Node</h5></div>
        <p className="text-2xl font-medium italic text-slate-600 dark:text-slate-400 leading-relaxed p-12 bg-slate-50 dark:bg-slate-950/50 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
          <SafeText text={aiInsight || 'Synthesizing global sales telemetry across authorized perimeter nodes...'} />
        </p>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-brand text-white shadow-2xl scale-105' : 'text-slate-500 hover:text-brand hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>{icon} {label}</button>
);

const KpiCard = ({ title, icon, stats, color }: any) => {
  const isBlue = color === 'blue';
  return (
    <div className={`p-10 rounded-[3.5rem] border ${isBlue ? 'bg-brand text-white border-brand' : 'bg-emerald-500 text-white border-emerald-500'} shadow-2xl text-left`}>
       <div className="flex items-center justify-between mb-12"><div className="p-4 bg-white/20 rounded-2xl">{icon}</div><p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{title}</p></div>
       <div className="grid grid-cols-3 gap-6">
          {stats.map((s: any, i: number) => (<div key={i} className="space-y-1"><p className="text-[9px] font-black uppercase opacity-60">{s.l}</p><p className="text-3xl font-black font-outfit">{s.v}</p></div>))}
       </div>
    </div>
  );
};

export default Analytics;
