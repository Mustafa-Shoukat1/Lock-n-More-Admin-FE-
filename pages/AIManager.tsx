import React, { useState } from 'react';
import { Sparkles, BrainCircuit, ShieldAlert, History, Save, RotateCcw, Sliders, Zap } from 'lucide-react';
import { useTranslation } from '../App';

const AIManager: React.FC = () => {
  const { t, lang } = useTranslation();
  const [creativity, setCreativity] = useState(70);

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto animate-in slide-in-from-bottom duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-3">
            <Sparkles className="text-brand" /> {t('aiManager')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Fine-tune agent behavior and sales protocols.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-surface border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all flex items-center gap-2">
            <RotateCcw size={16} /> {t('reset')}
          </button>
          <button className="px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-brand/20 transition-all flex items-center gap-2 active:scale-95">
            <Save size={16} /> {t('save')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-surface dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 font-outfit flex items-center gap-3">
              <BrainCircuit size={22} className="text-brand" /> {lang === 'en' ? 'Core Intelligence' : 'Kecerdasan Teras'}
            </h3>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Creativity Level (Temperature)</label>
                  <span className="text-xs font-black text-brand bg-brand/10 px-2 py-1 rounded-lg">{creativity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={creativity}
                  onChange={(e) => setCreativity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Concise / Precise</span>
                  <span>Creative / Salesy</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Instruction (English/BM)</label>
                <textarea 
                  className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl focus:ring-2 focus:ring-brand outline-none text-sm font-medium h-48 resize-none leading-relaxed transition-all"
                  defaultValue="You are the primary sales assistant for Locks & More. Support both English and Bahasa Melayu queries. If a customer is angry, escalate to human immediately. Always suggest the Smart Lock A100 Pro as the top tier option."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-surface dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-outfit flex items-center gap-3">
              <ShieldAlert size={22} className="text-red-500" /> {lang === 'en' ? 'Safety Guardrails' : 'Kawalan Keselamatan'}
            </h3>
            <div className="space-y-4">
              <ToggleItem label="Auto-Escalate Anger" sub="Detects negative customer sentiment" checked />
              <ToggleItem label="Filter Competitors" sub="Prevents mentioning other lock brands" checked />
              <ToggleItem label="Daily Token Limit" sub="Alert when AI usage exceeds 50k tokens" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-brand/20 transition-all duration-700"></div>
            <h3 className="text-lg font-bold mb-8 font-outfit flex items-center gap-3">
              <History size={22} className="text-brand" /> {lang === 'en' ? 'Deployment History' : 'Sejarah Pengerahan'}
            </h3>
            <div className="space-y-5">
              {[
                { version: 'v3.2.1-prod', date: 'Hari Ini, 2:30 PM', active: true },
                { version: 'v3.2.0-prod', date: '24 Okt, 10:15 AM', active: false },
                { version: 'v3.1.9-stable', date: '15 Okt, 9:00 AM', active: false },
              ].map((v) => (
                <div key={v.version} className={`p-5 rounded-2xl border transition-all ${v.active ? 'bg-brand/10 border-brand/50 shadow-lg' : 'bg-white/5 border-white/10 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-sm font-bold font-outfit">{v.version}</span>
                      {v.active && <span className="ml-3 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter">Live</span>}
                    </div>
                    <span className="text-[10px] font-bold text-white/40">{v.date}</span>
                  </div>
                  {!v.active && (
                    <button className="text-[10px] font-black text-brand hover:text-white transition-all flex items-center gap-1.5 uppercase tracking-widest">
                      Rollback
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-outfit flex items-center gap-3">
              <Zap size={22} className="text-[#F59E0B]" /> {lang === 'en' ? 'Quick Actions' : 'Tindakan Pantas'}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black text-slate-400 hover:border-brand hover:text-brand transition-all flex items-center justify-center gap-3">
                <Sliders size={14} /> Add Behavior Rule
              </button>
              <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black text-slate-400 hover:border-brand hover:text-brand transition-all flex items-center justify-center gap-3">
                <Zap size={14} /> Train New Dataset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleItem: React.FC<{label: string, sub: string, checked?: boolean}> = ({label, sub, checked = false}) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
    <div>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
      <p className="text-[10px] text-slate-500 font-medium">{sub}</p>
    </div>
    <div className="relative inline-block w-12 h-6">
      <input type="checkbox" defaultChecked={checked} className="opacity-0 w-0 h-0 peer" />
      <span className="absolute cursor-pointer inset-0 bg-slate-200 dark:bg-slate-700 rounded-full transition-all peer-checked:bg-brand"></span>
      <span className="absolute cursor-pointer left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></span>
    </div>
  </div>
);

export default AIManager;