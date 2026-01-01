
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, AreaChart, Area, Legend
} from 'recharts';
import { Activity, ShoppingCart, Target, BrainCircuit, MousePointer2, RefreshCw, UserCheck, AlertCircle, Zap, Sparkles, ChevronRight } from 'lucide-react';
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
      conversion: (Math.random() * 5 + 10).toFixed(1),
    }));
  }, [reportRange]);

  const staffStats = useMemo(() => {
    return staff.map(s => {
      const isSarah = s.name === 'Agent Sarah';
      return {
        name: s.name,
        openRate: s.role === 'super_admin' ? 100 : (isSarah ? 98 : Math.floor(Math.random() * 30) + 65),
        responseTime: s.role === 'super_admin' ? 2 : (isSarah ? 8 : Math.floor(Math.random() * 180) + 20),
      };
    });
  }, [staff]);

  const fetchStrategicInsight = async () => {
    setIsLoadingInsight(true);
    const context = `Staff stats: Open Rates vary from 65% to 100%. Avg response time 45m.`;
    const suggestion = await gemini.getAiResponseSuggestion(context, "How to improve staff closing speed?");
    setAiInsight(suggestion);
    setIsLoadingInsight(false);
  };

  useEffect(() => {
    fetchStrategicInsight();
  }, []);

  return (
    <div className="p-4 sm:p-10 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-slate-900 p-10 rounded-[3rem] border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-4 text-left">
          <h1 className="text-4xl sm:text-6xl font-bold text-white font-outfit tracking-tighter leading-none">Intelligence Hub</h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl">Deep behavior analytics and perimeter performance tracking.</p>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto z-10">
          <select value={reportRange} onChange={(e) => setReportRange(e.target.value)} className="pl-6 pr-10 py-5 bg-white/5 border border-white/10 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest outline-none">
            <option value="7">Last 7 Days</option>
            <option value="30">30D Velocity</option>
          </select>
          <button onClick={fetchStrategicInsight} className="px-8 py-5 bg-brand text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand/30">
            {isLoadingInsight ? <RefreshCw className="animate-spin" size={18} /> : 'Sync TOTO AI'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Settled Rev" value="RM 84.2k" trend="+18%" active={activeMetric === 'revenue'} onClick={() => setActiveMetric('revenue')} icon={<ShoppingCart />} />
        <MetricCard label="Lead Volume" value="420" trend="+32%" active={activeMetric === 'leads'} onClick={() => setActiveMetric('leads')} icon={<Target />} />
        <MetricCard label="AI Uptime" value="99.9%" trend="Optimal" active={activeMetric === 'ai'} onClick={() => setActiveMetric('ai')} icon={<Zap />} />
        <MetricCard label="Conversion" value="14.2%" trend="+2.1%" active={activeMetric === 'conversion'} onClick={() => setActiveMetric('conversion')} icon={<MousePointer2 />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <ChartHub title="Agent Performance Perimeter" subtitle="Comparative analysis of Open Rates and Response Velocity" icon={<UserCheck />}>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '20px' }} />
                  <Bar dataKey="openRate" name="Open Rate %" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={24} />
                  <Bar dataKey="responseTime" name="Resp Time (m)" fill="#F59E0B" radius={[8, 8, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartHub>

          <ChartHub title="Revenue Velocity" subtitle="Historical sales trends synchronized with Shopify nodes" icon={<Activity />}>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '16px', color: '#fff' }} />
                  <Area type="monotone" dataKey={activeMetric} stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorMetric)" dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartHub>
        </div>

        <div className="space-y-10">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white border border-slate-800 shadow-2xl sticky top-28 group">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-brand/20 text-brand rounded-2xl"><Sparkles size={24}/></div>
              <h4 className="text-xl font-bold font-outfit uppercase tracking-tighter">Strategic Advisor</h4>
            </div>
            <div className="space-y-8">
              {isLoadingInsight ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-50">
                  <div className="w-10 h-10 border-4 border-brand border-t-transparent animate-spin rounded-full"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Synthesizing...</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom duration-500 text-left">
                  <p className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 text-sm italic leading-relaxed text-slate-300">
                    "{aiInsight || 'Refesh TOTO AI for live tactical recommendations.'}"
                  </p>
                  <div className="mt-8 space-y-4">
                    <ActionStep label="Optimization" detail="Promote Sarah to Closer role." />
                    <ActionStep label="KPI Target" detail="Target <15m resp time nodes." />
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
  <button onClick={onClick} className={`p-8 rounded-[3rem] border text-left relative overflow-hidden group transition-all duration-300 ${active ? 'bg-white dark:bg-slate-900 border-brand shadow-2xl scale-[1.02]' : 'bg-surface dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'}`}>
    <div className={`p-4 rounded-2xl mb-8 w-fit ${active ? 'bg-brand text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="flex items-end justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white leading-none">{value}</h3>
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{trend}</span>
    </div>
  </button>
);

const ChartHub = ({ title, subtitle, icon, children }: any) => (
  <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
    <div className="flex items-center gap-4 mb-10">
      <div className="p-3 bg-brand/10 text-brand rounded-2xl">{React.cloneElement(icon, { size: 22 })}</div>
      <div>
        <h4 className="text-2xl font-bold font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">{title}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

const ActionStep = ({ label, detail }: any) => (
  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
    <div className="mt-1 text-brand"><ChevronRight size={14}/></div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white">{label}</p>
      <p className="text-[11px] text-slate-500 mt-1">{detail}</p>
    </div>
  </div>
);

export default Analytics;
