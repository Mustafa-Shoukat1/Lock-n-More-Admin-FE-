import React, { useState } from 'react';
/* Added ChevronRight to the lucide-react import list to resolve undefined icon error */
import { Sparkles, BrainCircuit, ShieldAlert, Save, RotateCcw, Zap, MessageSquare, Wand2, Target, Heart, ShieldCheck, AlignLeft, BarChart2, Layers, ChevronRight } from 'lucide-react';
import { useApp } from '../App';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';

const AIManager: React.FC = () => {
  const { aiSettings, setAiSettings } = useApp();
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const personalities = [
    { id: 'professional', label: 'Eminent', icon: <ShieldCheck size={18}/>, desc: 'Corporate & precise.' },
    { id: 'helpful', label: 'Curator', icon: <Heart size={18}/>, desc: 'Nurturing & warm.' },
    { id: 'aggressive', label: 'Closer', icon: <Target size={18}/>, desc: 'Urgent sales focus.' },
  ];

  const tonePresets = [
    { id: 'formal', label: 'Formal' },
    { id: 'casual', label: 'Casual' },
    { id: 'urgent', label: 'Urgent' },
    { id: 'empathetic', label: 'Empathetic' }
  ];

  const runTest = () => {
    if (!testInput) return;
    setIsSimulating(true);
    setTestOutput('Bot is formulating response...');
    setTimeout(() => {
      let response = "";
      const lengthMod = aiSettings.responseLength > 75 ? " (Detailed Overview)" : aiSettings.responseLength < 35 ? " (Quick Reply)" : "";
      const toneMod = aiSettings.tone === 'urgent' ? "!! " : "";
      
      switch(aiSettings.personality) {
        case 'professional': response = `${toneMod}Lock compatibility analysis for your specific door type has been completed. The A100 is verified.${lengthMod}`; break;
        case 'helpful': response = `${toneMod}Hi! I checked your request and the A100 is actually perfect for sliding doors. Would you like to see a video?${lengthMod}`; break;
        case 'aggressive': response = `${toneMod}We only have 3 units left for the A100 Pro. I can reserve one for you now if you complete checkout.${lengthMod}`; break;
        default: response = `Checking availability for your request.${lengthMod}`;
      }
      setTestOutput(`[AI]: ${response}`);
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 bg-surface dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-outfit flex items-center gap-3 tracking-tight"><BrainCircuit className="text-brand" /> Behavior Engine</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Tune the linguistic identity and response logic of your AI Agents.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-10 py-3 bg-brand text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 shadow-xl shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Save size={14} /> Deploy Logic
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Identity Config */}
          <div className="bg-surface dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/5 rounded-full blur-3xl group-hover:bg-brand/10 transition-all"></div>
             
             <h3 className="text-xl font-bold font-outfit flex items-center gap-3 mb-10"><Wand2 size={20} className="text-purple-500" /> Identity Matrix</h3>
             
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                {personalities.map((p) => (
                  <button 
                    key={p.id} onClick={() => setAiSettings({...aiSettings, personality: p.id as any})}
                    className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden group/btn ${aiSettings.personality === p.id ? 'border-brand bg-brand/5 shadow-inner' : 'border-slate-100 dark:border-slate-800 hover:border-brand/30 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${aiSettings.personality === p.id ? 'bg-brand text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{p.icon}</div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">{p.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1.5 leading-relaxed">{p.desc}</p>
                    </div>
                    {aiSettings.personality === p.id && <Zap size={14} className="absolute top-4 right-4 text-brand animate-pulse" />}
                  </button>
                ))}
             </div>

             <div className="space-y-10">
                {/* Precision Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><AlignLeft size={14}/> Response Length</label>
                      <span className="text-[10px] font-black text-brand bg-brand/10 px-3 py-1 rounded-xl border border-brand/20">{aiSettings.responseLength}%</span>
                    </div>
                    <input type="range" value={aiSettings.responseLength} onChange={(e) => setAiSettings({...aiSettings, responseLength: Number(e.target.value)})} className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-brand cursor-pointer transition-all hover:h-3" />
                    <div className="flex justify-between text-[8px] font-black text-slate-400 tracking-widest uppercase"><span>Concise</span><span>Extended</span></div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14}/> Creativity</label>
                      <span className="text-[10px] font-black text-purple-500 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20">{aiSettings.creativity}%</span>
                    </div>
                    <input type="range" value={aiSettings.creativity} onChange={(e) => setAiSettings({...aiSettings, creativity: Number(e.target.value)})} className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-purple-500 cursor-pointer transition-all hover:h-3" />
                    <div className="flex justify-between text-[8px] font-black text-slate-400 tracking-widest uppercase"><span>Fixed</span><span>Abstract</span></div>
                  </div>
                </div>

                {/* Tone Dropdown Replacement (Button Grid) */}
                <div className="pt-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2"><BarChart2 size={14}/> Tone Modulation</label>
                  <div className="flex flex-wrap gap-2">
                    {tonePresets.map(preset => (
                      <button 
                        key={preset.id} onClick={() => setAiSettings({...aiSettings, tone: preset.id as any})}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${aiSettings.tone === preset.id ? 'bg-brand text-white border-brand shadow-xl shadow-brand/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:border-slate-200'}`}
                      >{preset.label}</button>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Live Playground Simulator */}
        <div className="bg-slate-900 p-10 rounded-[4rem] shadow-2xl text-white flex flex-col min-h-[550px] relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <Layers size={120} />
          </div>
          
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold font-outfit flex items-center gap-3"><Zap size={22} className="text-brand" /> Playground</h3>
            <button onClick={() => {setTestOutput(''); setTestInput('');}} className="p-2 text-slate-500 hover:text-white transition-all"><RotateCcw size={18}/></button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto mb-8 custom-scrollbar pr-2">
             {testOutput ? (
               <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] animate-in zoom-in slide-in-from-bottom-2 duration-300 relative group/msg">
                 <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] text-brand font-black uppercase tracking-widest flex items-center gap-2">
                       <Sparkles size={12} className="animate-pulse" /> AI Agent Suggestion
                    </p>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{aiSettings.personality} / {aiSettings.tone}</span>
                 </div>
                 <p className="text-sm text-slate-200 leading-relaxed font-medium italic">"{testOutput}"</p>
                 <div className="absolute -right-2 -top-2 p-2 bg-emerald-500 rounded-xl opacity-0 group-hover/msg:opacity-100 transition-all scale-75 shadow-lg">
                    <CheckCheck size={14} className="text-white" />
                 </div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-6">
                 <MessageSquare size={48} className="mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] max-w-[140px]">Awaiting simulation parameters...</p>
               </div>
             )}
          </div>

          <div className="space-y-4">
             <div className="relative">
                <input 
                  value={testInput} 
                  onChange={(e) => setTestInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && runTest()}
                  placeholder="Simulate customer input..." 
                  className="w-full p-5 bg-white/5 border border-white/10 rounded-3xl text-sm outline-none focus:ring-2 focus:ring-brand placeholder-slate-600 transition-all font-medium" 
                />
                <button 
                  onClick={runTest} 
                  disabled={isSimulating || !testInput} 
                  className="absolute right-2 top-2 p-3 bg-brand text-white rounded-2xl hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-brand transition-all active:scale-90"
                >
                  <ChevronRight size={20} />
                </button>
             </div>
             <p className="text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest">Hit enter to process through behavior engine</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCheck = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 7 17l-5-5" />
    <path d="m22 10-7.5 7.5L13 16" />
  </svg>
);

export default AIManager;