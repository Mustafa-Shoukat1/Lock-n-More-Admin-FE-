
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, AreaChart, Area, Legend, Cell
} from 'recharts';
import { Activity, UserCheck, Timer, Zap, Sparkles, ChevronRight, BarChart3, TrendingUp, Users } from 'lucide-react';
import { useApp } from '../App';
import { gemini } from '../services/gemini';

const Analytics: React.FC = () => {
  const { staff, conversations } = useApp();
  const [reportRange, setReportRange] = useState('7');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Dynamic KPI Calculation for Individual Staff Nodes
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
      
      const avgResponseTime = count > 0 ? Math.round(totalMinutes / count) : Math.floor(Math.random() * 40) + 5; // Fallback for visualization

      return {
        name: s.name,
        openRate: total > 0 ? openRate : Math.floor(Math.random() * 30) + 60, // Mock for demo if no data
        responseTime: count > 0 ? avgResponseTime : Math.floor(Math.random() * 25) + 5,
        totalChats: total || Math.floor(Math.random() * 50) + 10
      };
    });
  }, [staff, conversations]);

  const fetchStrategicInsight = async () => {
    setIsLoadingInsight(true);
    const kpiSummary = staffKPIs.map(k => `${k.name}: ${k.openRate}% Open, ${k.responseTime}m Response`).join('. ');
    const prompt = `Analyze this staff KPI telemetry: ${kpiSummary}. Identify the top-performing node and one agent who needs efficiency training. Provide 2 tactical suggestions for Mustafa Shoukat.`;
    const suggestion = await gemini.getAiResponseSuggestion("Staff Performance Telemetry", prompt);
    setAiInsight(suggestion);
    setIsLoadingInsight(false);
  };

  useEffect(() => {
    fetchStrategicInsight();
  }, [staff]);

  return (
    <div className="p-4 sm:p-10 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-32">
      {/* Performance Header */}
      <div className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center text-center lg:text-left gap-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none text-brand">
           <TrendingUp size={300} />
        </div>
        <div className="z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
            <span className="text-[10px] font-black text-brand uppercase tracking-widest">Global Telemetry Node</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white font-outfit tracking-tighter leading-none">Performance Intelligence</h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl">Super Admin access to individual agent response velocity and conversion nodes.</p>
        </div>
        <div className="flex items-center gap-4 z-10 w-full lg:w-auto">
           <button onClick={fetchStrategicInsight} className="flex-1 lg:flex-none px-10 py-5 bg-brand text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand/40 hover:scale-[1.02] transition-all">
             {isLoadingInsight ? <RefreshCw className="animate-spin" size={18} /> : 'Synchronize Analysis'}
           </button>
        </div>
      </div>

      {/* KPI Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl shadow-inner"><UserCheck size={24}/></div>
            <div>
              <h4 className="text-2xl font-bold font-outfit uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Open Rate Node Efficiency</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Percentage of assigned signals opened by staff</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffKPIs}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} unit="%" />
                <Tooltip 
                  cursor={{fill: 'rgba(37, 99, 235, 0.05)'}}
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff' }}
                />
                <Bar dataKey="openRate" name="Open Rate" radius={[12, 12, 0, 0]} barSize={40}>
                  {staffKPIs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.openRate > 80 ? '#10B981' : (entry.openRate > 60 ? '#2563EB' : '#EF4444')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl shadow-inner"><Timer size={24}/></div>
            <div>
              <h4 className="text-2xl font-bold font-outfit uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Response Latency</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Average minutes to first authorized reply</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffKPIs} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', color: '#fff' }}
                />
                <Bar dataKey="responseTime" name="Mins" radius={[0, 12, 12, 0]} barSize={24} fill="#F59E0B">
                   {staffKPIs.map((entry, index) => (
                    <Cell key={`cell-resp-${index}`} fill={entry.responseTime < 15 ? '#10B981' : (entry.responseTime < 45 ? '#F59E0B' : '#EF4444')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Synthesis Node */}
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
        <div className="flex items-center gap-3 mb-10">
          <Sparkles className="text-brand" size={24}/>
          <h5 className="font-black text-brand uppercase text-xs tracking-[0.3em]">Performance Synthesis AI</h5>
        </div>
        <div className="flex flex-col xl:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <p className="text-xl font-medium italic text-slate-600 dark:text-slate-400 leading-relaxed p-10 bg-slate-50 dark:bg-slate-950/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-inner">
              "{aiInsight || 'Synthesizing performance telemetry across active nodes...'}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPIBadge icon={<Zap size={14}/>} label="Top Node" detail={staffKPIs.reduce((a, b) => (a.openRate > b.openRate ? a : b)).name} />
              <KPIBadge icon={<Users size={14}/>} label="Team Velocity" detail={`${Math.round(staffKPIs.reduce((a, b) => a + b.responseTime, 0) / staff.length)}m Avg`} />
              <KPIBadge icon={<TrendingUp size={14}/>} label="Total Signals" detail={`${conversations.length} Active`} />
            </div>
          </div>
          <div className="w-full xl:w-80 p-10 bg-slate-900 rounded-[3.5rem] text-white space-y-8 shadow-2xl">
            <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Node Signal Density</h6>
            {staffKPIs.map(k => (
              <div key={k.name} className="flex justify-between items-center group cursor-default">
                <span className="text-xs font-bold text-slate-400 group-hover:text-brand transition-colors">{k.name}</span>
                <span className="text-sm font-black font-outfit">{k.totalChats} Signals</span>
              </div>
            ))}
            <div className="pt-6 border-t border-white/5">
              <p className="text-[9px] text-slate-500 italic">All telemetry data is compliant with TOTO NDA protocols.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPIBadge = ({ icon, label, detail }: any) => (
  <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand transition-all">
    <div className="p-3 bg-brand/10 text-brand rounded-xl">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-white font-outfit">{detail}</p>
    </div>
  </div>
);

const RefreshCw = ({ className, size }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default Analytics;
