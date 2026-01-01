
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, MessageSquare, Zap, UserCheck, Paperclip, Send, CheckCheck, Check, X, Box, Smartphone, Mic, Square, CreditCard, Sparkles, RefreshCw, Play, UserPlus, Info } from 'lucide-react';
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
  }, [selectedId, markAsOpened]);

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
    const context = activeChat.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const lastCustomerMsg = activeChat.messages.filter(m => m.sender === 'customer').pop()?.text || "";
    const suggestion = await gemini.getAiResponseSuggestion(context, lastCustomerMsg);
    setAiSuggestion(suggestion);
    setIsAiLoading(false);
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
  };

  const handleAssign = (staffName: string) => {
    if (selectedId) {
      assignStaff(selectedId, staffName);
      setShowStaffPicker(false);
    }
  };

  const handleInvoiceDeploy = () => {
    if (selectedId && parseFloat(invoiceAmount) > 0) {
      generateInvoice(selectedId, parseFloat(invoiceAmount));
      setShowInvoiceModal(false);
      setInvoiceAmount('0');
    }
  };

  const handleSelectProduct = (p: any) => {
    if (selectedId) {
      sendMessage(selectedId, `Product Detail: ${p.name} - RM ${p.price}. SKU: ${p.sku}`, 'staff');
      setShowProductPicker(false);
    }
  };

  return (
    <div className="flex h-full bg-surface dark:bg-slate-950 overflow-hidden relative">
      {/* Thread List - Hidden on mobile if a chat is selected */}
      <div className={`flex flex-col border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 ${selectedId ? 'hidden md:flex md:w-[380px]' : 'flex w-full md:w-[380px]'}`}>
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold font-outfit uppercase tracking-tighter">Inbox Signals</h2>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <FilterBtn active={platformFilter === 'all'} onClick={() => setPlatformFilter('all')} label="All" />
            <FilterBtn active={platformFilter === 'whatsapp'} onClick={() => setPlatformFilter('whatsapp')} icon={<WhatsAppIcon size={16} />} />
            <FilterBtn active={platformFilter === 'instagram'} onClick={() => setPlatformFilter('instagram')} icon={<InstagramIcon size={16} />} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 scrollbar-none">
          {filteredConversations.map(conv => (
            <div key={conv.id} onClick={() => setSelectedId(conv.id)} className={`p-4 rounded-2xl cursor-pointer transition-all ${selectedId === conv.id ? 'bg-brand text-white shadow-xl scale-[1.01]' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-outfit ${selectedId === conv.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {conv.customerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-bold truncate ${selectedId === conv.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{conv.customerName}</h4>
                    <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${selectedId === conv.id ? 'opacity-80' : 'text-slate-400'}`}>
                      {conv.assignedStaff ? <UserCheck size={10} /> : <Zap size={10} />}
                      {conv.assignedStaff || 'AI Node'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className={`text-[10px] font-bold ${selectedId === conv.id ? 'opacity-70' : 'text-slate-400'}`}>{conv.lastTimestamp}</span>
                   {conv.unreadCount > 0 && <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-black">{conv.unreadCount}</span>}
                </div>
              </div>
              <p className={`text-[11px] truncate ${selectedId === conv.id ? 'opacity-90' : 'text-slate-500'}`}>{conv.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Pane */}
      <div className={`flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative ${selectedId ? 'flex' : 'hidden md:flex'}`}>
        {selectedId ? (
          <>
            <div className="h-16 sm:h-20 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between shadow-sm sticky top-0 z-20">
              <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                <button onClick={() => setSelectedId(null)} className="p-2 -ml-2 text-slate-500 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-lg font-outfit shadow-inner">
                    {activeChat?.customerName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-sm sm:text-base font-outfit leading-none truncate">{activeChat?.customerName}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase mt-1.5 flex items-center gap-1">
                      {activeChat?.assignedStaff ? <UserCheck size={10} className="text-amber-500" /> : <Zap size={10} className="text-brand" />}
                      {activeChat?.assignedStaff || 'TOTO AI Control'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowInvoiceModal(true)} className="hidden sm:flex px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                  <CreditCard size={14} /> Invoice
                </button>
                <button onClick={() => setShowStaffPicker(true)} className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:border-brand transition-all">
                   <UserPlus size={14} className="sm:hidden" />
                   <span className="hidden sm:inline">Assign Agent</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 scrollbar-none bg-white dark:bg-slate-950">
              {activeChat?.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm relative ${msg.sender === 'customer' ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none' : 'bg-brand text-white shadow-lg shadow-brand/10 rounded-tr-none'}`}>
                    <div className="flex items-center justify-between mb-1.5 opacity-60">
                      <p className="text-[9px] font-black uppercase tracking-widest">{msg.sender === 'staff' ? (activeChat?.assignedStaff || 'Staff') : msg.sender}</p>
                      {activeChat?.platform === 'whatsapp' && <WhatsAppIcon size={12} />}
                    </div>
                    {msg.type === 'voice' ? (
                      <div className="flex items-center gap-4 py-2 px-3 bg-white/10 rounded-2xl">
                        <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
                          <Play size={18} fill="white"/>
                        </button>
                        <div className="flex-1">
                           <div className="flex gap-0.5 items-center h-6">
                              {[0.4, 0.7, 0.5, 0.9, 0.3, 0.6, 0.8, 0.4, 0.7, 0.2, 0.5].map((h, i) => (
                                <div key={i} className="flex-1 bg-white/40 rounded-full" style={{ height: `${h * 100}%` }}></div>
                              ))}
                           </div>
                           <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1">{msg.text}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}
                    <div className="flex items-center justify-end gap-1.5 mt-2 text-[9px] opacity-70 font-bold">
                      <span>{msg.timestamp}</span>
                      {msg.sender !== 'customer' && <MessageStatus status={msg.status || 'read'} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 sm:p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-3">
              {aiSuggestion && (
                <div className="p-4 bg-brand/5 border border-brand/20 rounded-[1.5rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in slide-in-from-bottom-2">
                   <div className="flex items-center gap-3">
                      <Sparkles size={18} className="text-brand shrink-0" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">{aiSuggestion}</p>
                   </div>
                   <button onClick={() => {setInputText(aiSuggestion); setAiSuggestion(null);}} className="w-full sm:w-auto px-4 py-2 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand/20 hover:scale-[1.05] transition-all">Use Sugestion</button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => setShowProductPicker(true)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-brand transition-all hover:bg-brand/10"><Box size={22} /></button>
                <button onClick={fetchAiSuggestion} className={`p-3 rounded-xl transition-all ${isAiLoading ? 'bg-brand text-white animate-pulse shadow-brand/20 shadow-lg' : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'}`}>
                  {isAiLoading ? <RefreshCw className="animate-spin" size={22} /> : <Sparkles size={22} />}
                </button>
                <div className="flex-1 relative">
                  {isRecording ? (
                    <div className="w-full px-5 py-3.5 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl flex justify-between items-center text-xs font-black border border-red-100 dark:border-red-900/40">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                        Recording Signal...
                      </span>
                      <span className="font-mono">{recordingTime}s</span>
                    </div>
                  ) : (
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={inputText} 
                        onChange={(e) => setInputText(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                        placeholder="Authorize response signal..." 
                        className="w-full pl-5 pr-14 py-4 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-brand/40 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-sm outline-none font-medium transition-all shadow-sm" 
                      />
                      <button onClick={handleSend} disabled={!inputText.trim()} className="absolute right-2.5 top-2.5 p-2 bg-brand text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30">
                        <Send size={20} />
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={isRecording ? stopRecording : startRecording} className={`p-3 rounded-xl shadow-sm transition-all ${isRecording ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500'}`}>
                  {isRecording ? <Square size={22} /> : <Mic size={22} />}
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

      {/* Staff Picker Modal */}
      {showStaffPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-200">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold font-outfit uppercase tracking-tighter">Assign Staff Node</h3>
               <button onClick={() => setShowStaffPicker(false)} className="p-2 text-slate-400"><X size={24}/></button>
             </div>
             <div className="space-y-2">
                {staff.map(s => (
                  <button key={s.id} onClick={() => handleAssign(s.name)} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group">
                    <img src={s.avatar} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-bold group-hover:text-brand transition-colors">{s.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.role.replace('_', ' ')}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-200 max-h-[80vh] flex flex-col">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold font-outfit uppercase tracking-tighter">Inventory Nodes</h3>
               <button onClick={() => setShowProductPicker(false)} className="p-2 text-slate-400"><X size={24}/></button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none">
                {products.map(p => (
                  <button key={p.id} onClick={() => handleSelectProduct(p)} className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:border-brand border border-transparent transition-all text-left">
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{p.name}</p>
                      <p className="text-xs font-black font-outfit text-brand">RM {p.price}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-outfit uppercase tracking-tighter">Shopify Checkout</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Authorize Amount (RM)</p>
               <input 
                  type="number" 
                  value={invoiceAmount} 
                  onChange={(e)=>setInvoiceAmount(e.target.value)} 
                  className="w-full bg-transparent text-4xl font-black font-outfit outline-none focus:text-brand" 
                  autoFocus
               />
            </div>
            <button onClick={handleInvoiceDeploy} className="w-full py-5 bg-brand text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-brand/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
              <CreditCard size={18} /> Deploy Node Link
            </button>
            <p className="mt-6 text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Info size={12}/> Link expires in 24 hours
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const MessageStatus = ({ status }: { status?: 'sent' | 'delivered' | 'read' }) => {
  return (
    <div className="flex items-center -space-x-1 scale-[0.85] ml-1">
      {status === 'sent' && <Check size={14} className="opacity-40" />}
      {status === 'delivered' && <CheckCheck size={14} className="opacity-40" />}
      {status === 'read' && <CheckCheck size={14} className="text-blue-400" />}
    </div>
  );
};

const FilterBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white dark:bg-brand text-brand dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
    {icon || label}
  </button>
);

export default Inbox;
