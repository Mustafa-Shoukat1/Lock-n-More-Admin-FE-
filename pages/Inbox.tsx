import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Filter, Send, MoreHorizontal, CheckCheck, Paperclip, ChevronLeft, BrainCircuit, MessageSquare, Globe, Sparkles, UserPlus, Zap
} from 'lucide-react';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';
import { useApp } from '../App';
import { Platform, Conversation } from '../types';
import { gemini } from '../services/gemini';

const Inbox: React.FC = () => {
  const { t, searchQuery, conversations, setConversations, staff } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all');
  const [inputText, setInputText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (platformFilter !== 'all') {
      list = list.filter(c => c.platform === platformFilter);
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      list = list.filter(c => 
        c.customerName.toLowerCase().includes(lowerQuery) ||
        c.lastMessage.toLowerCase().includes(lowerQuery)
      );
    }
    return list;
  }, [conversations, platformFilter, searchQuery]);

  const activeChat = useMemo(() => 
    conversations.find(c => c.id === selectedId)
  , [conversations, selectedId]);

  useEffect(() => {
    if (activeChat) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const autoAssign = () => {
    const activeStaff = staff.filter(s => s.active);
    if (activeStaff.length === 0) return;
    
    setConversations(conversations.map(c => {
      if (c.assignedStaff) return c;
      const staffIdx = Math.floor(Math.random() * activeStaff.length);
      return { ...c, assignedStaff: activeStaff[staffIdx].name };
    }));
  };

  const assignStaff = (id: string, staffName: string) => {
    setConversations(conversations.map(c => 
      c.id === id ? { ...c, assignedStaff: staffName } : c
    ));
  };

  const toggleTakeover = (id: string) => {
    setConversations(conversations.map(c => 
      c.id === id ? { ...c, isHumanTakeover: !c.isHumanTakeover } : c
    ));
  };

  return (
    <div className="flex h-full bg-surface dark:bg-slate-950 overflow-hidden relative">
      <div className={`absolute inset-0 z-10 md:relative md:flex md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-sidebar transition-all duration-300 ${selectedId ? 'hidden md:flex' : 'flex w-full'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-outfit">Inbox</h2>
            <button onClick={autoAssign} className="p-1.5 bg-brand/10 text-brand rounded-lg hover:bg-brand hover:text-white transition-all" title="Auto-Assign Chats">
               <Zap size={14} />
            </button>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <FilterBtn active={platformFilter === 'all'} onClick={() => setPlatformFilter('all')} label="ALL" />
            <FilterBtn active={platformFilter === 'whatsapp'} onClick={() => setPlatformFilter('whatsapp')} icon={<WhatsAppIcon size={14} />} />
            <FilterBtn active={platformFilter === 'instagram'} onClick={() => setPlatformFilter('instagram')} icon={<InstagramIcon size={14} />} />
            <FilterBtn active={platformFilter === 'tiktok'} onClick={() => setPlatformFilter('tiktok')} icon={<TikTokIcon size={14} className="text-slate-900 dark:text-white" />} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.map(conv => (
            <div key={conv.id} onClick={() => setSelectedId(conv.id)} className={`p-4 border-b border-slate-50 dark:border-slate-900 cursor-pointer transition-all relative ${selectedId === conv.id ? 'bg-brand/5 border-l-4 border-l-brand shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-sm flex-shrink-0">
                    {conv.customerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate">{conv.customerName}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-black uppercase tracking-widest">
                      {conv.assignedStaff || 'Unassigned'}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">{conv.lastTimestamp}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-1 leading-relaxed">
                {conv.isHumanTakeover && <span className="text-amber-500 font-black mr-1">[M]</span>}
                {conv.lastMessage}
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedId ? (
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 relative z-20 transition-colors">
          <div className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-surface flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedId(null)} className="p-2 -ml-2 text-slate-500 md:hidden"><ChevronLeft size={20} /></button>
              <div>
                <h3 className="font-bold text-sm sm:text-base leading-tight">{activeChat?.customerName}</h3>
                <p className="text-[9px] text-brand font-black uppercase tracking-widest mt-0.5">{activeChat?.assignedStaff || 'Needs Assignment'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select 
                onChange={(e) => assignStaff(activeChat!.id, e.target.value)}
                value={activeChat?.assignedStaff || ""}
                className="hidden lg:block text-[10px] font-black bg-slate-100 dark:bg-slate-800 border-none rounded-lg p-1.5 focus:ring-1 focus:ring-brand uppercase"
              >
                <option value="">Manual Assign</option>
                {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <button onClick={() => toggleTakeover(activeChat!.id)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${!activeChat?.isHumanTakeover ? 'bg-brand text-white shadow-md' : 'text-slate-400'}`}>AI</button>
                <button onClick={() => toggleTakeover(activeChat!.id)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${activeChat?.isHumanTakeover ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400'}`}>STAFF</button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-thin">
            {activeChat?.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] sm:max-w-[70%] rounded-[2rem] p-4 shadow-sm transition-all ${
                  msg.sender === 'customer' ? 'bg-surface dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-none' : 'bg-brand text-white rounded-tr-none shadow-brand/20 shadow-lg'
                }`}>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1.5 mt-2 text-[9px] font-bold ${msg.sender === 'customer' ? 'text-slate-400' : 'text-white/60'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.sender !== 'customer' && <CheckCheck size={12} />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 sm:p-6 bg-surface border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-brand transition-all border border-slate-200 dark:border-slate-700 shadow-sm"><Paperclip size={18} /></button>
                <div className="flex-1 relative">
                  <input 
                    type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeChat?.isHumanTakeover ? "Staff typing..." : "Monitoring AI conversation..."}
                    className="w-full pl-4 pr-14 py-3 sm:py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-brand outline-none transition-all shadow-inner"
                  />
                  <button className="absolute right-2 top-1.5 sm:top-2 p-2 bg-brand text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-90">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 text-slate-400 p-8 text-center">
          <div className="w-24 h-24 bg-surface dark:bg-slate-800 rounded-[3rem] flex items-center justify-center shadow-2xl mb-8 group transition-transform hover:scale-110">
            <MessageSquare size={40} className="opacity-10 group-hover:opacity-100 group-hover:text-brand transition-all duration-700" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 font-outfit">Customer Sales Flow</h3>
          <p className="mt-2 text-sm max-w-xs opacity-60 font-medium leading-relaxed">Select a thread to monitor AI performance or provide manual staff support.</p>
        </div>
      )}
    </div>
  );
};

const FilterBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-[9px] font-black transition-all ${active ? 'bg-white dark:bg-slate-800 text-brand shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
    {icon || label}
  </button>
);

export default Inbox;