import React, { useState, useMemo } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { TrendingUp, MessageSquare, ShoppingCart, Target, Users, Zap, Clock, ExternalLink, Globe, LayoutList, PieChart as PieChartIcon, Calendar, ArrowUpRight, ArrowDownRight, Activity, MousePointer2 } from 'lucide-react';
import { useApp } from '../App';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';

const Analytics: React.FC = () => {
  const { t } = useApp();
  const [reportRange, setReportRange] = useState('7'); // days

  // Dynamic Data Generators based on range
  const trendData = useMemo(() => {
    const days = parseInt(reportRange);
    return Array.from({ length: days }).map((_, i) => ({
      name: `Day ${i + 1}`,
      revenue: Math.floor(Math.random() * 8000) + 2000,
      leads: Math.floor(Math.random() * 100) + 30,
      conversion: Math.floor(Math.random() * 20) + 5,
      aiHandled: Math.floor(Math.random() * 90) + 10,
    }));
  }, [reportRange]);

  const platformEngagement = [
    { name: 'WhatsApp', value: 450, color: '#25D366', bounce: 12, ctr: 4.2 },
    { name: 'Instagram', value: 280, color: '#DD2A7B', bounce: 24, ctr: 3.8 },
    { name: 'TikTok', value: 190, color: '#000000', bounce: 35, ctr: 5.1 },
  ];

  const responseLatency = [
    { time: '08:00', avg: 1.2, max: 4.5 },
    { time: '10:00', avg: 0.8, max: 2.1 },
    { time: '12:00', avg: 0.5, max: 1.5 },
    { time: '14:00', avg: 0.7, max: 3.2 },
    { time: '16:00', avg: 0.9, max: 5.0 },
    { time: '18:00', avg: 0.6, max: 1.8 },
    { time: '20:00', avg: 1.1, max: 6.2 },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      {/* Header with Report Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-surface dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-outfit">Ecosystem Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-1 flex items-center gap-2">
            <Activity size={16} className="text-brand" /> Monitoring {platformEngagement.length} active sales channels
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none min-w-[160px]">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={reportRange}
              onChange={(e) => setReportRange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand appearance-none cursor-pointer"
            >
              <option value="7">Last 7 Days</option>
              <option value="15">Last 15 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Quarterly View</option>
            </select>
          </div>
          <button className="p-3 bg-brand text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-brand/25 transition-all active:scale-95 group">
            <ExternalLink size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIItem label="Net Revenue" value="RM 84.2k" trend="+18.5%" up icon={<TrendingUp />} color="text-brand bg-brand/10" />
        <KPIItem label="Lead CTR" value="12.4%" trend="+2.1%" up icon={<MousePointer2 />} color="text-emerald-500 bg-emerald-500/10" />
        <KPIItem label="AI Handled %" value="92.4%" trend="-1.2%" up={false} icon={<Zap />} color="text-purple-500 bg-purple-500/10" />
        <KPIItem label="Avg Session" value="4m 20s" trend="+45s" up icon={<Clock />} color="text-amber-500 bg-amber-500/10" />
      </div>

      {/* CHARTS ROW 1: Revenue Flow & Platform Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART 1: Revenue Velocity (Area Chart) */}
        <ChartCard title="Revenue Velocity" subtitle="Daily transaction volume" icon={<TrendingUp />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" opacity={0.3} />
                <XAxis dataKey="name" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '16px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={4} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* CHART 2: Engagement Mix (Radial/Pie Chart) */}
        <ChartCard title="Platform Distribution" subtitle="Incoming lead sources" icon={<Globe />}>
           <div className="flex flex-col sm:flex-row items-center h-80">
              <div className="flex-1 w-full h-64 sm:h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={platformEngagement} innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                      {platformEngagement.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-4 w-full">
                {platformEngagement.map(p => (
                  <div key={p.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                      <span className="text-xs font-black uppercase tracking-widest">{p.name}</span>
                    </div>
                    <span className="text-sm font-bold">{p.value}</span>
                  </div>
                ))}
              </div>
           </div>
        </ChartCard>
      </div>

      {/* CHARTS ROW 2: Latency & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART 3: Response Latency (Composed Chart) */}
        <ChartCard title="Latency Monitor" subtitle="AI response time vs peak load" icon={<Zap />}>
           <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={responseLatency}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip />
                  <Bar dataKey="max" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={20} opacity={0.2} />
                  <Line type="step" dataKey="avg" stroke="#2563EB" strokeWidth={3} dot={{r: 4}} />
               </ComposedChart>
             </ResponsiveContainer>
           </div>
        </ChartCard>

        {/* CHART 4: Conversion Heatmap Simulation (Scatter/Bubble) */}
        <ChartCard title="Lead Value Matrix" subtitle="Volume vs Conversion quality" icon={<Target />}>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis type="number" dataKey="leads" name="leads" unit="u" hide />
                  <YAxis type="number" dataKey="conversion" name="conversion" unit="%" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <ZAxis type="number" dataKey="revenue" range={[100, 1000]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Market Segments" data={trendData} fill="#8B5CF6" opacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
           </div>
        </ChartCard>
      </div>

      {/* CHARTS ROW 3: Detailed Funnel (Full Width) */}
      <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
          <Target size={200} className="text-brand" />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-white font-outfit mb-2">Sales Funnel Plot</h3>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Efficiency through the pipeline</p>
            </div>
            <div className="space-y-6">
               <FunnelStep label="Inbound Discovery" value="4,250" percent={100} color="bg-slate-700" />
               <FunnelStep label="AI Qualification" value="3,800" percent={89} color="bg-brand/60" />
               <FunnelStep label="Intent Signalled" value="1,420" percent={33} color="bg-brand/80" />
               <FunnelStep label="Invoice Deployed" value="840" percent={20} color="bg-brand" />
               <FunnelStep label="Settled Revenue" value="310" percent={7} color="bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm space-y-6">
              <h4 className="font-bold text-white uppercase text-xs tracking-widest flex items-center gap-2"><LayoutList size={16}/> Pipeline Insights</h4>
              <InsightItem label="TikTok Dropout" value="High (42%)" status="critical" />
              <InsightItem label="WA Res. Time" value="Sub-0.5s" status="optimal" />
              <InsightItem label="Manual Esc." value="12% Load" status="warning" />
              <button className="w-full py-4 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all">Optimize AI Rules</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPIItem = ({ label, value, trend, up, icon, color }: any) => (
  <div className="bg-surface dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
        {up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
        {trend}
      </div>
    </div>
    <h3 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white leading-none">{value}</h3>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
  </div>
);

const ChartCard = ({ title, subtitle, icon, children }: any) => (
  <div className="bg-surface dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-brand/10 text-brand rounded-xl">{React.cloneElement(icon, { size: 18 })}</div>
        <div>
          <h4 className="text-lg font-bold font-outfit leading-none">{title}</h4>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{subtitle}</p>
        </div>
      </div>
    </div>
    {children}
  </div>
);

const FunnelStep = ({ label, value, percent, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
      <span>{label}</span>
      <span className="text-white">{value}</span>
    </div>
    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
      <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

const InsightItem = ({ label, value, status }: any) => {
  const statusColors = {
    optimal: 'text-emerald-500 bg-emerald-500/10',
    warning: 'text-amber-500 bg-amber-500/10',
    critical: 'text-red-500 bg-red-500/10'
  };
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${statusColors[status as keyof typeof statusColors]}`}>{value}</span>
    </div>
  );
};

export default Analytics;