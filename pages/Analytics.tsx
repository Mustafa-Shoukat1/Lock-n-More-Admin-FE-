import React, { useState, useMemo, useEffect } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { TrendingUp, MessageSquare, ShoppingCart, Target, Users, Zap, Clock, ExternalLink, Globe, LayoutList, PieChart as PieChartIcon, Calendar, ArrowUpRight, ArrowDownRight, Activity, MousePointer2, Smartphone, TrendingDown, Heart, ShieldAlert, Sparkles, BrainCircuit, Info, ChevronRight, RefreshCw } from 'lucide-react';
import { useApp } from '../App';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';
import { gemini } from '../services/gemini';

const Analytics: React.FC = () => {
  const { t } = useApp();
  const [reportRange, setReportRange] = useState('7'); // days
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

  const correlationData = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      sentiment: Math.floor(Math.random() * 100),
      value: Math.floor(Math.random() * 5000) + 500,
      platform: ['wa', 'ig', 'tt'][Math.floor(Math.random() * 3)],
    }));
  }, []);

  const platformEngagement = [
    { name: 'WhatsApp', value: 450, color: '#25D366' },
    { name: 'Instagram', value: 280, color: '#DD2A7B' },
    { name: 'TikTok', value: 190, color: '#000000' },
  ];

  const sentimentMix = [
    { name: 'Positive', value: 68, color: '#10B981' },
    { name: 'Neutral', value: 22, color: '#94A3B8' },
    { name: 'Negative', value: 10, color: '#EF4444' },
  ];

  const fetchStrategicInsight = async () => {
    setIsLoadingInsight(true);
    const dataStr = JSON.stringify(trendData.slice(-5));
    const prompt = `Act as a senior business analyst for Mustafa Shoukat. Analyze this raw JSON sales/sentiment data from the TOTO platform: ${dataStr}. Provide a punchy, 3-sentence strategic recommendation for scaling digital lock sales. Be authoritative and precise.`;
    const insight = await gemini.getAiResponseSuggestion("Mustafa Shoukat's TOTO Platform Analytics Hub", prompt);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  useEffect(() => {
    fetchStrategicInsight();
  }, [reportRange]);

  return (
    <div className="p-4 sm:p-10 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-32">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-surface dark:bg-slate-900 p-10 sm:p-14 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-[2000ms] pointer-events-none">
          <Activity size={400} className="text-brand" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/5 border border-brand/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-brand animate-ping"></div>
            <span className="text-[10px] font-black text-brand uppercase tracking-widest">Live Telemetery Active</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white font-outfit tracking-tighter leading-none">Intelligence Node</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-xl">Centralized data synthesis from the TOTO sales perimeter.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto relative z-10">
          <div className="relative flex-1 lg:flex-none min-w-[240px]">
            <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={reportRange}
              onChange={(e) => setReportRange(e.target.value)}
              className="w-full pl-14 pr-8 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:ring-4 focus:ring-brand/10 appearance-none cursor-pointer transition-all shadow-sm"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">30D Velocity</option>
              <option value="90">Quarterly View</option>
            </select>
          </div>
          <button onClick={fetchStrategicInsight} className="p-5 bg-brand text-white rounded-[2rem] hover:bg-blue-700 shadow-2xl shadow-brand/30 transition-all active:scale-90 flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
            {isLoadingInsight ? <RefreshCw className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
            Refesh Intel
          </button>
        </div>
      </div>

      {/* Interactive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard 
          label="Settled Revenue" 
          value="RM 84.2k" 
          trend="+18%" 
          active={activeMetric === 'revenue'} 
          onClick={() => setActiveMetric('revenue')}
          color="#2563EB"
          icon={<ShoppingCart />}
        />
        <MetricCard 
          label="Lead Flow" 
          value="420" 
          trend="+32%" 
          active={activeMetric === 'leads'} 
          onClick={() => setActiveMetric('leads')}
          color="#10B981"
          icon={<Target />}
        />
        <MetricCard 
          label="AI Density" 
          value="92%" 
          trend="+5%" 
          active={activeMetric === 'aiEfficiency'} 
          onClick={() => setActiveMetric('aiEfficiency')}
          color="#8B5CF6"
          icon={<BrainCircuit />}
        />
        <MetricCard 
          label="Conv. Rate" 
          value="14.2%" 
          trend="+2.1%" 
          active={activeMetric === 'conversion'} 
          onClick={() => setActiveMetric('conversion')}
          color="#F59E0B"
          icon={<MousePointer2 />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Main Strategic Insight Engine */}
        <div className="lg:col-span-3 space-y-10">
          <ChartHub title="Performance Dynamics" subtitle={`Viewing ${activeMetric.toUpperCase()} flow across selected nodes`} icon={<Activity />}>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} dx={-5} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '24px', padding: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                  />
                  <Area type="monotone" dataKey={activeMetric} stroke="none" fill="url(#chartGrad)" animationDuration={1500} />
                  <Line type="monotone" dataKey={activeMetric} stroke="#2563EB" strokeWidth={5} dot={{ r: 6, fill: '#2563EB', strokeWidth: 3, stroke: '#fff' }} animationDuration={1500} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartHub>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <ChartHub title="Platform Mix" subtitle="Traffic origin per signal" icon={<Globe />}>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={platformEngagement} innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value" stroke="none">
                      {platformEngagement.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-6">
                {platformEngagement.map(p => (
                   <div key={p.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: p.color}}></div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{p.name}</span>
                   </div>
                ))}
              </div>
            </ChartHub>

            <ChartHub title="Sentiment Correlation" subtitle="Sentiment (X) vs Value (Y)" icon={<Heart />}>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" dataKey="sentiment" name="Sentiment" hide />
                    <YAxis type="number" dataKey="value" name="Value" hide />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Transactions" data={correlationData} fill="#2563EB" opacity={0.6}>
                       {correlationData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.platform === 'wa' ? '#25D366' : entry.platform === 'ig' ? '#DD2A7B' : '#000'} />
                       ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[9px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">Clusters indicate optimal platform for conversion</p>
            </ChartHub>
          </div>
        </div>

        {/* Gemini AI Strategic Sidebar */}
        <div className="lg:col-span-1 space-y-10">
          <div className="bg-slate-900 p-10 rounded-[4rem] text-white border border-slate-800 shadow-2xl sticky top-28 h-fit group">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-brand/20 text-brand rounded-2xl group-hover:rotate-12 transition-transform">
                  <Sparkles size={24}/>
               </div>
               <div>
                  <h4 className="text-xl font-bold font-outfit leading-none">TOTO Strategic Advisor</h4>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Gemini Analysis Engine</p>
               </div>
            </div>
            
            <div className="space-y-8 min-h-[300px] flex flex-col">
              {isLoadingInsight ? (
                <div className="flex-1 flex flex-col justify-center items-center space-y-4 opacity-50">
                   <div className="w-12 h-12 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synthesizing Nodes...</p>
                </div>
              ) : (
                <div className="flex-1 animate-in fade-in slide-in-from-bottom duration-700">
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/10 italic text-slate-300 text-sm leading-relaxed mb-8">
                     "{aiInsight || 'No tactical signals detected. Refesh to sync perimeter data.'}"
                   </div>
                   <div className="space-y-4">
                      <ActionStep icon={<Target size={14}/>} label="Optimization Ready" detail="Focus on WhatsApp for RM 1k+ items." />
                      <ActionStep icon={<Clock size={14}/>} label="Traffic Surge" detail="Peak lead flow detected 8PM-11PM." />
                      <ActionStep icon={<Zap size={14}/>} label="TOTO Logic Alert" detail="Adjust density for Instagram leads." />
                   </div>
                </div>
              )}
              
              <button onClick={fetchStrategicInsight} className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                 Generate New Strategy <RefreshCw size={14} className={isLoadingInsight ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, trend, active, onClick, color, icon }: any) => (
  <button 
    onClick={onClick}
    className={`p-8 rounded-[3rem] border transition-all duration-500 text-left relative overflow-hidden group ${active ? 'bg-white dark:bg-slate-900 border-brand shadow-2xl shadow-brand/10' : 'bg-surface dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm opacity-60 hover:opacity-100 hover:scale-[1.02]'}`}
  >
    <div className={`p-4 rounded-2xl mb-8 w-fit transition-transform group-hover:scale-110 group-hover:rotate-6 ${active ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
       {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="flex items-end justify-between">
       <div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
         <h3 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white tracking-tighter leading-none">{value}</h3>
       </div>
       <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
         {trend}
       </span>
    </div>
    {active && <div className="absolute bottom-0 left-0 h-1.5 bg-brand w-full"></div>}
  </button>
);

const ChartHub = ({ title, subtitle, icon, children }: any) => (
  <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm relative group">
    <div className="flex items-center justify-between mb-10">
       <div className="flex items-center gap-4">
         <div className="p-3 bg-brand/10 text-brand rounded-2xl group-hover:scale-110 transition-transform">
           {React.cloneElement(icon, { size: 22 })}
         </div>
         <div>
           <h4 className="text-2xl font-bold font-outfit leading-none tracking-tighter">{title}</h4>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{subtitle}</p>
         </div>
       </div>
    </div>
    {children}
  </div>
);

const ActionStep = ({ icon, label, detail }: any) => (
  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-brand/20 transition-all cursor-default">
    <div className="mt-1 text-brand">{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{detail}</p>
    </div>
  </div>
);

export default Analytics;
