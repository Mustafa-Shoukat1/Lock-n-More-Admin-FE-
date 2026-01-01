import React, { useState } from 'react';
import { BrainCircuit, Save, RotateCcw, Zap, Target, Heart, ShieldCheck, AlignLeft, BarChart2, CheckCircle, RefreshCw, Send, ChevronRight, TextQuote, Sparkles, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../App';
import { gemini } from '../services/gemini';

const AIManager: React.FC = () => {
  const { aiSettings, setAiSettings, setNotifications } = useApp();
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const personalities = [
    { id: 'professional', label: 'Eminent', icon: <ShieldCheck size={22}/>, desc: 'Corporate, precise logic. Best for enterprise inquiries.' },
    { id: 'helpful', label: 'Curator', icon: <Heart size={22}/>, desc: 'Nurturing, warm conversationalist. High trust building.' },
    { id: 'aggressive', label: 'Closer', icon: <Target size={22}/>, desc: 'Urgent, sales-focused logic. Maximizes lead capture.' },
  ];

  const handleSave = () => {
    setNotifications(prev => [{ 
      id: Date.now(), 
      title: 'TOTO Node Updated', 
      message: `System re-calibrated to '${aiSettings.personality.toUpperCase()}' persona with ${aiSettings.responseLength}% density.`, 
      type: 'system', 
      time: 'Just now', 
      read: false 
    }, ...prev]);
    alert("AI Logic Pushed to Edge Nodes.");
  };

  const runTest = async () => {
    if (!testInput.trim()) return;
    setIsSimulating(true);
    setTestOutput('');
    try {
      const context = `Personality: ${aiSettings.personality}, Density: ${aiSettings.responseLength}%, Fluidity: ${aiSettings.creativity}%. 
      Respond as an AI sales assistant for 'Locks & More' a digital door lock specialist.`;
      const response = await gemini.getAiResponseSuggestion(context, testInput);
      setTestOutput(response);
    } catch (e) {
      setTestOutput("Terminal Error: Check Gemini API availability in system perimeter.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto pb-32">
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <BrainCircuit size={200} className="text-brand" />
        </div>
        <div className="space-y-3 relative z-10">
          <h1 className="text-4xl font-bold font-outfit flex items-center gap-4 tracking-tighter"><BrainCircuit size={40} className="text-brand" /> Cognitive Core</h1>
          <p className="text-slate-500 max-w-lg font-medium">Fine-tune the linguistic reasoning of your autonomous TOTO sales nodes.</p>
        </div>
        <button onClick={handleSave} className="relative z-10 px-10 py-4 bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3 shadow-xl shadow-brand/20 hover:scale-105 transition-all">
          <Save size={18} /> Deploy Logic
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12 bg-white dark:bg-slate-950 p-8 sm:p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter">Persona Matrix</h3>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400" title="AI Personality Selection">
              <Info size={16}/>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {personalities.map((p) => (
              <button 
                key={p.id} onClick={() => setAiSettings({...aiSettings, personality: p.id as any})}
                className={`p-8 rounded-[2.5rem] border-2 text-left space-y-6 transition-all group ${aiSettings.personality === p.id ? 'border-brand bg-brand/5 shadow-lg shadow-brand/5' : 'border-slate-100 dark:border-slate-900 hover:border-slate-200'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${aiSettings.personality === p.id ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>{p.icon}</div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest">{p.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-bold leading-relaxed">{p.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-12 pt-12 border-t border-slate-100 dark:border-slate-900">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <SliderBox 
                  label="Response Density" 
                  value={aiSettings.responseLength} 
                  onChange={(v) => setAiSettings({...aiSettings, responseLength: v})} 
                  icon={<AlignLeft size={16}/>} 
                  desc="Controls word count and detail depth."
                />
                <SliderBox 
                  label="Context Fluidity" 
                  value={aiSettings.creativity} 
                  onChange={(v) => setAiSettings({...aiSettings, creativity: v})} 
                  icon={<Sparkles size={16}/>} 
                  desc="Varies vocabulary and persona flair."
                />
             </div>
             
             <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                <div className="p-2 bg-brand/10 text-brand rounded-xl">
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <p className="text-xs font-bold mb-1">Safety Constraints Active</p>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed">System automatically filters out toxic signals and maintains brand-safe sales corridors across all platforms.</p>
                </div>
             </div>
          </div>
        </div>

        {/* AI Playground Terminal */}
        <div className="bg-slate-950 p-8 sm:p-10 rounded-[4rem] text-white flex flex-col min-h-[650px] border border-slate-800 shadow-2xl relative group">
          <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[4rem] pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-bold font-outfit flex items-center gap-3 tracking-tighter"><Zap size={24} className="text-brand" /> Logic Terminal</h3>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Simulate Real-time Signals</p>
            </div>
            <button onClick={() => {setTestOutput(''); setTestInput('');}} className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><RotateCcw size={18}/></button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto mb-8 pr-2 relative z-10 scrollbar-none">
            {isSimulating ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-white/5 rounded-full w-3/4"></div>
                <div className="h-4 bg-white/5 rounded-full w-1/2"></div>
                <div className="h-4 bg-white/5 rounded-full w-5/6"></div>
              </div>
            ) : testOutput ? (
              <div className="space-y-6">
                <div className="p-4 bg-white/5 border-l-2 border-brand rounded-r-2xl">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Simulated Prompt</p>
                   <p className="text-xs text-slate-400 font-medium italic">"{testInput}"</p>
                </div>
                <div className="p-8 bg-brand/10 border border-brand/20 rounded-[2.5rem] shadow-xl shadow-brand/10">
                  <p className="text-[10px] font-black uppercase text-brand tracking-widest mb-4 flex items-center gap-2"><Sparkles size={12}/> TOTO Cognition</p>
                  <p className="text-base font-medium text-slate-100 leading-relaxed italic">"{testOutput}"</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-6">
                <TextQuote size={60} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Ready for testing...</p>
              </div>
            )}
          </div>

          <div className="relative z-10">
            <input 
              value={testInput} 
              onChange={(e) => setTestInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && runTest()}
              placeholder="Type customer query..." 
              className="w-full pl-6 pr-20 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-sm outline-none focus:border-brand/50 transition-all font-medium" 
            />
            <button 
              onClick={runTest} 
              disabled={isSimulating || !testInput}
              className="absolute right-2 top-2 p-3 bg-brand text-white rounded-2xl disabled:opacity-30 hover:scale-105 transition-all shadow-xl shadow-brand/30"
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
    <div className="relative pt-1">
      <input 
        type="range" 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))} 
        className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full appearance-none accent-brand cursor-pointer outline-none" 
      />
    </div>
  </div>
);

export default AIManager;