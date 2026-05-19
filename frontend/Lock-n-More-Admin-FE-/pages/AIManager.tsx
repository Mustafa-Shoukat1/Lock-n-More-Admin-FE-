
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Save, RotateCcw, Zap, Target, Heart, ShieldCheck, AlignLeft, RefreshCw, ChevronRight, Sparkles, Info, MessageCircle, BarChart2, ShieldAlert, Cpu, Layers, Fingerprint, SearchCheck, Activity, Globe, Database, Terminal } from 'lucide-react';
import { useApp, SafeText } from '../App';
import { gemini } from '../services/gemini';
import { api } from '../services/api';
import FollowupSettings from '../components/FollowupSettings';

const AIManager: React.FC = () => {
  const { aiSettings, setAiSettings, setNotifications } = useApp();
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const personalities = [
    { id: 'professional', label: 'Eminent', icon: <ShieldCheck size={22}/>, desc: 'Corporate, precise logic. Formal and authoritative.' },
    { id: 'helpful', label: 'Curator', icon: <Heart size={22}/>, desc: 'Nurturing, warm conversationalist. High trust.' },
    { id: 'aggressive', label: 'CLOSER', icon: <Target size={22}/>, desc: 'Urgent, sales-driven. Maximizes lead capture.' },
    { id: 'passive', label: 'Observer', icon: <SearchCheck size={22}/>, desc: 'Brief, efficient, data-only responses.' },
    { id: 'witty', label: 'Spark', icon: <Sparkles size={22}/>, desc: 'Humorous, emoji-rich, and engaging for social signals.' },
    { id: 'detective', label: 'Inspector', icon: <Fingerprint size={22}/>, desc: 'Analytical, probing questions to qualify leads deeply.' },
  ];

  const [isSaving, setIsSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    const session = api.getStoredSession();
    if (!session?.token) return;
    api.fetchAiSettings(session.token).then((res: any) => {
      if (res && res.length > 0) {
        const s = res[0];
        setSettingsId(s.id);
        setAiSettings({
          ...aiSettings,
          personality: s.personality || aiSettings.personality,
          tone: s.tone || aiSettings.tone,
          responseLength: s.response_length ?? aiSettings.responseLength,
          creativity: s.creativity ?? aiSettings.creativity,
        });
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const session = api.getStoredSession();
      if (session?.token && settingsId) {
        await api.updateAiSettings(session.token, settingsId, {
          personality: aiSettings.personality,
          tone: aiSettings.tone,
          response_length: aiSettings.responseLength,
          creativity: aiSettings.creativity,
        });
      }
      setNotifications(prev => [{ 
        id: Date.now(), 
        title: 'Cognitive Sync Successful', 
        message: `TOTO Perimeter updated: ${aiSettings.personality.toUpperCase()} personality active.`, 
        type: 'system', 
        time: 'Just now', 
        read: false 
      }, ...prev]);
    } catch {
      alert('Failed to save AI settings to backend.');
    } finally {
      setIsSaving(false);
    }
  };

  const runTest = async () => {
    if (!testInput.trim()) return;
    setIsSimulating(true);
    setTestOutput('');
    try {
      const context = `Personality: ${aiSettings.personality}, Tone: ${aiSettings.tone}, Response Level: ${aiSettings.responseLength}%. Domain: Smart Lock Sales.`;
      const response = await gemini.getAiResponseSuggestion(context, testInput);
      setTestOutput(response);
    } catch (e) {
      setTestOutput("Node Failure: AI backend unavailable.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-4 sm:p-12 space-y-12 max-w-7xl mx-auto pb-32 animate-in fade-in duration-500">
      {/* Header Hub */}
      <div className="bg-slate-900 p-10 sm:p-14 rounded-[3.5rem] text-white border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-end gap-10 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none text-brand">
          <BrainCircuit size={300} />
        </div>
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand/10 border border-brand/20 rounded-full">
            <Layers size={16} className="text-brand" />
            <span className="text-[11px] font-black text-brand uppercase tracking-[0.2em]">TOTO Cognitive Node</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-outfit tracking-tighter leading-none">AI Management Hub</h1>
          <p className="text-slate-400 max-w-xl font-medium text-lg leading-relaxed text-left">Calibrate linguistic reasoning archetypes and behavior matrices for automated sales signals across WhatsApp, IG, and TikTok.</p>
        </div>
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <button onClick={handleSave} disabled={isSaving} className="flex-1 px-12 py-5 bg-brand text-white text-[11px] font-black uppercase tracking-widest rounded-[2rem] flex items-center justify-center gap-4 shadow-2xl shadow-brand/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
            {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />} {isSaving ? 'Deploying...' : 'Deploy Intelligence'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
        <div className="lg:col-span-2 space-y-12">
          
          <div className="bg-white dark:bg-slate-900 p-10 sm:p-14 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter">Personality Matrix</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Core behavior archetype selection</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {personalities.map((p) => (
                <button 
                  key={p.id} onClick={() => setAiSettings({...aiSettings, personality: p.id as any})}
                  className={`p-8 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden ${aiSettings.personality === p.id ? 'border-brand bg-brand/5 shadow-xl' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-950'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${aiSettings.personality === p.id ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>{p.icon}</div>
                  <p className="text-sm font-black uppercase tracking-widest">{p.label}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-bold leading-tight">{p.desc}</p>
                  {aiSettings.personality === p.id && <div className="absolute top-4 right-4 text-brand"><Zap size={12} fill="currentColor"/></div>}
                </button>
              ))}
            </div>

            <div className="space-y-12 pt-14 border-t border-slate-100 dark:border-slate-800 mt-14">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <SliderControl label="Response Density" value={aiSettings.responseLength} onChange={(v: number) => setAiSettings({...aiSettings, responseLength: v})} icon={<AlignLeft size={18}/>} desc="Increased token limit for verbose explanations." />
                <SliderControl label="Creativity Core" value={aiSettings.creativity} onChange={(v: number) => setAiSettings({...aiSettings, creativity: v})} icon={<Sparkles size={18}/>} desc="Randomness variance in vocabulary and style." />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-10 sm:p-14 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-inner grid grid-cols-1 md:grid-cols-3 gap-8">
             <StatusCard label="Token Integrity" value="High" icon={<Database size={18} className="text-emerald-500"/>} />
             <StatusCard label="Knowledge Sync" value="Verified" icon={<Globe size={18} className="text-brand"/>} />
             <StatusCard label="API Latency" value="214ms" icon={<Activity size={18} className="text-purple-500"/>} />
          </div>
        </div>

        {/* LOGIC TERMINAL */}
        <div className="bg-slate-950 p-12 rounded-[4rem] text-white flex flex-col min-h-[600px] border border-slate-800 shadow-2xl sticky top-28 transition-all hover:border-brand/30">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-xl font-bold font-outfit tracking-tighter uppercase flex items-center gap-3"><Terminal size={28} className="text-brand" /> Logic Terminal</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Authorized Simulation Suite</p>
            </div>
            <button onClick={() => {setTestOutput(''); setTestInput('');}} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all shadow-inner"><RotateCcw size={20}/></button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto mb-10 pr-2 scrollbar-none text-left">
            {isSimulating ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <RefreshCw size={40} className="animate-spin text-brand" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Synthesizing Logic...</p>
              </div>
            ) : testOutput ? (
              <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                <div className="p-6 bg-white/5 border-l-4 border-brand rounded-r-[2rem] shadow-sm">
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Customer Signal</p>
                   <p className="text-sm text-slate-300 italic font-medium leading-relaxed">"{testInput}"</p>
                </div>
                <div className="p-8 bg-brand/10 border border-brand/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  <p className="text-[10px] font-black uppercase text-brand tracking-[0.3em] mb-6 flex items-center gap-2"><Cpu size={14}/> TOTO Cognitive Logic</p>
                  <p className="text-base font-medium leading-relaxed italic text-slate-100">
                    <SafeText text={testOutput} />
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-6">
                <BarChart2 size={80} className="text-slate-400" />
                <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-400 text-center">Awaiting Simulation Signal Injection...</p>
              </div>
            )}
          </div>

          <div className="relative">
            <input 
              value={testInput} 
              onChange={(e) => setTestInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && runTest()}
              placeholder="Inject customer message signal..." 
              className="w-full pl-8 pr-20 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] text-sm outline-none focus:border-brand/50 font-bold transition-all shadow-inner placeholder-slate-700" 
            />
            <button 
              onClick={runTest} 
              disabled={isSimulating || !testInput}
              className="absolute right-3 top-3 p-4 bg-brand text-white rounded-[1.5rem] shadow-xl shadow-brand/40 disabled:opacity-20 hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Follow-up Automation Section */}
      <FollowupSettings />
    </div>
  );
};

const SliderControl = ({ label, value, onChange, icon, desc }: any) => (
  <div className="space-y-8 p-8 bg-slate-50 dark:bg-slate-950/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 transition-all hover:border-brand/20 shadow-inner">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] flex items-center gap-3">{icon} {label}</label>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{desc}</p>
      </div>
      <span className="text-2xl font-black font-outfit text-brand">{value}%</span>
    </div>
    <input 
      type="range" 
      value={value} 
      min="1"
      max="100"
      onChange={(e) => onChange(Number(e.target.value))} 
      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none accent-brand cursor-pointer outline-none shadow-inner" 
    />
  </div>
);

const StatusCard = ({ label, value, icon }: any) => (
  <div className="p-6 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
     <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">{icon}</div>
     <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-base font-bold text-slate-900 dark:text-white font-outfit">{value}</p>
     </div>
  </div>
);

export default AIManager;
