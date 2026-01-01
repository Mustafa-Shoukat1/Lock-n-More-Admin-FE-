
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, MessageSquare, Zap, UserCheck, Send, CheckCheck, Check, X, Box, Mic, Square, CreditCard, Sparkles, RefreshCw, Play, UserPlus, Info, Phone, MoreVertical, Circle } from 'lucide-react';
import { WhatsAppIcon, InstagramIcon } from '../components/Icons';
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

  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const activeChat = useMemo(() => conversations.find(c => c.id === selectedId), [conversations, selectedId]);

  useEffect(() => { if (selectedId) markAsOpened(selectedId); }, [selectedId]);
  useEffect(() => { if (activeChat) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeChat?.messages]);

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
      sendMessage(selectedId, `Voice Message (${recordingTime}s)`, 'staff', 'voice');
    }
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full bg-[#f0f2f5] dark:bg-slate-950 overflow-hidden relative font-inter">
      {/* THREAD LIST */}
      <div className={`flex flex-col border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 transition-all duration-300 ${selectedId ? 'hidden md:flex md:w-[400px]' : 'flex w-full md:w-[400px]'}`}>
        <div className="p-4 sm:p-6 bg-[#f0f2f5] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold font-outfit text-slate-900 dark:text-white">Signals</h2>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm"><MessageSquare size={18} className="text-slate-500"/></div>
          </div>
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm">
            <FilterBtn active={platformFilter === 'all'} onClick={() => setPlatformFilter('all')} label="All" />
            <FilterBtn active={platformFilter === 'whatsapp'} onClick={() => setPlatformFilter('whatsapp')} icon={<WhatsAppIcon size={16} />} />
            <FilterBtn active={platformFilter === 'instagram'} onClick={() => setPlatformFilter('instagram')} icon={<InstagramIcon size={16} />} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {filteredConversations.map(conv => (
            <div key={conv.id} onClick={() => setSelectedId(conv.id)} className={`px-5 py-4 cursor-pointer flex items-center gap-4 transition-all border-b border-slate-50 dark:border-slate-800/50 ${selectedId === conv.id ? 'bg-[#ebebeb] dark:bg-slate-800' : 'hover:bg-[#f5f6f6] dark:hover:bg-slate-800/40'}`}>
              <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-xl shrink-0">
                {conv.customerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-bold truncate text-slate-900 dark:text-white">{conv.customerName}</h4>
                  <span className={`text-[10px] font-bold ${conv.unreadCount > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>{conv.lastTimestamp}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                   <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage}</p>
                   {conv.unreadCount > 0 && <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-black shadow-lg">{conv.unreadCount}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT PANE */}
      <div className={`flex-1 flex flex-col min-w-0 bg-[#e5ddd5] dark:bg-slate-950 relative ${selectedId ? 'flex' : 'hidden md:flex'}`}>
        {selectedId ? (
          <>
            <div className="h-16 sm:h-18 px-4 bg-[#f0f2f5] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setSelectedId(null)} className="p-2 -ml-2 text-slate-500 md:hidden"><ChevronLeft size={24} /></button>
                <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-black text-sm">{activeChat?.customerName.charAt(0)}</div>
                <div className="truncate text-left">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate leading-none">{activeChat?.customerName}</h3>
                  <p className="text-[10px] text-emerald-500 font-black uppercase mt-1.5 flex items-center gap-1">
                    {activeChat?.assignedStaff ? <UserCheck size={10}/> : <Zap size={10}/>}
                    {activeChat?.assignedStaff || 'AI Node Active'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => setShowInvoiceModal(true)} className="p-2.5 text-slate-500 hover:text-brand transition-all"><CreditCard size={20}/></button>
                 <button onClick={() => setShowStaffPicker(true)} className="p-2.5 text-slate-500 hover:text-brand transition-all"><UserPlus size={20}/></button>
                 <button className="p-2.5 text-slate-500"><MoreVertical size={20}/></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-4 scrollbar-none bg-[#e5ddd5] dark:bg-slate-950 bg-[url('https://i.pinimg.com/originals/ab/ab/60/abab60fec0a389f816f5c53c0255474d.png')] bg-repeat bg-[length:400px] bg-fixed">
              {activeChat?.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] sm:max-w-[65%] rounded-xl p-3 shadow-md relative ${msg.sender === 'customer' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100' : 'bg-[#dcf8c6] dark:bg-emerald-950 text-slate-900 dark:text-slate-100'}`}>
                    {msg.type === 'voice' ? (
                      <div className="flex items-center gap-3 py-1">
                        <button className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center"><Play size={20} fill="currentColor"/></button>
                        <div className="h-6 flex items-center gap-0.5 flex-1 min-w-[150px]">{[0.4, 0.7, 0.2, 0.9, 0.5, 0.3, 0.8, 0.4, 0.6].map((h, i) => <div key={i} className="flex-1 bg-slate-300 rounded-full" style={{height: `${h*100}%`}}></div>)}</div>
                      </div>
                    ) : <p className="text-sm font-medium leading-relaxed text-left">{msg.text}</p>}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-500 font-bold">
                      <span>{msg.timestamp}</span>
                      {msg.sender !== 'customer' && <MessageStatus status={msg.status || 'sent'} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-[#f0f2f5] dark:bg-slate-900 flex flex-col gap-2">
              {aiSuggestion && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-brand/20 flex justify-between items-center animate-in slide-in-from-bottom duration-300">
                   <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 text-left"><Sparkles size={14} className="text-brand"/> {aiSuggestion}</p>
                   <button onClick={() => {setInputText(aiSuggestion); setAiSuggestion(null);}} className="px-4 py-2 bg-brand text-white text-[10px] font-black uppercase rounded-xl">Use</button>
                </div>
              )}
              <div className="flex items-center gap-2 h-14">
                {!isRecording && <button onClick={() => setShowProductPicker(true)} className="p-2.5 text-slate-500 hover:text-brand"><Box size={24}/></button>}
                <div className={`flex-1 bg-white dark:bg-slate-800 rounded-[1.5rem] px-4 flex items-center border border-transparent focus-within:border-brand/20 transition-all ${isRecording ? 'border-red-500/50 ring-2 ring-red-500/10' : ''}`}>
                  {isRecording ? (
                    <div className="flex-1 flex justify-between items-center text-xs font-bold text-red-500 py-3">
                      <div className="flex items-center gap-2">
                        <Circle size={10} className="fill-red-500 animate-pulse" />
                        <span className="uppercase tracking-widest">Recording Audio...</span>
                      </div>
                      <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
                    </div>
                  ) : (
                    <input 
                      type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type a message" 
                      className="w-full py-3 bg-transparent text-sm outline-none font-medium" 
                    />
                  )}
                </div>
                {inputText.trim() ? (
                  <button onClick={handleSend} className="p-3 bg-brand text-white rounded-full shadow-lg hover:scale-105 transition-transform"><Send size={20}/></button>
                ) : (
                  <button onClick={isRecording ? stopRecording : startRecording} className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white shadow-xl scale-110' : 'text-slate-500 hover:text-brand'}`}>
                    {isRecording ? <Square size={20}/> : <Mic size={24}/>}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center p-10">
            <div className="w-32 h-32 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6"><MessageSquare size={64}/></div>
            <h3 className="text-3xl font-bold font-outfit uppercase">TOTO Perimeter Ready</h3>
            <p className="text-xs font-black uppercase tracking-widest mt-3">Select a conversation node to begin authorized session.</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showStaffPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl">
             <div className="flex items-center justify-between mb-8"><h3 className="text-xl font-bold font-outfit uppercase">Assign Staff Node</h3><button onClick={() => setShowStaffPicker(false)}><X size={24}/></button></div>
             <div className="space-y-2">
                {staff.map(s => (
                  <button key={s.id} onClick={() => {assignStaff(selectedId!, s.name); setShowStaffPicker(false);}} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all">
                    <img src={s.avatar} className="w-10 h-10 rounded-full object-cover" />
                    <div><p className="text-sm font-bold">{s.name}</p><p className="text-[10px] font-black uppercase text-slate-400">{s.role}</p></div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[2rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
             <div className="flex items-center justify-between mb-8"><h3 className="text-xl font-bold font-outfit uppercase">Invoice</h3><button onClick={() => setShowInvoiceModal(false)}><X size={24}/></button></div>
             <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl mb-8"><p className="text-[9px] font-black uppercase text-slate-400 mb-2">Amount RM</p><input type="number" value={invoiceAmount} onChange={(e)=>setInvoiceAmount(e.target.value)} className="w-full bg-transparent text-3xl font-black font-outfit outline-none focus:text-brand" autoFocus /></div>
             <button onClick={() => {generateInvoice(selectedId!, parseFloat(invoiceAmount)); setShowInvoiceModal(false);}} className="w-full py-5 bg-brand text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-brand/30">Deploy Link</button>
          </div>
        </div>
      )}
    </div>
  );
};

const MessageStatus = ({ status }: { status: 'sent' | 'delivered' | 'read' }) => {
  if (status === 'sent') return <Check size={14} className="opacity-40" />;
  if (status === 'read') return <CheckCheck size={14} className="text-blue-500" />;
  return <CheckCheck size={14} className="opacity-40" />;
};

const FilterBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-[#f0f2f5] dark:bg-brand text-brand dark:text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
    {icon || label}
  </button>
);

export default Inbox;
