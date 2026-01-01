import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, MessageSquare, Zap, UserCheck, Paperclip, Send, CheckCheck, UserPlus, X, Box, Smartphone, Globe, LayoutGrid, PackageCheck, Mic, Square, CreditCard, Sparkles, RefreshCw } from 'lucide-react';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';
import { useApp } from '../App';
import { Platform } from '../types';
import { gemini } from '../services/gemini';

const Inbox: React.FC = () => {
  const { searchQuery, conversations, setConversations, staff, sendMessage, products, assignStaff, generateInvoice } = useApp();
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

  const fetchAiSuggestion = async () => {
    if (!activeChat) return;
    setIsAiLoading(true);
    const context = activeChat.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    const lastCustomerMsg = activeChat.messages.filter(m => m.sender === 'customer').pop()?.text || "";
    const suggestion = await gemini.getAiResponseSuggestion(context, lastCustomerMsg);
    setAiSuggestion(suggestion);
    setIsAiLoading(false);
  };

  const handleGenerateInvoice = () => {
    if (!selectedId) return;
    generateInvoice(selectedId, parseFloat(invoiceAmount));
    setShowInvoiceModal(false);
    setInvoiceAmount('0');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedId) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const url = re.target?.result as string;
        sendMessage(selectedId, `Sent a file: ${file.name}`, 'staff', 'image', url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendProduct = (p: any) => {
    if (!selectedId) return;
    const msg = `Recommended: ${p.name}\nPrice: RM ${p.price}\nSKU: ${p.sku}`;
    sendMessage(selectedId, msg, 'staff', 'image', p.image);
    setShowProductPicker(false);
  };

  const handleHandover = (staffName: string) => {
    if (!selectedId) return;
    assignStaff(selectedId, staffName);
    setShowStaffPicker(false);
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
      sendMessage(selectedId, `Voice Message (${recordingTime}s)`, 'staff', 'voice');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full bg-surface dark:bg-slate-950 overflow-hidden relative">
      {/* Thread List */}
      <div className={`flex flex-col border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 ${selectedId ? 'hidden md:flex md:w-[380px]' : 'flex w-full md:w-[380px]'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-outfit">TOTO Signals</h2>
          </div>
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
                  <div className="min-w-0">
                    <h4 className={`text-sm font-bold truncate ${selectedId === conv.id ? 'text-white' : ''}`}>{conv.customerName}</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{conv.assignedStaff || 'Managed by TOTO'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] opacity-60 font-bold">{conv.lastTimestamp}</span>
                  {conv.unreadCount > 0 && <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">{conv.unreadCount}</span>}
                </div>
              </div>
              <p className="text-[11px] truncate opacity-80">{conv.isHumanTakeover ? '● MANUAL ' : ''} {conv.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Pane */}
      <div className={`flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative ${selectedId ? 'flex' : 'hidden md:flex'}`}>
        {selectedId ? (
          <>
            <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedId(null)} className="p-2 -ml-2 text-slate-500 md:hidden"><ChevronLeft size={24} /></button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/5 border border-brand/20 flex items-center justify-center text-brand font-black text-base font-outfit relative">
                    {activeChat?.customerName.charAt(0)}
                    <div className="absolute -bottom-1 -right-1">
                      {activeChat?.platform === 'whatsapp' && <WhatsAppIcon size={16} />}
                      {activeChat?.platform === 'instagram' && <InstagramIcon size={16} />}
                      {activeChat?.platform === 'tiktok' && <TikTokIcon size={16} />}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm font-outfit leading-none">{activeChat?.customerName}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase mt-1.5 flex items-center gap-1">
                      {activeChat?.assignedStaff ? <UserCheck size={10} className="text-amber-500" /> : <Zap size={10} className="text-brand" />}
                      {activeChat?.assignedStaff ? `Staff: ${activeChat.assignedStaff}` : 'TOTO Agent Active'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowInvoiceModal(true)} 
                  className="hidden sm:flex px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <CreditCard size={14} /> Invoice
                </button>
                <button 
                  onClick={() => setShowStaffPicker(true)} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${activeChat?.isHumanTakeover ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-200'}`}
                >
                  {activeChat?.isHumanTakeover ? 'Change Agent' : 'Takeover'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none bg-white dark:bg-slate-950">
              {activeChat?.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                  <MessageSquare size={48} />
                  <p className="text-sm font-black uppercase tracking-widest">History Log Synchronizing...</p>
                </div>
              ) : activeChat?.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm ${msg.sender === 'customer' ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100' : (msg.sender === 'ai' ? 'bg-brand/10 border border-brand/20 text-brand' : 'bg-brand text-white')}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">{msg.sender}</p>
                    {msg.type === 'image' && msg.mediaUrl && (
                      <img src={msg.mediaUrl} className="w-full max-w-[240px] rounded-xl mb-3 shadow-md" />
                    )}
                    <p className="text-sm font-medium whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-2 text-[9px] opacity-60">
                      <span>{msg.timestamp}</span>
                      {msg.sender !== 'customer' && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-4">
              {aiSuggestion && (
                <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={12} /> TOTO Suggestion
                    </p>
                    <button onClick={() => setAiSuggestion(null)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 italic mb-4">"{aiSuggestion}"</p>
                  <div className="flex gap-2">
                    <button onClick={() => {setInputText(aiSuggestion); setAiSuggestion(null);}} className="text-[9px] font-black uppercase tracking-widest text-brand border border-brand/20 px-3 py-1.5 rounded-lg hover:bg-brand/10">Apply</button>
                    <button onClick={() => {sendMessage(selectedId!, aiSuggestion, 'staff'); setAiSuggestion(null);}} className="text-[9px] font-black uppercase tracking-widest bg-brand text-white px-3 py-1.5 rounded-lg">Send Now</button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-brand"><Paperclip size={20} /></button>
                <button onClick={() => setShowProductPicker(true)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-brand"><Box size={20} /></button>
                <button 
                  onClick={fetchAiSuggestion} 
                  disabled={isAiLoading}
                  className="p-3 bg-brand/10 text-brand rounded-xl hover:bg-brand hover:text-white transition-all disabled:opacity-50"
                  title="Generate TOTO Suggestion"
                >
                  {isAiLoading ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                </button>
                <div className="flex-1 relative">
                  {isRecording ? (
                    <div className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border border-red-200 dark:border-red-900 rounded-2xl text-sm font-bold text-red-500 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Recording TOTO Voice...
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
                        placeholder={activeChat?.isHumanTakeover ? "Staff typing override..." : "Monitoring mode..."} 
                        className="w-full pl-5 pr-12 py-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:border-brand outline-none font-medium" 
                      />
                      <button onClick={handleSend} className="absolute right-2 top-2 p-2 bg-brand text-white rounded-lg hover:scale-105 transition-all shadow-lg shadow-brand/20"><Send size={18} /></button>
                    </>
                  )}
                </div>
                <button 
                  onClick={isRecording ? stopRecording : startRecording} 
                  className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand'}`}
                >
                  {isRecording ? <Square size={20} /> : <Mic size={20} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-400 p-10 text-center">
            <div className="w-24 h-24 bg-brand/5 rounded-[2rem] flex items-center justify-center mb-6 border border-brand/10 shadow-inner">
              <MessageSquare size={48} className="opacity-20" />
            </div>
            <h3 className="text-2xl font-bold font-outfit text-slate-800 dark:text-white">Central Inbox</h3>
            <p className="mt-2 text-sm max-w-xs opacity-60">Pick a signal feed to begin monitoring or human takeover logic. TOTO AI handles initial qualification autonomously.</p>
          </div>
        )}
      </div>

      {/* Invoice Generator Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-outfit">Deploy Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 text-slate-400"><X size={24}/></button>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Shopify Integration Active</p>
                 <div className="flex items-center gap-3">
                    <span className="text-2xl font-black font-outfit">RM</span>
                    <input 
                      type="number" 
                      value={invoiceAmount} 
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      className="w-full bg-transparent text-3xl font-black font-outfit outline-none" 
                      autoFocus
                    />
                 </div>
              </div>
              <button 
                onClick={handleGenerateInvoice}
                className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Send Shopify Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Picker Modal */}
      {showStaffPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold font-outfit">Signal Handover</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Select agent to manage this lead</p>
              </div>
              <button onClick={() => setShowStaffPicker(false)} className="p-2 text-slate-400"><X size={24}/></button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none">
              {staff.map((s) => (
                <button 
                  key={s.id} 
                  onClick={() => handleHandover(s.name)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${s.active ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-brand' : 'opacity-40 grayscale cursor-not-allowed'}`}
                  disabled={!s.active}
                >
                  <img src={s.avatar} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{s.name}</p>
                    <p className="text-[10px] uppercase text-slate-400 font-black tracking-widest">{s.role}</p>
                  </div>
                  {s.active && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Library Picker */}
      {showProductPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold font-outfit flex items-center gap-3"><PackageCheck className="text-brand" /> Media Assets</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Direct from Shopify catalog</p>
              </div>
              <button onClick={() => setShowProductPicker(false)} className="p-2 text-slate-400"><X size={24}/></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto scrollbar-none pr-2">
              {products.map((p) => (
                <button 
                  key={p.id} 
                  onClick={() => handleSendProduct(p)}
                  className="group flex flex-col p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-brand text-left transition-all hover:scale-[1.02] shadow-sm"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <p className="text-xs font-bold truncate leading-none">{p.name}</p>
                  <p className="text-[10px] font-black text-brand mt-2 uppercase">RM {p.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center py-3 rounded-xl text-xs font-black uppercase transition-all ${active ? 'bg-white dark:bg-brand text-brand dark:text-white shadow-xl shadow-brand/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
    {icon || label}
  </button>
);

export default Inbox;