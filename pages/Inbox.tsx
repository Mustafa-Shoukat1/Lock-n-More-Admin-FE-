
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, MessageSquare, Zap, UserCheck, Paperclip, Send, CheckCheck, Check, X, Box, Smartphone, Mic, Square, CreditCard, Sparkles, RefreshCw, Volume2, Play } from 'lucide-react';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';
import { useApp } from '../App';
import { Platform } from '../types';
import { gemini } from '../services/gemini';

const Inbox: React.FC = () => {
  const { searchQuery, conversations, staff, sendMessage, products, assignStaff, generateInvoice, markAsOpened } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all');
  const [inputText, setInputText] = useState('');
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('0');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const activeChat = useMemo(() => conversations.find(c => c.id === selectedId), [conversations, selectedId]);

  useEffect(() => {
    if (selectedId) markAsOpened(selectedId);
  }, [selectedId]);

  useEffect(() => { 
    if (activeChat) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [activeChat?.messages]);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (platformFilter !== 'all') list = list.filter(c => c.platform === platformFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.customerName.toLowerCase().includes(q));
    }
    return list;
  }, [conversations, platformFilter, searchQuery]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;
    sendMessage(selectedId, inputText, 'staff');
    setInputText('');
    setAiSuggestion(null);
  };

  const fetchAiSuggestion = async () => {
    if (!activeChat) return;
    setIsAiLoading(true);
    
    // As per Requirement 2: 3-5s for standard, 7-10s for heavy data simulation
    const complexityDelay = Math.random() > 0.5 
      ? Math.floor(Math.random() * 2000) + 3000 // 3-5s
      : Math.floor(Math.random() * 3000) + 7000; // 7-10s
    
    const context = activeChat.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const lastCustomerMsg = activeChat.messages.filter(m => m.sender === 'customer').pop()?.text || "";
    
    const suggestion = await gemini.getAiResponseSuggestion(context, lastCustomerMsg);
    
    setTimeout(() => {
      setAiSuggestion(suggestion);
      setIsAiLoading(false);
    }, complexityDelay);
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
      sendMessage(selectedId, `Voice Signal (${recordingTime}s)`, 'staff', 'voice');
    }
  };

  return (
    <div className="flex h-full bg-surface dark:bg-slate-950 overflow-hidden relative">
      {/* Thread List */}
      <div className={`flex flex-col border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 ${selectedId ? 'hidden md:flex md:w-[380px]' : 'flex w-full md:w-[380px]'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-outfit uppercase tracking-tighter">Signals Hub</h2>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <FilterBtn active={platformFilter === 'all'} onClick={() => setPlatformFilter('all')} label="All" />
            <FilterBtn active={platformFilter === 'whatsapp'} onClick={() => setPlatformFilter('whatsapp')} icon={<WhatsAppIcon size={16} />} />
            <FilterBtn active={platformFilter === 'instagram'} onClick={() => setPlatformFilter('instagram')} icon={<InstagramIcon size={16} />} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
          {filteredConversations.map(conv => (
            <div key={conv.id} onClick={() => setSelectedId(conv.id)} className={`p-4 rounded-2xl cursor-pointer transition-all ${selectedId === conv.id ? 'bg-brand text-white shadow-xl scale-[1.02]' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3 text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-outfit ${selectedId === conv.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{conv.customerName.charAt(0)}</div>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-bold truncate ${selectedId === conv.id ? 'text-white' : ''}`}>{conv.customerName}</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{conv.assignedStaff || 'TOTO Node'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className="text-[10px] opacity-60 font-bold">{conv.lastTimestamp}</span>
                   {conv.unreadCount > 0 && <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-black">{conv.unreadCount}</span>}
                </div>
              </div>
              <p className="text-[11px] truncate opacity-80 text-left">{conv.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Pane */}
      <div className={`flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative ${selectedId ? 'flex' : 'hidden md:flex'}`}>
        {selectedId ? (
          <>
            <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4 text-left">
                <button onClick={() => setSelectedId(null)} className="p-2 -ml-2 text-slate-500 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><ChevronLeft size={24} /></button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand font-black text-base font-outfit">
                    {activeChat?.customerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm font-outfit leading-none">{activeChat?.customerName}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase mt-1.5 flex items-center gap-1">
                      {activeChat?.assignedStaff ? <UserCheck size={10} className="text-amber-500" /> : <Zap size={10} className="text-brand" />}
                      {activeChat?.assignedStaff || 'AI Node'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowInvoiceModal(true)} className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all"><CreditCard size={14} /> Send Link</button>
                <button onClick={() => setShowStaffPicker(true)} className="px-3 py-2 bg-white dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase border border-slate-200 dark:border-slate-700 hover:border-brand transition-all">Assign</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none bg-white dark:bg-slate-950">
              {activeChat?.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm text-left ${msg.sender === 'customer' ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100' : 'bg-brand text-white shadow-lg shadow-brand/10'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-50">{msg.sender}</p>
                      {msg.platform === 'whatsapp' && <WhatsAppIcon size={12} className="opacity-40" />}
                    </div>
                    {msg.type === 'voice' ? (
                      <div className="flex items-center gap-4 py-2 px-3 bg-white/10 rounded-2xl border border-white/5">
                        <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"><Play size={18} fill="white"/></button>
                        <div className="flex-1 space-y-1">
                           <div className="flex gap-0.5 items-end h-6">
                              {[0.4, 0.7, 0.5, 0.9, 0.3, 0.6, 0.8, 0.4, 0.7].map((h, i) => (
                                <div key={i} className="flex-1 bg-white/40 rounded-full" style={{ height: `${h * 100}%` }}></div>
                              ))}
                           </div>
                           <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{msg.text}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    )}
                    <div className="flex items-center justify-end gap-1.5 mt-2 text-[9px] opacity-70">
                      <span>{msg.timestamp}</span>
                      {msg.sender !== 'customer' && <MessageStatus status={msg.status} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-4">
              {aiSuggestion && (
                <div className="p-4 bg-brand/5 border border-brand/20 rounded-[1.5rem] flex justify-between items-center animate-in slide-in-from-bottom-2">
                   <div className="flex items-center gap-3">
                      <Sparkles size={16} className="text-brand" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic">{aiSuggestion}</p>
                   </div>
                   <button onClick={() => {setInputText(aiSuggestion); setAiSuggestion(null);}} className="px-4 py-2 bg-brand text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand/20">Use Suggestion</button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => setShowProductPicker(true)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-brand transition-all"><Box size={20} /></button>
                <button onClick={fetchAiSuggestion} className={`p-3 rounded-xl transition-all ${isAiLoading ? 'bg-brand text-white animate-pulse' : 'bg-brand/10 text-brand'}`}>
                  {isAiLoading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                </button>
                <div className="flex-1 relative">
                  {isRecording ? (
                    <div className="w-full px-5 py-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl flex justify-between items-center text-xs font-black border border-red-100 dark:border-red-900/40">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Capturing Voice Signal...
                      </span>
                      <span>{recordingTime}s</span>
                    </div>
                  ) : (
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={inputText} 
                        onChange={(e) => setInputText(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                        placeholder="Authorize response signal..." 
                        className="w-full pl-5 pr-12 py-3.5 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-brand/30 rounded-2xl text-sm outline-none font-medium transition-all" 
                      />
                      <button onClick={handleSend} className="absolute right-2 top-2 p-2 bg-brand text-white rounded-xl hover:scale-105 active:scale-95 transition-all"><Send size={18} /></button>
                    </div>
                  )}
                </div>
                <button onClick={isRecording ? stopRecording : startRecording} className={`p-3 rounded-xl shadow-sm transition-all ${isRecording ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500'}`}>
                  {isRecording ? <Square size={20} /> : <Mic size={20} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-10">
            <div className="w-24 h-24 bg-brand/5 rounded-[2.5rem] flex items-center justify-center mb-6 border border-brand/10">
              <MessageSquare size={48} className="text-brand opacity-20" />
            </div>
            <h3 className="text-2xl font-bold font-outfit uppercase tracking-tighter">Signal Terminal Ready</h3>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Select an active perimeter signal to begin</p>
          </div>
        )}
      </div>

      {/* Simplified Invoice Modal for Production Flow */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-outfit uppercase tracking-tighter">Shopify Node Link</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Authorize Transaction Amount (RM)</p>
            <input 
               type="number" 
               value={invoiceAmount} 
               onChange={(e)=>setInvoiceAmount(e.target.value)} 
               className="w-full p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl mb-8 text-3xl font-black font-outfit outline-none focus:ring-4 focus:ring-brand/10" 
               autoFocus
            />
            <button onClick={()=>{generateInvoice(selectedId!, parseFloat(invoiceAmount)); setShowInvoiceModal(false);}} className="w-full py-5 bg-brand text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-brand/30 hover:scale-[1.02] transition-all">Authorize Node</button>
          </div>
        </div>
      )}
    </div>
  );
};

const MessageStatus = ({ status }: { status?: 'sent' | 'delivered' | 'read' }) => {
  if (!status) return null;
  return (
    <div className="flex items-center -space-x-1 scale-[0.8] ml-1">
      {status === 'sent' && <Check size={14} className="opacity-40" />}
      {status === 'delivered' && <CheckCheck size={14} className="opacity-40" />}
      {status === 'read' && <CheckCheck size={14} className="text-blue-400" />}
    </div>
  );
};

const FilterBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white dark:bg-brand text-brand dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
    {icon || label}
  </button>
);

export default Inbox;
