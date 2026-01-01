
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, AreaChart, Area, Legend, Cell
} from 'recharts';
import { Activity, UserCheck, Timer, Zap, Sparkles, ChevronRight, BarChart3 } from 'lucide-react';
import { useApp } from '../App';
import { gemini } from '../services/gemini';

const Analytics: React.FC = () => {
  const { staff, conversations } = useApp();
  const [reportRange, setReportRange] = useState('7');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // High-fidelity KPI Data Calculation
  const staffKPIs = useMemo(() => {
    return staff.map(s => {
      const assignedToStaff = conversations.filter(c => c.assignedStaff === s.name);
      const opened = assignedToStaff.filter(c => c.isOpenedByStaff).length;
      const total = assignedToStaff.length;
      
      const openRate = total > 0 ? Math.round((opened / total) * 100) : 0;
      
      // Calculate Avg Response Time in Minutes
      let totalMinutes = 0;
      let count = 0;
      assignedToStaff.forEach(c => {
        if (c.assignedAt && c.firstResponseAt) {
          const start = new Date(c.assignedAt).getTime();
          const end = new Date(c.firstResponseAt).getTime();
          totalMinutes += (end - start) / 60000;
          count++;
        }
      });
      
      const avgResponseTime = count > 0 ? Math.round(totalMinutes / count) : 0;

      return {
        name: s.name,
        openRate,
        responseTime: avgResponseTime,
        totalChats: total
      };
    });
  }, [staff, conversations]);

  const fetchStrategicInsight = async () => {
    setIsLoadingInsight(true);
    const kpiSummary = staffKPIs.map(k => `${k.name}: ${k.openRate}% Open, ${k.responseTime}m Response`).join('. ');
    const prompt = `Analyze this staff KPI data for the administrator: ${kpiSummary}. Identify the top performer and one bottleneck. Keep it professional.`;
    const suggestion = await gemini.getAiResponseSuggestion("Staff Performance Context", prompt);
    setAiInsight(suggestion);
    setIsLoadingInsight(false);
  };

  useEffect(() => {
    fetchStrategicInsight();
  }, [staffKPIs]);

  return (
    <div className="p-4 sm:p-10 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-32">
      {/* Header Panel */}
      <div className="bg-slate-900 p-10 rounded-[4rem] border border-slate-800 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center text-center lg:text-left gap-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none text-brand">
           <BarChart3 size={300} />
        </div>
        <div className="z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
            <span className="text-[10px] font-black text-brand uppercase tracking-widest">Performance Intelligence</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white font-outfit tracking-tighter leading-none">Staff KPI Tracker</h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl">Granular analysis of individual response velocity and engagement nodes.</p>
        </div>
        <div className="flex items-center gap-4 z-10 w-full lg:w-auto">
           <button onClick={fetchStrategicInsight} className="flex-1 lg:flex-none px-10 py-5 bg-brand text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand/40 hover:scale-[1.02] transition-all">
             {isLoadingInsight ? <RefreshCw className="animate-spin" size={18} /> : 'Refresh Signal'}
           </button>
        </div>
      </div>

      {/* KPI Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Open Rate Chart */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl"><UserCheck size={24}/></div>
            <div>
              <h4 className="text-2xl font-bold font-outfit uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Staff Open Rates</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Engagement node efficiency (%)</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffKPIs}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}} unit="%" />
                <Tooltip 
                  cursor={{fill: 'rgba(37, 99, 235, 0.05)'}}
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff' }}
                />
                <Bar dataKey="openRate" name="Open Rate" radius={[10, 10, 0, 0]} barSize={40}>
                  {staffKPIs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.openRate > 80 ? '#10B981' : (entry.openRate > 50 ? '#2563EB' : '#EF4444')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl"><Timer size={24}/></div>
            <div>
              <h4 className="text-2xl font-bold font-outfit uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Response Velocity</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Avg first reply latency (minutes)</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffKPIs} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff' }}
                />
                <Bar dataKey="responseTime" name="Mins" radius={[0, 10, 10, 0]} barSize={24} fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strategic AI Summary */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="text-brand" size={20}/>
          <h5 className="font-black text-brand uppercase text-[10px] tracking-[0.2em]">Staff Performance Synthesis</h5>
        </div>
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <p className="text-xl font-medium italic text-slate-600 dark:text-slate-400 leading-relaxed p-8 bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
              "{aiInsight || 'Synthesizing performance telemetry...'}"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PerformanceStep icon={<Zap size={14}/>} label="Top Performer" detail={staffKPIs.reduce((a, b) => (a.openRate > b.openRate ? a : b)).name} />
              <PerformanceStep icon={<Activity size={14}/>} label="Avg System Latency" detail={`${Math.round(staffKPIs.reduce((a, b) => a + b.responseTime, 0) / staff.length)} minutes`} />
            </div>
          </div>
          <div className="w-full lg:w-72 p-8 bg-slate-900 rounded-[3rem] text-white space-y-6">
            <h6 className="text-xs font-black uppercase tracking-widest text-slate-500">Node Totals</h6>
            {staffKPIs.map(k => (
              <div key={k.name} className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400">{k.name}</span>
                <span className="text-sm font-black font-outfit">{k.totalChats} Signals</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PerformanceStep = ({ icon, label, detail }: any) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
    <div className="p-2 bg-brand/10 text-brand rounded-lg">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{detail}</p>
    </div>
  </div>
);

const RefreshCw = ({ className, size }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default Analytics;
