import React, { useState, useMemo } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { TrendingUp, MessageSquare, ShoppingCart, Target, Users, Zap, Clock, ExternalLink, Globe, LayoutList, PieChart as PieChartIcon, Calendar, ArrowUpRight, ArrowDownRight, Activity, MousePointer2, Smartphone, TrendingDown } from 'lucide-react';
import { useApp } from '../App';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';

const Analytics: React.FC = () => {
  const { t } = useApp();
  const [reportRange, setReportRange] = useState('7'); // days

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
    { name: 'WhatsApp', value: 450, color: '#25D366', icon: <WhatsAppIcon size={14}/> },
    { name: 'Instagram', value: 280, color: '#DD2A7B', icon: <InstagramIcon size={14}/> },
    { name: 'TikTok', value: 190, color: '#000000', icon: <TikTokIcon size={14} className="dark:text-white"/> },
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
    <div className="p-4 sm:p-10 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-24">
      {/* Header with Report Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-surface dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-outfit tracking-tight">Intelligence Console</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-2 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand animate-ping"></div>
            Real-time telemetry from {platformEngagement.length} perimeter nodes
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none min-w-[200px]">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={reportRange}
              onChange={(e) => setReportRange(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:ring-4 focus:ring-brand/10 appearance-none cursor-pointer transition-all"
            >
              <option value="7">Last 7 Days</option>
              <option value="15">Last 15 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">90D Quarter View</option>
            </select>
          </div>
          <button className="p-4 bg-brand text-white rounded-3xl hover:bg-blue-700 shadow-2xl shadow-brand/30 transition-all active:scale-90 group">
            <ExternalLink size={24} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      {/* High-Fidelity KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <KPIItem label="Ecosystem Revenue" value="RM 84.2k" trend="+18.5%" up icon={<TrendingUp />} color="text-brand bg-brand/10" />
        <KPIItem label="Interaction Rate" value="12.4%" trend="+2.1%" up icon={<MousePointer2 />} color="text-emerald-500 bg-emerald-500/10" />
        <KPIItem label="Autonomous Ratio" value="92.4%" trend="-1.2%" up={false} icon={<Zap />} color="text-purple-500 bg-purple-500/10" />
        <KPIItem label="Avg Session Time" value="4m 20s" trend="+45s" up icon={<Clock />} color="text-amber-500 bg-amber-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* CHART 1: Area Flow */}
        <div className="lg:col-span-2">
          <ChartCard title="Revenue Velocity" subtitle="Daily transaction flow" icon={<TrendingUp />}>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" opacity={0.2} />
                  <XAxis dataKey="name" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '24px', color: '#fff', padding: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#3B82F6' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={5} fill="url(#colorRev)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Platform Heatmap */}
        <div className="space-y-8 flex flex-col">
          <ChartCard title="Source Mix" subtitle="Node engagement sources" icon={<Globe />}>
             <div className="flex flex-col items-center justify-center h-full">
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={platformEngagement} innerRadius={70} outerRadius={100} paddingAngle={10} dataKey="value" stroke="none">
                        {platformEngagement.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-3 mt-6">
                  {platformEngagement.map(p => (
                    <div key={p.name} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 cursor-pointer shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl shadow-inner" style={{ backgroundColor: p.color + '20', color: p.color }}>{p.icon}</div>
                        <span className="text-xs font-black uppercase tracking-[0.2em]">{p.name}</span>
                      </div>
                      <span className="text-sm font-black font-outfit">{p.value} Hits</span>
                    </div>
                  ))}
                </div>
             </div>
          </ChartCard>
        </div>
      </div>

      {/* Latency Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <ChartCard title="Response Latency" subtitle="Processing time vs Peak" icon={<Zap />}>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={responseLatency}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '700'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '700'}} />
                  <Tooltip />
                  <Bar dataKey="max" fill="#F43F5E" radius={[8, 8, 0, 0]} barSize={25} opacity={0.15} />
                  <Line type="monotone" dataKey="avg" stroke="#2563EB" strokeWidth={4} dot={{r: 6, fill: '#2563EB', strokeWidth: 3, stroke: '#fff'}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Funnel Section */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden border border-slate-800 min-h-[450px]">
            <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 pointer-events-none">
              <Target size={280} className="text-brand" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row gap-12 h-full">
              <div className="flex-1 space-y-10">
                <div>
                  <h3 className="text-3xl font-bold text-white font-outfit tracking-tight">Perimeter Funnel</h3>
                  <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mt-2">Conversion efficiency at edge nodes</p>
                </div>
                <div className="space-y-8">
                  <FunnelStep label="Inbound Signal" value="4,250" percent={100} color="bg-slate-700" />
                  <FunnelStep label="AI Qualification" value="3,800" percent={89} color="bg-brand/50" />
                  <FunnelStep label="Intent Captured" value="1,420" percent={35} color="bg-brand" />
                  <FunnelStep label="Revenue Event" value="310" percent={8} color="bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
              <div className="w-full md:w-80 space-y-4">
                <div className="p-8 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-xl h-full flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-white uppercase text-[10px] tracking-[0.3em] mb-8 flex items-center gap-3"><LayoutList size={18} className="text-brand"/> Live Diagnostics</h4>
                    <div className="space-y-4">
                      <DiagnosticItem label="WA Node Speed" value="Optimum" status="optimal" />
                      <DiagnosticItem label="AI Bias Logic" value="Calibrated" status="optimal" />
                      <DiagnosticItem label="Human Latency" value="Critical" status="critical" />
                    </div>
                  </div>
                  <button className="w-full mt-10 py-5 bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-brand/20 active:scale-95">Re-Calibrate Engine</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPIItem = ({ label, value, trend, up, icon, color }: any) => (
  <div className="bg-surface dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_-15px_rgba(37,99,235,0.15)] transition-all duration-500 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-brand/10 transition-all"></div>
    <div className="flex items-center justify-between mb-8">
      <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-sm`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl ${up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'} shadow-inner`}>
        {up ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
        {trend}
      </div>
    </div>
    <h3 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white leading-none tracking-tighter">{value}</h3>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4">{label}</p>
  </div>
);

const ChartCard = ({ title, subtitle, icon, children }: any) => (
  <div className="bg-surface dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden relative group">
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand/10 text-brand rounded-2xl group-hover:scale-110 transition-transform">{React.cloneElement(icon, { size: 22 })}</div>
        <div>
          <h4 className="text-xl font-bold font-outfit leading-none tracking-tight">{title}</h4>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-2">{subtitle}</p>
        </div>
      </div>
    </div>
    {children}
  </div>
);

const FunnelStep = ({ label, value, percent, color }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
      <span>{label}</span>
      <span className="text-white bg-white/10 px-2 py-0.5 rounded">{value}</span>
    </div>
    <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden p-1 shadow-inner">
      <div className={`h-full rounded-full transition-all duration-[1500ms] ${color}`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

const DiagnosticItem = ({ label, value, status }: any) => {
  const statusColors = {
    optimal: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    critical: 'text-red-400 bg-red-400/10 border-red-400/20'
  };
  return (
    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter border ${statusColors[status as keyof typeof statusColors]}`}>{value}</span>
    </div>
  );
};

export default Analytics;