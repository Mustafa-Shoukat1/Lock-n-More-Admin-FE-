import React, { useState, useMemo, useEffect } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line, ScatterChart, Scatter, Timer
} from 'recharts';
import { TrendingUp, ShoppingCart, Target, Activity, Zap, Clock, Globe, Calendar, MousePointer2, Heart, Sparkles, BrainCircuit, RefreshCw, UserCheck, AlertCircle, Timer as TimerIcon, BarChart3, ChevronRight } from 'lucide-react';
import { useApp } from '../App';
import { gemini } from '../services/gemini';

const Analytics: React.FC = () => {
  const { staff } = useApp();
  const [reportRange, setReportRange] = useState('7');
  const [activeMetric, setActiveMetric] = useState('revenue');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const trendData = useMemo(() => {
    const days = parseInt(reportRange);
    return Array.from({ length: days }).map((_, i) => ({
      name: `Day ${i + 1}`,
      revenue: Math.floor(Math.random() * 8000) + 2000,
      leads: Math.floor(Math.random() * 100) + 30,
      sentiment: Math.floor(Math.random() * 40) + 60,
      aiEfficiency: Math.floor(Math.random() * 20) + 75,
      conversion: (Math.random() * 5 + 10).toFixed(1),
    }));
  }, [reportRange]);

  const staffPerformance = useMemo(() => {
    return staff.map(s => {
      // Logic: Super Admin has perfect stats, Agents have varying performance
      const isOpenRateLow = s.name === 'Agent Sarah' ? false : Math.random() > 0.7;
      return {
        name: s.name,
        openRate: s.role === 'super_admin' ? 100 : Math.floor(Math.random() * 25) + 75,
        responseTimeRaw: s.role === 'super_admin' ? 2 : (s.name === 'Agent Sarah' ? 12 : Math.floor(Math.random() * 180) + 30),
        efficiency: Math.floor(Math.random() * 15) + 85,
        avatar: s.avatar,
        status: s.active ? 'Active' : 'Offline'
      };
    });
  }, [staff]);

  const fetchStrategicInsight = async () => {
    setIsLoadingInsight(true);
    const context = `Analyze these KPIs: Revenue trend is up 18%, Staff Open Rate average is 82%, but Response Time is lagging at 45m. Focus on agent efficiency.`;
    const prompt = `Act as a senior business consultant. Provide 3 high-impact strategies to improve the 45m response time and increase the 82% message open rate for the sales team. Use authoritative, data-driven language.`;
    const insight = await gemini.getAiResponseSuggestion(context, prompt);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  useEffect(() => {
    fetchStrategicInsight();
  }, []);

  return (
    <div className="p-4 sm:p-10 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-32">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-slate-900 p-10 sm:p-14 rounded-[4rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-[2000ms] pointer-events-none text-brand">
          <Activity size={400} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
            <span className="text-[10px] font-black text-brand uppercase tracking-widest">Global Telemetery Active</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white font-outfit tracking-tighter leading-none">Command Intelligence</h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl">Deep behavior analytics and staff performance perimeter.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto relative z-10">
          <select 
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value)}
            className="pl-6 pr-10 py-5 bg-white/5 border border-white/10 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all"
          >
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
          </select>
          <button onClick={fetchStrategicInsight} className="px-8 py-5 bg-brand text-white rounded-[2rem] hover:bg-blue-700 shadow-xl shadow-brand/30 transition-all active:scale-95 flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
            {isLoadingInsight ? <RefreshCw className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
            Sync Strategic AI
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Settled Rev" value="RM 84.2k" trend="+18%" active={activeMetric === 'revenue'} onClick={() => setActiveMetric('revenue')} icon={<ShoppingCart />} color="blue" />
        <MetricCard label="Signal Leads" value="420" trend="+32%" active={activeMetric === 'leads'} onClick={() => setActiveMetric('leads')} icon={<Target />} color="emerald" />
        <MetricCard label="AI Density" value="92%" trend="+5.1%" active={activeMetric === 'aiEfficiency'} onClick={() => setActiveMetric('aiEfficiency')} icon={<BrainCircuit />} color="purple" />
        <MetricCard label="Conversion" value="14.2%" trend="+2.1%" active={activeMetric === 'conversion'} onClick={() => setActiveMetric('conversion')} icon={<MousePointer2 />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Chart */}
          <ChartHub title="Performance Dynamics" subtitle={`Tracking ${activeMetric.toUpperCase()} flow across selected range`} icon={<Activity />}>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '16px', color: '#fff' }} />
                  <Area type="monotone" dataKey={activeMetric} stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorMetric)" dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartHub>

          {/* STAFF PERFORMANCE PERIMETER - NEW KPI SECTION */}
          <ChartHub title="Agent Accountability Hub" subtitle="Individual tracking of message open rates and reply velocity" icon={<UserCheck />}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={staffPerformance} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px' }} />
                    <Bar dataKey="openRate" name="Open Rate %" fill="#2563EB" radius={[0, 8, 8, 0]} barSize={20} />
                    <Bar dataKey="responseTimeRaw" name="Response Time (m)" fill="#F59E0B" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="pb-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Node Agent</th>
                        <th className="pb-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Open Rate</th>
                        <th className="pb-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Avg Resp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {staffPerformance.map(agent => (
                        <tr key={agent.name} className="group">
                          <td className="py-4 flex items-center gap-3">
                            <img src={agent.avatar} className="w-8 h-8 rounded-lg object-cover" />
                            <span className="text-xs font-bold">{agent.name}</span>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`text-xs font-black ${agent.openRate > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{agent.openRate}%</span>
                          </td>
                          <td className="py-4 text-right font-black text-xs">
                            {agent.responseTimeRaw}m
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-brand/5 rounded-2xl border border-brand/10 flex items-start gap-3">
                  <AlertCircle size={14} className="text-brand mt-0.5" />
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                    Alert: High latency detected for non-admin nodes. Review Sarah Lim's backlog.
                  </p>
                </div>
              </div>
            </div>
          </ChartHub>
        </div>

        {/* AI Insight Sidebar */}
        <div className="space-y-10">
          <div className="bg-slate-900 p-10 rounded-[4rem] text-white border border-slate-800 shadow-2xl sticky top-28 group">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-brand/20 text-brand rounded-2xl group-hover:rotate-12 transition-transform">
                <Sparkles size={24}/>
              </div>
              <h4 className="text-xl font-bold font-outfit tracking-tighter uppercase">TOTO Advisor</h4>
            </div>
            
            <div className="space-y-8 min-h-[300px]">
              {isLoadingInsight ? (
                <div className="flex flex-col items-center justify-center space-y-4 opacity-50">
                  <div className="w-10 h-10 border-4 border-brand border-t-transparent animate-spin rounded-full"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Analyzing Perimeter...</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom duration-500">
                  <p className="p-6 bg-white/5 rounded-3xl border border-white/10 text-sm italic leading-relaxed text-slate-300">
                    "{aiInsight || 'Sync Strategic AI to generate live behavior recommendations.'}"
                  </p>
                  <div className="mt-8 space-y-4">
                    <ActionStep label="Optimization" detail="Shift Sarah Lim to High Priority leads." />
                    <ActionStep label="Efficiency" detail="AI Density is high (92%). Maintain current logic." />
                    <ActionStep label="Response" detail="Target: <15m average response time." />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, trend, active, onClick, icon }: any) => (
  <button 
    onClick={onClick}
    className={`p-8 rounded-[3rem] border transition-all duration-300 text-left relative overflow-hidden group ${active ? 'bg-white dark:bg-slate-900 border-brand shadow-2xl' : 'bg-surface dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 hover:scale-[1.02]'}`}
  >
    <div className={`p-4 rounded-2xl mb-8 w-fit ${active ? 'bg-brand text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="flex items-end justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-bold font-outfit leading-none">{value}</h3>
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>{trend}</span>
    </div>
  </button>
);

const ChartHub = ({ title, subtitle, icon, children }: any) => (
  <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex items-center gap-4 mb-10">
      <div className="p-3 bg-brand/10 text-brand rounded-2xl">
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <div>
        <h4 className="text-2xl font-bold font-outfit tracking-tighter uppercase">{title}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

const ActionStep = ({ label, detail }: any) => (
  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
    <div className="mt-1 text-brand"><ChevronRight size={14}/></div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white">{label}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{detail}</p>
    </div>
  </div>
);

export default Analytics;