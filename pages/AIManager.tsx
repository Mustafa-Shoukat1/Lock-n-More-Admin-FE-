import React, { useState } from 'react';
import { BrainCircuit, Save, RotateCcw, Zap, Target, Heart, ShieldCheck, AlignLeft, BarChart2, CheckCircle, RefreshCw, Send, ChevronRight, TextQuote } from 'lucide-react';
import { useApp } from '../App';
import { gemini } from '../services/gemini';

const AIManager: React.FC = () => {
  const { aiSettings, setAiSettings, setNotifications } = useApp();
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const personalities = [
    { id: 'professional', label: 'Eminent', icon: <ShieldCheck size={22}/>, desc: 'Corporate, precise logic node.' },
    { id: 'helpful', label: 'Curator', icon: <Heart size={22}/>, desc: 'Nurturing, warm conversationalist.' },
    { id: 'aggressive', label: 'Closer', icon: <Target size={22}/>, desc: 'High urgency, conversion focused.' },
  ];

  const handleSave = () => {
    setNotifications(prev => [{ id: Date.now(), title: 'Logic Deployed', message: 'Ecosystem re-calibrated successfully.', type: 'system', time: 'Just now', read: false }, ...prev]);
    alert("Node settings pushed.");
  };

  const runTest = async () => {
    if (!testInput.trim()) return;
    setIsSimulating(true);
    setTestOutput('Reasoning...');
    try {
      const context = `Personality: ${aiSettings.personality}, Density: ${aiSettings.responseLength}%`;
      const response = await gemini.getAiResponseSuggestion(context, testInput);
      setTestOutput(response);
    } catch (e) {
      setTestOutput("Node offline. Check API connectivity.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto pb-32">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold font-outfit flex items-center gap-4 tracking-tighter"><BrainCircuit size={40} className="text-brand" /> AI Sales Engine</h1>
          <p className="text-slate-500 max-w-md">Configure the linguistic core of your autonomous sales perimeter nodes.</p>
        </div>
        <button onClick={handleSave} className="px-10 py-4 bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3">
          <Save size={18} /> Deploy Intelligence
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12 bg-white dark:bg-slate-950 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800">
          <h3 className="text-2xl font-bold font-outfit uppercase">Persona Matrix</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {personalities.map((p) => (
              <button 
                key={p.id} onClick={() => setAiSettings({...aiSettings, personality: p.id as any})}
                className={`p-8 rounded-[2rem] border-2 text-left space-y-6 ${aiSettings.personality === p.id ? 'border-brand bg-brand/5' : 'border-slate-100 dark:border-slate-900'}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${aiSettings.personality === p.id ? 'bg-brand text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>{p.icon}</div>
                <div>
                  <p className="text-sm font-black uppercase">{p.label}</p>
                  <p className="text-[11px] text-slate-500 mt-2 font-bold leading-relaxed">{p.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-10 pt-10 border-t border-slate-100 dark:border-slate-900">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <SliderBox label="Density" value={aiSettings.responseLength} onChange={(v) => setAiSettings({...aiSettings, responseLength: v})} icon={<AlignLeft size={16}/>} />
              <SliderBox label="Fluidity" value={aiSettings.creativity} onChange={(v) => setAiSettings({...aiSettings, creativity: v})} icon={<Zap size={16}/>} />
            </div>
          </div>
        </div>

        {/* AI Playground */}
        <div className="bg-slate-950 p-10 rounded-[3.5rem] text-white flex flex-col min-h-[600px] border border-slate-800">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold font-outfit flex items-center gap-3 tracking-tighter"><Zap size={24} className="text-brand" /> Testing Terminal</h3>
            <button onClick={() => {setTestOutput(''); setTestInput('');}} className="p-2.5 bg-white/5 rounded-xl text-slate-500"><RotateCcw size={18}/></button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto mb-8 pr-2">
            {testOutput ? (
              <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                <p className="text-[10px] font-black uppercase text-brand tracking-widest mb-4">Node Response</p>
                <p className="text-base font-medium text-slate-100 leading-relaxed italic">"{testOutput}"</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-6">
                <TextQuote size={60} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Input...</p>
              </div>
            )}
          </div>

          <div className="relative">
            <input 
              value={testInput} 
              onChange={(e) => setTestInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && runTest()}
              placeholder="Simulate inquiry..." 
              className="w-full pl-6 pr-20 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-sm outline-none focus:border-brand/50" 
            />
            <button 
              onClick={runTest} 
              disabled={isSimulating || !testInput}
              className="absolute right-2 top-2 p-3 bg-brand text-white rounded-2xl disabled:opacity-30"
            >
              {isSimulating ? <RefreshCw size={20} className="animate-spin" /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SliderBox = ({ label, value, onChange, icon }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">{icon} {label}</label>
      <span className="text-sm font-black font-outfit text-brand">{value}%</span>
    </div>
    <input type="range" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full appearance-none accent-brand cursor-pointer" />
  </div>
);

export default AIManager;