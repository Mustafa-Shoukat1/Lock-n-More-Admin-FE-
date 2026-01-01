import React, { useState } from 'react';
import { BrainCircuit, Save, RotateCcw, Zap, Target, Heart, ShieldCheck, AlignLeft, RefreshCw, ChevronRight, Sparkles, Info, MessageCircle, BarChart2 } from 'lucide-react';
import { useApp } from '../App';
import { gemini } from '../services/gemini';

const AIManager: React.FC = () => {
  const { aiSettings, setAiSettings, setNotifications } = useApp();
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const personalities = [
    { id: 'professional', label: 'Eminent', icon: <ShieldCheck size={22}/>, desc: 'Corporate, precise logic. Formal and authoritative.' },
    { id: 'helpful', label: 'Curator', icon: <Heart size={22}/>, desc: 'Nurturing, warm conversationalist. High trust.' },
    { id: 'aggressive', label: 'Closer', icon: <Target size={22}/>, desc: 'Urgent, sales-driven. Maximizes lead capture.' },
  ];

  const handleSave = () => {
    setNotifications(prev => [{ 
      id: Date.now(), 
      title: 'AI Logic Deployed', 
      message: `TOTO Perimeter updated: ${aiSettings.personality.toUpperCase()} personality active.`, 
      type: 'system', 
      time: 'Just now', 
      read: false 
    }, ...prev]);
    alert("TOTO Cognitive Core Synchronized.");
  };

  const runTest = async () => {
    if (!testInput.trim()) return;
    setIsSimulating(true);
    setTestOutput('');
    try {
      const context = `Personality: ${aiSettings.personality}, Tone: ${aiSettings.tone}, Response Level: ${aiSettings.responseLength}%. Specializing in TOTO Smart Locks.`;
      const response = await gemini.getAiResponseSuggestion(context, testInput);
      setTestOutput(response);
    } catch (e) {
      setTestOutput("Simulated Error: Perimeter logic disconnected.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto pb-32">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-brand">
          <BrainCircuit size={200} />
        </div>
        <div className="space-y-3 relative z-10">
          <h1 className="text-4xl font-bold font-outfit flex items-center gap-4 tracking-tighter"><BrainCircuit size={40} className="text-brand" /> Cognitive Core</h1>
          <p className="text-slate-500 max-w-lg font-medium">Calibrate the linguistic reasoning nodes for automated sales threads.</p>
        </div>
        <button onClick={handleSave} className="relative z-10 px-10 py-4 bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3 shadow-xl shadow-brand/20 hover:scale-105 transition-all">
          <Save size={18} /> Deploy Intelligence
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12 bg-white dark:bg-slate-950 p-8 sm:p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter">Personality Matrix</h3>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400"><Info size={16}/></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {personalities.map((p) => (
              <button 
                key={p.id} onClick={() => setAiSettings({...aiSettings, personality: p.id as any})}
                className={`p-8 rounded-[2.5rem] border-2 text-left space-y-6 transition-all group ${aiSettings.personality === p.id ? 'border-brand bg-brand/5' : 'border-slate-100 dark:border-slate-900 hover:border-slate-200'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${aiSettings.personality === p.id ? 'bg-brand text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>{p.icon}</div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest">{p.label}</p>
                  <p className="text-[11px] text-slate-500 mt-2 font-bold leading-relaxed">{p.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-12 pt-12 border-t border-slate-100 dark:border-slate-900">
            {/* Tone Dropdown - New Functional Control */}
            <div className="space-y-4">
               <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2"><MessageCircle size={16}/> Linguistic Tone</label>
               <select 
                 value={aiSettings.tone}
                 onChange={(e) => setAiSettings({...aiSettings, tone: e.target.value as any})}
                 className="w-full p-5 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand appearance-none"
               >
                 <option value="formal">Formal & Corporate</option>
                 <option value="casual">Casual & Friendly</option>
                 <option value="urgent">Urgent & Sales-Focused</option>
                 <option value="empathetic">Empathetic & Nurturing</option>
               </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <SliderBox 
                label="Response Length" 
                value={aiSettings.responseLength} 
                onChange={(v) => setAiSettings({...aiSettings, responseLength: v})} 
                icon={<AlignLeft size={16}/>} 
                desc="Controls token density per response."
              />
              <SliderBox 
                label="Creativity Variance" 
                value={aiSettings.creativity} 
                onChange={(v) => setAiSettings({...aiSettings, creativity: v})} 
                icon={<Sparkles size={16}/>} 
                desc="Adjusts vocabulary fluidity."
              />
            </div>
          </div>
        </div>

        {/* Logic Terminal */}
        <div className="bg-slate-950 p-10 rounded-[4rem] text-white flex flex-col min-h-[600px] border border-slate-800 shadow-2xl sticky top-28">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold font-outfit tracking-tighter uppercase flex items-center gap-3"><Zap size={24} className="text-brand" /> Simulation</h3>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Real-time Logic Test</p>
            </div>
            <button onClick={() => {setTestOutput(''); setTestInput('');}} className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><RotateCcw size={18}/></button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto mb-8 pr-2 scrollbar-none">
            {isSimulating ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
                <RefreshCw size={32} className="animate-spin text-brand" />
                <p className="text-[10px] font-black uppercase tracking-widest">Generating Cognition...</p>
              </div>
            ) : testOutput ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="p-4 bg-white/5 border-l-2 border-brand rounded-r-2xl">
                   <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Prompt</p>
                   <p className="text-xs text-slate-400 italic">"{testInput}"</p>
                </div>
                <div className="p-8 bg-brand/10 border border-brand/20 rounded-[2.5rem]">
                  <p className="text-[10px] font-black uppercase text-brand mb-4">TOTO Output</p>
                  <p className="text-sm font-medium leading-relaxed italic text-slate-200">"{testOutput}"</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4">
                <BarChart2 size={60} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Simulation Node...</p>
              </div>
            )}
          </div>

          <div className="relative">
            <input 
              value={testInput} 
              onChange={(e) => setTestInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && runTest()}
              placeholder="Test customer message..." 
              className="w-full pl-6 pr-16 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-sm outline-none focus:border-brand/50 font-medium" 
            />
            <button 
              onClick={runTest} 
              disabled={isSimulating || !testInput}
              className="absolute right-2 top-2 p-3 bg-brand text-white rounded-2xl disabled:opacity-30 hover:scale-105 active:scale-95 transition-all"
            >
              {isSimulating ? <RefreshCw size={20} className="animate-spin" /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SliderBox = ({ label, value, onChange, icon, desc }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-3">{icon} {label}</label>
        <p className="text-[9px] text-slate-400 font-medium mt-1">{desc}</p>
      </div>
      <span className="text-base font-black font-outfit text-brand">{value}%</span>
    </div>
    <input 
      type="range" 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))} 
      className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full appearance-none accent-brand cursor-pointer outline-none" 
    />
  </div>
);

export default AIManager;