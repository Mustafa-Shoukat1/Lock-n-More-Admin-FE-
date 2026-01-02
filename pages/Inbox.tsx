
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, MessageSquare, Zap, UserCheck, Send, CheckCheck, Check, X, Box, Mic, Square, CreditCard, Sparkles, RefreshCw, Play, UserPlus, Info, Phone, MoreVertical, Circle, Power, Heart, Image as ImageIcon, FolderOpen, Grid, Loader2, Filter } from 'lucide-react';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';
import { useApp, SafeText } from '../App';
import { Platform } from '../types';
import { gemini } from '../services/gemini';

const Inbox: React.FC = () => {
  const { searchQuery, conversations, staff, sendMessage, products, assignStaff, generateInvoice, markAsOpened, toggleAi, aiSettings } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all');
  const [inputText, setInputText] = useState('');
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('0');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sentiment, setSentiment] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const activeChat = useMemo(() => conversations.find(c => c.id === selectedId), [conversations, selectedId]);

  useEffect(() => { 
    if (selectedId) {
      markAsOpened(selectedId);
      analyzeChatSentiment();
    } 
  }, [selectedId]);

  useEffect(() => { 
    if (activeChat) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [activeChat?.messages, isAiLoading]);

  const analyzeChatSentiment = async () => {
    if (!activeChat) return;
    const lastCustomerMsg = activeChat.messages.filter(m => m.sender === 'customer').pop();
    if (lastCustomerMsg) {
      const result = await gemini.analyzeSentiment(lastCustomerMsg.text);
      setSentiment(result);
    }
  };

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (platformFilter !== 'all') list = list.filter(c => c.platform === platformFilter);
    if (searchQuery) list = list.filter(c => c.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [conversations, platformFilter, searchQuery]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;
    sendMessage(selectedId, inputText, 'staff');
    setInputText('');
    setAiSuggestion(null);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    if (selectedId && recordingTime > 0) {
      sendMessage(selectedId, `Voice Message Captured (${recordingTime}s)`, 'staff', 'voice');
    }
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchAiSuggestion = async () => {
    if (!activeChat || activeChat.messages.length === 0) return;
    setIsAiLoading(true);
    setAiSuggestion(null);
    const lastMsg = activeChat.messages.filter(m => m.sender === 'customer').pop();
    if (lastMsg) {
      const suggestion = await gemini.getAiResponseSuggestion(`Platform: ${activeChat.platform}`, lastMsg.text, aiSettings);
      setAiSuggestion(suggestion);
    }
    setIsAiLoading(false);
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative font-inter text-left">
      <div className={`flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${selectedId ? 'hidden md:flex md:w-[350px] lg:w-[400px]' : 'flex w-full md:w-[350px] lg:w-[400px]'}`}>
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold font-outfit text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Inbox</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setPlatformFilter('all')} className={`p-2 rounded-xl transition-all ${platformFilter === 'all' ? 'bg-brand text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="All Platforms">
                <Filter size={16} />
              </button>
            </div>
          </div>
          
          {/* Enhanced Three-Button Filter Hub */}
          <div className="grid grid-cols-3 gap-2">
            <FilterButton 
              active={platformFilter === 'whatsapp'} 
              onClick={() => setPlatformFilter('whatsapp')} 
              icon={<WhatsAppIcon size={18} />} 
              label="WhatsApp"
              activeClass="bg-emerald-500 text-white shadow-emerald-500/20"
            />
            <FilterButton 
              active={platformFilter === 'instagram'} 
              onClick={() => setPlatformFilter('instagram')} 
              icon={<InstagramIcon size={18} />} 
              label="Instagram"
              activeClass="bg-pink-600 text-white shadow-pink-600/20"
            />
            <FilterButton 
              active={platformFilter === 'tiktok'} 
              onClick={() => setPlatformFilter('tiktok')} 
              icon={<TikTokIcon size={18} />} 
              label="TikTok"
              activeClass="bg-black text-white shadow-black/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none">
          {filteredConversations.length === 0 ? (
            <div className="p-20 text-center opacity-20"><Info size={40} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase">No Active Nodes</p></div>
          ) : filteredConversations.map(conv => (
            <div key={conv.id} onClick={() => setSelectedId(conv.id)} className={`px-5 py-5 cursor-pointer flex items-center gap-4 transition-all border-b border-slate-50 dark:border-slate-800/50 ${selectedId === conv.id ? 'bg-slate-100 dark:bg-slate-800 shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-xl shrink-0">
                   {conv.customerName.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg">
                   {conv.platform === 'whatsapp' && <WhatsAppIcon size={12} />}
                   {conv.platform === 'instagram' && <InstagramIcon size={12} />}
                   {conv.platform === 'tiktok' && <TikTokIcon size={12} />}
                </div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-bold truncate text-slate-900 dark:text-white leading-none">{conv.customerName}</h4>
                  <span className={`text-[10px] font-bold ${conv.unreadCount > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>{conv.lastTimestamp}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                   <p className="text-[11px] text-slate-500 truncate font-medium">{conv.lastMessage}</p>
                   {conv.unreadCount > 0 && <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-black shadow-lg shrink-0">{conv.unreadCount}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative ${selectedId ? 'flex' : 'hidden md:flex'}`}>
        {selectedId ? (
          <>
            <div className="h-16 sm:h-20 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setSelectedId(null)} className="p-2 -ml-2 text-slate-500 md:hidden"><ChevronLeft size={24} /></button>
                <div className="w-11 h-11 rounded-full bg-brand/20 flex items-center justify-center text-brand font-black text-lg shrink-0">{activeChat?.customerName.charAt(0)}</div>
                <div className="truncate text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate leading-none">{activeChat?.customerName}</h3>
                    <span className="hidden sm:inline-block text-[8px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase tracking-tighter">
                      {activeChat?.platform === 'whatsapp' ? activeChat.customerPhone : activeChat?.customerPhone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className={`text-[9px] font-black uppercase flex items-center gap-1 tracking-widest leading-none ${activeChat?.aiEnabled ? 'text-brand animate-pulse' : 'text-emerald-500'}`}>
                      {activeChat?.aiEnabled ? <Sparkles size={8}/> : <UserCheck size={8}/>}
                      {activeChat?.aiEnabled ? 'AI Managed' : (activeChat?.assignedStaff || 'Unassigned')}
                    </p>
                    {sentiment && (
                      <span className={`flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        sentiment === 'Negative' || sentiment === 'Frustrated' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        <Heart size={8} fill="currentColor" /> {sentiment}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                 <button onClick={() => toggleAi(selectedId!)} className={`p-2 rounded-xl transition-all ${activeChat?.aiEnabled ? 'bg-brand/10 text-brand' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Toggle AI Presence">
                   <Power size={20}/>
                 </button>
                 <button onClick={fetchAiSuggestion} disabled={isAiLoading} className={`p-2 text-brand hover:bg-brand/10 rounded-xl transition-all ${isAiLoading ? 'animate-spin' : ''}`} title="AI Synthesis">
                   {isAiLoading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                 </button>
                 <button onClick={() => setShowInvoiceModal(true)} className="p-2 text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Deploy Invoice"><CreditCard size={20}/></button>
                 <button onClick={() => setShowStaffPicker(true)} className="p-2 text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Assign Staff"><UserPlus size={20}/></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-6 scrollbar-none bg-[#eef2f6] dark:bg-slate-950 bg-[url('https://i.pinimg.com/originals/ab/ab/60/abab60fec0a389f816f5c53c0255474d.png')] bg-repeat bg-[length:400px] dark:bg-none">
              {activeChat?.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm relative ${
                    msg.sender === 'customer' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-bl-none' : 
                    msg.sender === 'ai' ? 'bg-brand text-white rounded-br-none shadow-brand/20' :
                    'bg-emerald-100 dark:bg-emerald-900 text-slate-900 dark:text-slate-100 font-medium rounded-br-none border border-emerald-200/50 dark:border-emerald-800/50'
                  }`}>
                    <div className="text-left">
                       <p className="text-sm font-medium leading-relaxed"><SafeText text={msg.text} /></p>
                    </div>
                    <div className={`flex items-center justify-end gap-1.5 mt-2 text-[9px] font-bold uppercase tracking-widest ${msg.sender === 'ai' ? 'text-white/70' : 'text-slate-400'}`}>
                      <span>{msg.timestamp}</span>
                      {msg.sender !== 'customer' && <MessageStatus status={msg.status || 'sent'} dark={msg.sender === 'ai'} />}
                    </div>
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-end animate-in fade-in slide-in-from-right duration-300">
                  <div className="bg-brand text-white rounded-2xl rounded-br-none p-4 shadow-brand/20 flex items-center gap-3">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Hub Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 flex flex-col gap-2 relative z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-slate-200 dark:border-slate-800">
              {aiSuggestion && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl shadow-xl border border-brand/20 flex justify-between items-center animate-in slide-in-from-bottom duration-300 mb-2">
                   <div className="flex-1 text-left">
                     <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Sparkles size={12}/> Cognitive Proposal</p>
                     <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic line-clamp-2">
                       <SafeText text={aiSuggestion} />
                     </p>
                   </div>
                   <div className="flex gap-2 shrink-0 ml-6">
                     <button onClick={() => setAiSuggestion(null)} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                     <button onClick={() => {setInputText(aiSuggestion); setAiSuggestion(null);}} className="px-6 py-2.5 bg-brand text-white text-[10px] font-black uppercase rounded-2xl shadow-lg hover:bg-blue-700 transition-all">Apply</button>
                   </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 h-14">
                <button className="p-2.5 transition-all rounded-full text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800"><ImageIcon size={24}/></button>
                <div className={`flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 flex items-center border border-slate-200 dark:border-slate-700 transition-all ${isRecording ? 'border-red-500 ring-4 ring-red-500/10' : 'focus-within:border-brand/50 shadow-inner'}`}>
                  {isRecording ? (
                    <div className="flex-1 flex justify-between items-center text-[10px] font-black text-red-500 py-3">
                      <div className="flex items-center gap-3">
                        <Circle size={10} className="fill-red-500 animate-pulse" />
                        <span className="uppercase tracking-[0.2em]">Capturing Signal...</span>
                      </div>
                      <span className="font-mono text-base">{formatTime(recordingTime)}</span>
                    </div>
                  ) : (
                    <input 
                      type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={`Message via ${activeChat?.platform.toUpperCase()}...`} 
                      className="w-full py-4 bg-transparent text-sm outline-none font-medium text-slate-900 dark:text-white" 
                    />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {inputText.trim() ? (
                    <button onClick={handleSend} className="p-3.5 bg-brand text-white rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all shadow-brand/30"><Send size={20}/></button>
                  ) : (
                    <button 
                      onMouseDown={startRecording} onMouseUp={stopRecording} 
                      onTouchStart={startRecording} onTouchEnd={stopRecording}
                      className={`p-3.5 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white shadow-2xl scale-125' : 'text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      {isRecording ? <Square size={20} fill="currentColor"/> : <Mic size={24}/>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-12 select-none bg-white dark:bg-slate-950">
            <div className="w-40 h-40 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-800 shadow-inner">
               <Grid size={80} className="text-slate-300"/>
            </div>
            <h3 className="text-3xl font-bold font-outfit uppercase tracking-tighter text-slate-400">Hub Initialized</h3>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] mt-5 text-slate-500 text-center max-w-xs leading-loose">Await signal injection or select a perimeter node to begin.</p>
          </div>
        )}
      </div>

      {showStaffPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-12 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
             <div className="flex items-center justify-between mb-10 text-left"><h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter leading-none">Assign Node</h3><button onClick={() => setShowStaffPicker(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><X size={24}/></button></div>
             <div className="space-y-4">
                {staff.map(s => (
                  <button key={s.id} onClick={() => {assignStaff(selectedId!, s.name); setShowStaffPicker(false);}} className="w-full flex items-center gap-5 p-6 rounded-[2rem] hover:bg-brand/5 border border-transparent hover:border-brand/20 text-left transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 group-hover:bg-brand group-hover:text-white flex items-center justify-center text-brand font-black text-base transition-colors">{s.name.charAt(0)}</div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">{s.name}</p>
                      <p className="text-[10px] font-black uppercase text-brand tracking-widest mt-1.5 opacity-60">{s.role.replace('_', ' ')} Node</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[3rem] p-12 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300 text-center">
             <div className="flex items-center justify-between mb-10 text-left"><h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter leading-none">Commerce</h3><button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><X size={24}/></button></div>
             <div className="p-8 bg-slate-50 dark:bg-slate-950/50 rounded-3xl mb-10 border border-slate-100 dark:border-slate-800 text-left shadow-inner">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">Settlement (RM)</p>
                <input type="number" value={invoiceAmount} onChange={(e)=>setInvoiceAmount(e.target.value)} className="w-full bg-transparent text-5xl font-black font-outfit outline-none focus:text-brand" autoFocus />
             </div>
             <button onClick={() => {generateInvoice(selectedId!, parseFloat(invoiceAmount)); setShowInvoiceModal(false);}} className="w-full py-6 bg-brand text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-brand/30 hover:scale-105 active:scale-95 transition-all">Authorize Release</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Status Indicators for Outbound Messages
const MessageStatus = ({ status, dark }: { status: 'sent' | 'delivered' | 'read', dark?: boolean }) => {
  const baseColor = dark ? 'text-white/40' : 'text-slate-300';
  const deliveredColor = dark ? 'text-white/80' : 'text-slate-500';
  const readColor = dark ? 'text-white' : 'text-brand';
  
  if (status === 'sent') {
    return <Check size={14} className={baseColor} />;
  }
  if (status === 'delivered') {
    return <CheckCheck size={14} className={deliveredColor} />;
  }
  if (status === 'read') {
    return <CheckCheck size={14} className={readColor} />;
  }
  return null;
};

const FilterButton = ({ active, onClick, icon, label, activeClass }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
      active 
        ? `${activeClass} border-transparent scale-105 shadow-lg` 
        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

const FilterBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-brand text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
    {icon || label}
  </button>
);

export default Inbox;
