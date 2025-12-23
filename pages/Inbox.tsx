import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, MessageSquare, Zap, UserCheck, Paperclip, Send, CheckCheck, UserPlus, X, Box, Smartphone, Globe, LayoutGrid, PackageCheck, Mic, Square } from 'lucide-react';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';
import { useApp } from '../App';
import { Platform } from '../types';

const Inbox: React.FC = () => {
  const { searchQuery, conversations, setConversations, staff, sendMessage, products, assignStaff } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all');
  const [inputText, setInputText] = useState('');
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
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
    if (activeChat) chatEndRef.current?.scrollIntoView({ behavior: 'auto' }); 
  }, [activeChat?.messages]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;
    sendMessage(selectedId, inputText, 'staff');
    setInputText('');
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

  const toggleTakeover = (id: string, state: boolean) => {
    setConversations(conversations.map(c => c.id === id ? { ...c, isHumanTakeover: state } : c));
    if (state) setShowStaffPicker(true);
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
            <h2 className="text-2xl font-bold font-outfit">Feed</h2>
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
            <div key={conv.id} onClick={() => setSelectedId(conv.id)} className={`p-4 rounded-xl cursor-pointer ${selectedId === conv.id ? 'bg-brand text-white shadow-md' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm font-outfit ${selectedId === conv.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{conv.customerName.charAt(0)}</div>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-bold truncate ${selectedId === conv.id ? 'text-white' : ''}`}>{conv.customerName}</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{conv.assignedStaff || 'Unassigned'}</span>
                  </div>
                </div>
                <span className="text-[10px] opacity-60">{conv.lastTimestamp}</span>
              </div>
              <p className="text-[11px] truncate opacity-80">{conv.isHumanTakeover ? '● HANDOVER ' : ''} {conv.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Pane */}
      <div className={`flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative ${selectedId ? 'flex' : 'hidden md:flex'}`}>
        {selectedId ? (
          <>
            <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedId(null)} className="p-2 -ml-2 text-slate-500 md:hidden"><ChevronLeft size={24} /></button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/5 border border-brand/20 flex items-center justify-center text-brand font-black text-base font-outfit">{activeChat?.customerName.charAt(0)}</div>
                  <div>
                    <h3 className="font-bold text-sm font-outfit leading-none">{activeChat?.customerName}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase mt-1.5 flex items-center gap-1">
                      {activeChat?.assignedStaff ? <UserCheck size={10} className="text-amber-500" /> : <Zap size={10} className="text-brand" />}
                      {activeChat?.assignedStaff ? `Node: ${activeChat.assignedStaff}` : 'AI Automated'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowStaffPicker(true)} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${activeChat?.isHumanTakeover ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}
                >
                  {activeChat?.isHumanTakeover ? 'Handed Over' : 'Handover to Staff'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none bg-white dark:bg-slate-950">
              {activeChat?.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.sender === 'customer' ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100' : 'bg-brand text-white'}`}>
                    {msg.type === 'image' && msg.mediaUrl && (
                      <img src={msg.mediaUrl} className="w-full max-w-[240px] rounded-xl mb-3 shadow-md" />
                    )}
                    {msg.type === 'voice' && (
                      <div className="flex items-center gap-3 min-w-[160px]">
                        <Mic size={18} />
                        <div className="flex-1 h-1 bg-white/30 rounded-full relative overflow-hidden">
                          <div className="absolute inset-0 bg-white w-1/3"></div>
                        </div>
                        <span className="text-[10px] font-bold">0:00</span>
                      </div>
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

            <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-brand"><Paperclip size={20} /></button>
                <button onClick={() => setShowProductPicker(true)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-brand"><Box size={20} /></button>
                <button 
                  onClick={isRecording ? stopRecording : startRecording} 
                  className={`p-3 rounded-xl ${isRecording ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand'}`}
                >
                  {isRecording ? <Square size={20} /> : <Mic size={20} />}
                </button>
                <div className="flex-1 relative">
                  {isRecording ? (
                    <div className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border border-red-200 dark:border-red-900 rounded-2xl text-sm font-bold text-red-500 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Recording Voice Node...
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
                        placeholder={activeChat?.isHumanTakeover ? "Staff typing override..." : "AI Monitoring mode..."} 
                        className="w-full pl-5 pr-12 py-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:border-brand outline-none" 
                      />
                      <button onClick={handleSend} className="absolute right-2 top-2 p-2 bg-brand text-white rounded-lg"><Send size={18} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-400">
            <MessageSquare size={64} className="opacity-10 mb-6" />
            <h3 className="text-xl font-bold font-outfit">Select a Signal Feed</h3>
            <p className="mt-2 text-sm opacity-60">Handover or monitoring logic requires an active feed selection.</p>
          </div>
        )}
      </div>

      {/* Staff Picker Modal */}
      {showStaffPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-outfit">Handover to Agent</h3>
              <button onClick={() => setShowStaffPicker(false)} className="p-2 text-slate-400"><X size={24}/></button>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Node Agent</p>
            <div className="space-y-2">
              {staff.map((s) => (
                <button 
                  key={s.id} 
                  onClick={() => handleHandover(s.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left bg-slate-50 dark:bg-slate-800 hover:border-brand`}
                >
                  <img src={s.avatar} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-bold">{s.name}</p>
                    <p className="text-[10px] uppercase text-slate-400 font-black">{s.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Library Picker */}
      {showProductPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold font-outfit flex items-center gap-3"><PackageCheck className="text-brand" /> Media Assets (Shopify)</h3>
              <button onClick={() => setShowProductPicker(false)} className="p-2 text-slate-400"><X size={24}/></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-h-[400px] overflow-y-auto scrollbar-none pr-2">
              {products.map((p) => (
                <button 
                  key={p.id} 
                  onClick={() => handleSendProduct(p)}
                  className="group flex flex-col p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-brand text-left"
                >
                  <img src={p.image} className="w-full h-32 object-cover rounded-xl mb-3" />
                  <p className="text-xs font-bold truncate">{p.name}</p>
                  <p className="text-[10px] font-black text-brand mt-1 uppercase">RM {p.price}</p>
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
  <button onClick={onClick} className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-xs font-black uppercase ${active ? 'bg-white dark:bg-brand text-brand dark:text-white shadow-sm' : 'text-slate-400'}`}>
    {icon || label}
  </button>
);

export default Inbox;