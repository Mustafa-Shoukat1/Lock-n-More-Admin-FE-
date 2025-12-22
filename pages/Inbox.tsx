import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, Send, Phone, Video, Info, MoreHorizontal,
  CheckCheck, Smile, Paperclip, Mic, UserCheck, 
  BrainCircuit, TrendingUp, Command, Package
} from 'lucide-react';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/Icons';
import { useTranslation } from '../App';
import { Platform, Message, Conversation } from '../types';

const mockConversations: Conversation[] = [
  {
    id: '1',
    customerName: 'Beh Chen',
    customerPhone: '+60 12-345 6789',
    platform: 'whatsapp',
    lastMessage: 'Do you have the digital smart lock for sliding doors?',
    lastTimestamp: '10:42 AM',
    unreadCount: 2,
    isHumanTakeover: false,
    priority: 'high',
    status: 'active',
    messages: [
      { id: 'm1', sender: 'customer', text: 'Hi, I saw your ad for digital locks.', timestamp: '10:40 AM', type: 'text' },
      { id: 'm2', sender: 'ai', text: 'Hello Beh! Welcome to Locks & More. I am SM Agent. How can I help you secure your home today?', timestamp: '10:41 AM', type: 'text' },
      { id: 'm3', sender: 'customer', text: 'Do you have the digital smart lock for sliding doors?', timestamp: '10:42 AM', type: 'text' },
    ]
  },
  {
    id: '2',
    customerName: 'Sarah Lim',
    customerPhone: '@sarah_l',
    platform: 'instagram',
    lastMessage: 'Thanks for the info!',
    lastTimestamp: '09:15 AM',
    unreadCount: 0,
    isHumanTakeover: false,
    priority: 'low',
    status: 'active',
    messages: []
  },
  {
    id: '3',
    customerName: 'Ahmad Faiz',
    customerPhone: '@faiz_locks',
    platform: 'tiktok',
    lastMessage: 'Can I see more photos of A100?',
    lastTimestamp: 'Yesterday',
    unreadCount: 5,
    isHumanTakeover: true,
    priority: 'medium',
    status: 'pending',
    messages: []
  },
];

const Inbox: React.FC = () => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedId, setSelectedId] = useState(mockConversations[0].id);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find(c => c.id === selectedId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const toggleTakeover = (id: string) => {
    setConversations(conversations.map(c => 
      c.id === id ? { ...c, isHumanTakeover: !c.isHumanTakeover } : c
    ));
  };

  const PlatformIcon = ({ platform }: { platform: Platform }) => {
    switch (platform) {
      case 'whatsapp': return <WhatsAppIcon size={16} />;
      case 'instagram': return <InstagramIcon size={16} />;
      case 'tiktok': return <TikTokIcon size={16} className="text-slate-900 dark:text-white" />;
    }
  };

  return (
    <div className="flex h-full bg-surface dark:bg-[#0F172A] overflow-hidden">
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-sidebar transition-all duration-300">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter chats..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 px-3 bg-brand text-white rounded-lg text-xs font-bold shadow-md shadow-brand/20 flex items-center justify-center gap-1.5">
              <Filter size={12} /> All
            </button>
            <button className="flex-1 py-2 px-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 hover:bg-white dark:hover:bg-slate-700 transition-all">
              <BrainCircuit size={12} /> AI
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`p-5 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-all ${selectedId === conv.id ? 'bg-brand/5 border-l-4 border-l-brand' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 font-outfit text-lg">
                    {conv.customerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">{conv.customerName}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <PlatformIcon platform={conv.platform} />
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{conv.platform}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">{conv.lastTimestamp}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate line-clamp-1">{conv.lastMessage}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  {conv.isHumanTakeover && <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-lg font-black">{t('manual')}</span>}
                  {conv.unreadCount > 0 && <span className="text-[10px] px-2 py-0.5 bg-brand text-white rounded-lg font-black">{conv.unreadCount}</span>}
                </div>
                {conv.priority === 'high' && <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-white dark:border-slate-900 shadow-lg shadow-red-500/50"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeChat ? (
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-primary/50 relative">
          <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-surface flex items-center justify-between shadow-sm z-10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center font-bold text-brand font-outfit">
                {activeChat.customerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white font-outfit">{activeChat.customerName}</h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <p className="text-xs text-slate-500 font-bold">{activeChat.customerPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => toggleTakeover(activeChat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${!activeChat.isHumanTakeover ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  <BrainCircuit size={14} /> {t('aiMode')}
                </button>
                <button 
                  onClick={() => toggleTakeover(activeChat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeChat.isHumanTakeover ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  <UserCheck size={14} /> {t('takeover')}
                </button>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
              <button className="p-2.5 text-slate-400 hover:text-brand transition-all"><MoreHorizontal size={20} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {activeChat.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] rounded-3xl p-5 shadow-sm transition-all ${
                  msg.sender === 'customer' 
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none' 
                    : msg.sender === 'ai' 
                      ? 'bg-brand text-white rounded-tr-none shadow-brand/20 shadow-lg' 
                      : 'bg-slate-900 dark:bg-slate-700 text-white rounded-tr-none'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1.5 mt-2 text-[10px] font-bold ${msg.sender === 'customer' ? 'text-slate-400' : 'text-white/60'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.sender !== 'customer' && <CheckCheck size={14} />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 bg-surface border-t border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-brand rounded-2xl transition-all border border-slate-200 dark:border-slate-700"><Paperclip size={20} /></button>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeChat.isHumanTakeover ? "Tulis bantuan manual..." : "AI sedang memantau perbualan..."}
                    className="w-full pl-6 pr-14 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand font-medium shadow-inner"
                  />
                  <button className="absolute right-3 top-2.5 p-2.5 bg-brand text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-brand/20 transition-all active:scale-90">
                    <Send size={18} />
                  </button>
                </div>
                <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-2xl transition-all border border-slate-200 dark:border-slate-700"><Mic size={20} /></button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-brand/10 text-brand rounded-xl text-[10px] font-black uppercase tracking-wider border border-brand/20 hover:bg-brand/20 transition-all">
                    Generate Payment Link
                  </button>
                  <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    Send Catalog
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  System: Online
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-primary/50 text-slate-400">
          <div className="w-24 h-24 bg-surface dark:bg-slate-800 rounded-full flex items-center justify-center shadow-2xl mb-8">
            <WhatsAppIcon size={48} className="opacity-20" />
          </div>
          <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-400 font-outfit">Sila Pilih Sembang</h3>
          <p className="text-sm max-w-xs text-center mt-3 font-medium opacity-60">Pilih satu perbualan dari senarai kiri untuk mula memantau prestasi AI.</p>
        </div>
      )}

      {activeChat && (
        <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-surface flex flex-col transition-all duration-300">
          <div className="p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 font-outfit flex items-center gap-2">
              <Info size={18} className="text-brand" /> {t('customerContext')}
            </h3>
            
            <div className="space-y-8">
              <div className="p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                <p className="text-[10px] text-brand uppercase font-black mb-4 tracking-widest">Sentiment</p>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand/10 rounded-2xl text-brand"><TrendingUp size={20} /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Positif / Berminat</p>
                    <p className="text-[10px] text-slate-500 font-bold">Potensi Jualan Tinggi</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black mb-4 tracking-widest">Shopify Analytics</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <Package size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Smart Lock A100 Pro</p>
                      <p className="text-[10px] text-brand font-bold uppercase">Dalam Troli</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-black mb-4 tracking-widest">Tindakan Pantas</p>
                <div className="grid grid-cols-2 gap-3">
                  <button className="py-3 bg-brand/10 text-brand text-[10px] font-black rounded-xl border border-brand/20 hover:bg-brand hover:text-white transition-all">QUOTE</button>
                  <button className="py-3 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">PAYMENT</button>
                  <button className="py-3 bg-purple-500/10 text-purple-600 text-[10px] font-black rounded-xl border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all">HISTORY</button>
                  <button className="py-3 bg-red-500/10 text-red-600 text-[10px] font-black rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">BAN</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;