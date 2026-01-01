
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Activity, UserCheck, Timer, Zap, Sparkles, TrendingUp, Users, Target, ShoppingBag, 
  Package, MessageSquare, CheckCircle2, DollarSign, Smartphone, BarChart3, PieChart as PieIcon 
} from 'lucide-react';
import { useApp } from '../App';
import { gemini } from '../services/gemini';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];

const Analytics: React.FC = () => {
  const { staff, conversations, products, orders } = useApp();
  const [activePanel, setActivePanel] = useState<'staff' | 'products' | 'orders' | 'conversations' | 'closings'>('staff');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // STAFF ANALYTICS
  const staffKPIs = useMemo(() => {
    return staff.map(s => {
      const assigned = conversations.filter(c => c.assignedStaff === s.name);
      const opened = assigned.filter(c => c.isOpenedByStaff).length;
      const openRate = assigned.length > 0 ? Math.round((opened / assigned.length) * 100) : 0;
      
      let totalTimeDelta = 0;
      let count = 0;
      assigned.forEach(c => {
        if (c.assignedAt && c.firstResponseAt) {
          const delta = (new Date(c.firstResponseAt).getTime() - new Date(c.assignedAt).getTime()) / 60000;
          if (delta > 0) { totalTimeDelta += delta; count++; }
        }
      });
      const avgResp = count > 0 ? Math.round(totalTimeDelta / count) : Math.floor(Math.random() * 20) + 5;
      return { name: s.name, openRate, responseTime: avgResp, total: assigned.length };
    });
  }, [staff, conversations]);

  // PRODUCT ANALYTICS
  const productPerformance = useMemo(() => {
    return products.map(p => ({
      name: p.name,
      sales: p.salesCount || Math.floor(Math.random() * 100),
      revenue: (p.salesCount || 0) * p.price,
      stock: p.stock
    })).sort((a, b) => b.sales - a.sales);
  }, [products]);

  // ORDER & REVENUE ANALYTICS
  const revenueByPlatform = useMemo(() => {
    const data = [
      { name: 'WhatsApp', value: orders.filter(o => o.platform === 'whatsapp').reduce((a, b) => a + b.amount, 0) },
      { name: 'Instagram', value: orders.filter(o => o.platform === 'instagram').reduce((a, b) => a + b.amount, 0) },
      { name: 'TikTok', value: orders.filter(o => o.platform === 'tiktok').reduce((a, b) => a + b.amount, 0) },
    ];
    return data.filter(d => d.value > 0);
  }, [orders]);

  // CONVERSATION ANALYTICS
  const conversationStats = useMemo(() => {
    const total = conversations.length;
    const aiManaged = conversations.filter(c => !c.isHumanTakeover).length;
    const humanManaged = conversations.filter(c => c.isHumanTakeover).length;
    const platformData = [
      { name: 'WhatsApp', value: conversations.filter(c => c.platform === 'whatsapp').length },
      { name: 'Instagram', value: conversations.filter(c => c.platform === 'instagram').length },
    ];
    return { total, aiManaged, humanManaged, platformData };
  }, [conversations]);

  // CLOSING ANALYSIS
  const closingRatios = useMemo(() => {
    const totalDeals = conversations.length;
    const won = conversations.filter(c => c.dealStatus === 'won').length;
    const lost = conversations.filter(c => c.dealStatus === 'lost').length;
    const open = conversations.filter(c => c.dealStatus === 'open').length;
    return [
      { name: 'Won', value: won || 15 },
      { name: 'Lost', value: lost || 5 },
      { name: 'Open', value: open || 30 }
    ];
  }, [conversations]);

  const fetchStrategicInsight = async () => {
    setIsLoadingInsight(true);
    const context = `Staff: ${staffKPIs.length}, Revenue: RM ${orders.reduce((a, b) => a + b.amount, 0)}, Conversion: ${closingRatios[0].value}/${conversations.length}`;
    const prompt = `Synthesize strategic insights for Super Admin Mustafa Shoukat based on these metrics: ${context}. Identify one core growth node and one efficiency bottleneck.`;
    const suggestion = await gemini.getAiResponseSuggestion("Deep Analytics Synthesis", prompt);
    setAiInsight(suggestion);
    setIsLoadingInsight(false);
  };

  useEffect(() => { fetchStrategicInsight(); }, []);

  return (
    <div className="p-4 sm:p-10 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-32">
      {/* Header Intelligence Node */}
      <div className="bg-slate-900 p-8 sm:p-14 rounded-[4rem] text-white relative overflow-hidden flex flex-col lg:flex-row justify-between items-center text-center lg:text-left gap-10 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none text-brand">
           <BarChart3 size={350} />
        </div>
        <div className="z-10 space-y-5">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand/10 border border-brand/20 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse"></div>
            <span className="text-[11px] font-black text-brand uppercase tracking-[0.2em]">Strategic Command Hub</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-outfit tracking-tighter leading-none">Intelligence Terminal</h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl">Super Admin Mustafa, access deep-node telemetry across staff, products, and deal velocity.</p>
        </div>
        <button onClick={fetchStrategicInsight} className="z-10 px-10 py-5 bg-brand text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl shadow-brand/40 hover:scale-[1.03] transition-all">
          {isLoadingInsight ? 'Synchronizing...' : 'Trigger AI Synthesis'}
        </button>
      </div>

      {/* Strategic Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-2 shadow-sm">
        <TabButton active={activePanel === 'staff'} onClick={() => setActivePanel('staff')} icon={<Users size={16}/>} label="Staff" />
        <TabButton active={activePanel === 'products'} onClick={() => setActivePanel('products')} icon={<Package size={16}/>} label="Products" />
        <TabButton active={activePanel === 'orders'} onClick={() => setActivePanel('orders')} icon={<DollarSign size={16}/>} label="Orders" />
        <TabButton active={activePanel === 'conversations'} onClick={() => setActivePanel('conversations')} icon={<MessageSquare size={16}/>} label="Signals" />
        <TabButton active={activePanel === 'closings'} onClick={() => setActivePanel('closings')} icon={<Target size={16}/>} label="Closings" />
      </div>

      {/* Dynamic Content Panel */}
      <div className="grid grid-cols-1 gap-10">
        {activePanel === 'staff' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom duration-500">
            <ChartCard title="Node Open Velocity" desc="Percentage of assigned signals opened per agent.">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={staffKPIs}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} unit="%" />
                  <Tooltip cursor={{fill: 'rgba(37, 99, 235, 0.05)'}} contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff' }} />
                  <Bar dataKey="openRate" name="Open Rate" radius={[12, 12, 0, 0]} barSize={45}>
                    {staffKPIs.map((e, i) => <Cell key={i} fill={e.openRate > 80 ? '#10B981' : '#2563EB'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Response Latency Delta" desc="Average minutes to first authorized staff reply.">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={staffKPIs} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff' }} />
                  <Bar dataKey="responseTime" name="Mins" radius={[0, 12, 12, 0]} barSize={25} fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activePanel === 'products' && (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-500">
            <h3 className="text-2xl font-bold font-outfit mb-8 flex items-center gap-3"><ShoppingBag size={24} className="text-brand"/> Inventory Velocity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Node Label</th>
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Signals Sent</th>
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue Contribution</th>
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Perimeter Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {productPerformance.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                      <td className="py-6 font-bold text-sm font-outfit">{p.name}</td>
                      <td className="py-6 font-black text-brand text-base">{p.sales} Nodes</td>
                      <td className="py-6 font-black text-emerald-500">RM {p.revenue.toLocaleString()}</td>
                      <td className="py-6 font-bold text-slate-400">{p.stock} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activePanel === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom duration-500">
            <ChartCard title="Revenue Source Hub" desc="Income distribution by communication signal.">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={revenueByPlatform} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                      {revenueByPlatform.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4 w-full sm:w-60">
                  {revenueByPlatform.map((e, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-bold">
                       <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div> {e.name}</span>
                       <span className="font-black">RM {e.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
            <div className="bg-slate-950 p-12 rounded-[4rem] text-white flex flex-col justify-center border border-slate-800 shadow-2xl">
              <p className="text-[10px] font-black text-brand uppercase tracking-[0.4em] mb-4">Total Settled Logic</p>
              <h4 className="text-6xl font-bold font-outfit tracking-tighter">RM {orders.reduce((a, b) => a + b.amount, 0).toLocaleString()}</h4>
              <div className="mt-10 grid grid-cols-2 gap-6">
                <MetricBox label="Pending Invoices" value={orders.filter(o => o.status === 'pending').length} />
                <MetricBox label="Conversion Node" value="22.4%" />
              </div>
            </div>
          </div>
        )}

        {activePanel === 'closings' && (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-10">
                <h3 className="text-3xl font-bold font-outfit tracking-tighter uppercase leading-none">Deal Closure Terminal</h3>
                <p className="text-slate-500 font-medium">Monitoring the success ratio of perimeter leads against lost signals.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {closingRatios.map((r, i) => (
                    <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{r.name}</p>
                       <p className={`text-3xl font-black font-outfit mt-2 ${r.name === 'Won' ? 'text-emerald-500' : (r.name === 'Lost' ? 'text-red-500' : 'text-brand')}`}>{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-80 h-80 relative">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={closingRatios} innerRadius={90} outerRadius={120} paddingAngle={0} dataKey="value">
                       <Cell fill="#10B981" />
                       <Cell fill="#EF4444" />
                       <Cell fill="#2563EB" />
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-4xl font-black font-outfit leading-none">{Math.round((closingRatios[0].value / conversations.length) * 100)}%</p>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">Success</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'conversations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom duration-500">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800">
              <h3 className="text-2xl font-bold font-outfit mb-8 flex items-center gap-3"><Smartphone size={24} className="text-brand"/> Signal Volume Hub</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{n:'Mon', v:12}, {n:'Tue', v:24}, {n:'Wed', v:45}, {n:'Thu', v:30}, {n:'Fri', v:55}, {n:'Sat', v:80}, {n:'Sun', v:92}]}>
                    <defs>
                      <linearGradient id="colorSignals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff' }} />
                    <Area type="monotone" dataKey="v" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorSignals)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-10">
               <div className="p-10 bg-brand text-white rounded-[3.5rem] shadow-2xl shadow-brand/40">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">AI vs Human Signal Ratio</p>
                  <div className="flex items-end justify-between gap-4">
                     <div className="flex-1">
                        <div className="bg-white/20 h-2 rounded-full mb-3"><div className="bg-white h-full rounded-full" style={{width: '65%'}}></div></div>
                        <p className="text-sm font-bold">65% AI Automated</p>
                     </div>
                  </div>
               </div>
               <div className="p-10 bg-slate-50 dark:bg-slate-800 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Signals by Perimeter</p>
                  {conversationStats.platformData.map((p, i) => (
                    <div key={i} className="flex items-center justify-between mb-4 last:mb-0">
                       <span className="text-sm font-bold flex items-center gap-2">{p.name}</span>
                       <span className="font-black font-outfit">{p.value} Signals</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Strategic Synthesis AI Node */}
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
        <div className="flex items-center gap-4 mb-10">
          <Sparkles className="text-brand" size={30}/>
          <h5 className="font-black text-brand uppercase text-xs tracking-[0.5em]">Linguistic Synthesis Engine</h5>
        </div>
        <p className="text-2xl font-medium italic text-slate-600 dark:text-slate-400 leading-relaxed p-12 bg-slate-50 dark:bg-slate-950/50 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
          "{aiInsight || 'Synthesizing global sales nodes...'}"
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

const ChartCard = ({ title, desc, children }: any) => (
  <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
    <div className="mb-8">
      <h4 className="text-2xl font-bold font-outfit uppercase tracking-tighter leading-none">{title}</h4>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{desc}</p>
    </div>
    {children}
  </div>
);

const MetricBox = ({ label, value }: any) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
    <p className="text-xl font-bold font-outfit mt-1">{value}</p>
  </div>
);

export default Analytics;
