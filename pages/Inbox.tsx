
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, MessageSquare, Zap, UserCheck, Paperclip, Send, CheckCheck, Check, X, Box, Smartphone, Mic, Square, CreditCard, Sparkles, RefreshCw, Volume2 } from 'lucide-react';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';
import { useApp } from '../App';
import { Platform } from '../types';
import { gemini } from '../services/gemini';

const Inbox: React.FC = () => {
  const { searchQuery, conversations, staff, sendMessage, products, assignStaff, generateInvoice } = useApp();
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

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (platformFilter !== 'all') list = list.filter(c => c.platform === platformFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.customerName.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
    }
    return list;
  }, [conversations, platformFilter, searchQuery]);

  const activeChat = useMemo(() => conversations.find(c => c.id === selectedId), [conversations, selectedId]);

  useEffect(() => { 
    if (activeChat) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [activeChat?.messages]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;
    sendMessage(selectedId, inputText, 'staff');
    setInputText('');
    setAiSuggestion(null);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    if (selectedId && recordingTime > 0) {
      sendMessage(selectedId, `Voice Note (${formatTime(recordingTime)})`, 'staff', 'voice');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchAiSuggestion = async () => {
    if (!activeChat) return;
    setIsAiLoading(true);
    const context = activeChat.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const lastCustomerMsg = activeChat.messages.filter(m => m.sender === 'customer').pop()?.text || "";
    const suggestion = await gemini.getAiResponseSuggestion(context, lastCustomerMsg);
    setAiSuggestion(suggestion);
    setIsAiLoading(false);
  };

  return (
    <div className="flex h-full bg-surface dark:bg-slate-950 overflow-hidden relative">
      {/* Thread List */}
      <div className={`flex flex-col border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 ${selectedId ? 'hidden md:flex md:w-[380px]' : 'flex w-full md:w-[380px]'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-900 space-y-6">
          <h2 className="text-2xl font-bold font-outfit uppercase tracking-tighter">Signals Hub</h2>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <FilterBtn active={platformFilter === 'all'} onClick={() => setPlatformFilter('all')} label="All" />
            <FilterBtn active={platformFilter === 'whatsapp'} onClick={() => setPlatformFilter('whatsapp')} icon={<WhatsAppIcon size={16} />} />
            <FilterBtn active={platformFilter === 'instagram'} onClick={() => setPlatformFilter('instagram')} icon={<InstagramIcon size={16} />} />
            <FilterBtn active={platformFilter === 'tiktok'} onClick={() => setPlatformFilter('tiktok')} icon={<TikTokIcon size={16} className="dark:text-white" />} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
          {filteredConversations.map(conv => (
            <div key={conv.id} onClick={() => setSelectedId(conv.id)} className={`p-4 rounded-xl cursor-pointer transition-all ${selectedId === conv.id ? 'bg-brand text-white shadow-xl scale-[1.02]' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm font-outfit ${selectedId === conv.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{conv.customerName.charAt(0)}</div>
                  <div className="min-w-0 text-left">
                    <h4 className={`text-sm font-bold truncate ${selectedId === conv.id ? 'text-white' : ''}`}>{conv.customerName}</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{conv.assignedStaff || 'TOTO Logic'}</span>
                  </div>
                </div>
                <span className="text-[10px] opacity-60 font-bold">{conv.lastTimestamp}</span>
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
                <button onClick={() => setSelectedId(null)} className="p-2 -ml-2 text-slate-500 md:hidden"><ChevronLeft size={24} /></button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/5 flex items-center justify-center text-brand font-black text-base font-outfit relative">
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
                <button onClick={() => setShowInvoiceModal(true)} className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><CreditCard size={14} /> Invoice</button>
                <button onClick={() => setShowStaffPicker(true)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase border border-slate-200 dark:border-slate-700">Assign</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none bg-white dark:bg-slate-950">
              {activeChat?.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm text-left ${msg.sender === 'customer' ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100' : 'bg-brand text-white'}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">{msg.sender}</p>
                    {msg.type === 'voice' ? (
                      <div className="flex items-center gap-3 p-2 bg-white/10 rounded-xl mb-1">
                        <div className="p-2 bg-white/20 rounded-full text-white"><Volume2 size={14}/></div>
                        <div className="flex-1 h-1 bg-white/30 rounded-full relative overflow-hidden">
                           <div className="absolute inset-0 bg-white/50 w-1/2 rounded-full"></div>
                        </div>
                        <span className="text-[10px] font-bold">Voice Clip</span>
                      </div>
                    ) : (
                      <p className="text-sm font-medium">{msg.text}</p>
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
              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl"><Paperclip size={20} /></button>
                <div className="flex-1 relative">
                  {isRecording ? (
                    <div className="w-full px-5 py-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-xs font-bold text-red-500 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Voice Telemetry Active...
                      </span>
                      <span>{formatTime(recordingTime)}</span>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="text" 
                        value={inputText} 
                        onChange={(e) => setInputText(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                        placeholder="Type a message or use AI suggest..." 
                        className="w-full pl-5 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none" 
                      />
                      <button onClick={handleSend} className="absolute right-2 top-1.5 p-2 bg-brand text-white rounded-lg"><Send size={18} /></button>
                    </>
                  )}
                </div>
                <button 
                  onClick={isRecording ? stopRecording : startRecording} 
                  className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white shadow-xl' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                >
                  {isRecording ? <Square size={20} /> : <Mic size={20} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30">
            <MessageSquare size={64} />
            <h3 className="text-xl font-bold font-outfit mt-4">Signal Terminal</h3>
          </div>
        )}
      </div>

      {/* Modals placeholders for staff/invoice/products consistent with previous file but simplified for focus */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 border border-slate-200">
            <h3 className="text-xl font-bold font-outfit uppercase mb-6">Send Invoice</h3>
            <input type="number" value={invoiceAmount} onChange={(e)=>setInvoiceAmount(e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl mb-4 text-xl font-bold outline-none" />
            <button onClick={()=>{generateInvoice(selectedId!, parseFloat(invoiceAmount)); setShowInvoiceModal(false);}} className="w-full py-4 bg-brand text-white rounded-xl font-black uppercase">Generate Node Link</button>
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
      {status === 'sent' && <Check size={14} className="text-white/60" />}
      {status === 'delivered' && <CheckCheck size={14} className="text-white/60" />}
      {status === 'read' && <CheckCheck size={14} className="text-white text-blue-300" />}
    </div>
  );
};

const FilterBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-[10px] font-black uppercase ${active ? 'bg-white dark:bg-brand text-brand dark:text-white shadow-sm' : 'text-slate-400'}`}>
    {icon || label}
  </button>
);

export default Inbox;
