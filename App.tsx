
import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import AIManager from './pages/AIManager';
import Products from './pages/Products';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Documentation from './pages/Documentation';
import Orders from './pages/Orders';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import { Language, Product, Conversation, User as UserType, AiSettings, Message, Platform, IntegrationSettings } from './types';
import { translations } from './i18n';
import { db } from './services/db';
import { gemini } from './services/gemini';

const NOTIFICATION_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_73130c2c3e.mp3';

export const SafeText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  let clean = text.replace(/^"|"$/g, '').replace(/###\s+/g, '').replace(/##\s+/g, '').replace(/#\s+/g, '').trim();
  const parts = clean.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{boldText}</strong>;
        }
        return part.replace(/\*/g, '');
      })}
    </>
  );
};

export interface SystemLog {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
  message: string;
  timestamp: string;
}

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeUser: UserType | null;
  setActiveUser: (u: UserType | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  products: Product[];
  setProducts: (p: Product[]) => void;
  conversations: Conversation[];
  setConversations: (c: Conversation[]) => void;
  staff: UserType[];
  setStaff: (s: UserType[]) => void;
  orders: any[];
  setOrders: (o: any[]) => void;
  aiSettings: AiSettings;
  setAiSettings: (s: AiSettings) => void;
  integrationSettings: IntegrationSettings;
  setIntegrationSettings: (s: IntegrationSettings) => void;
  systemLogs: SystemLog[];
  addLog: (type: SystemLog['type'], message: string) => void;
  sendMessage: (convId: string, text: string, sender: 'staff' | 'ai' | 'customer', type?: 'text' | 'image' | 'voice', mediaUrl?: string) => void;
  assignStaff: (convId: string, staffName: string) => void;
  toggleAi: (convId: string) => void;
  markAsOpened: (convId: string) => void;
  generateInvoice: (convId: string, amount: number) => void;
  simulateLead: (isSilent?: boolean) => void;
  stressTest: () => void;
  syncCatalog: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  playNotificationSound: () => void;
  resetDatabase: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const ProtectedRoute = ({ children, roles }: { children?: React.ReactNode, roles?: string[] }) => {
  const { isLoggedIn, activeUser } = useApp();
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && activeUser && !roles.includes(activeUser.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [data, setData] = useState(db.load());
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [lang, setLang] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeUser, setActiveUserInternal] = useState<UserType | null>(isLoggedIn ? data.staff[0] : null);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [notifications, setNotifications] = useState([]);

  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const addLog = (type: SystemLog['type'], message: string) => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setSystemLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  const updateData = (updates: Partial<typeof data>) => {
    setData(prev => {
      const next = { ...prev, ...updates };
      db.save(next);
      return next;
    });
  };

  const setStaff = (staff: UserType[]) => updateData({ staff });
  const setProducts = (products: Product[]) => updateData({ products });
  const setConversations = (conversations: Conversation[]) => updateData({ conversations });
  const setOrders = (orders: any[]) => updateData({ orders });
  const setAiSettings = (aiSettings: AiSettings) => updateData({ aiSettings });
  const setIntegrationSettings = (integrationSettings: IntegrationSettings) => updateData({ integrationSettings });
  
  const setActiveUser = (u: UserType | null) => {
    setActiveUserInternal(u);
    if (u) {
      addLog('info', `Identity node ${u.name} successfully authenticated.`);
      const updatedStaff = data.staff.map(s => s.id === u.id ? { ...s, lastLogin: 'Active Now' } : s);
      updateData({ staff: updatedStaff });
    }
  };

  const resetDatabase = () => {
    if (confirm("Authorize full perimeter reset? All persistent nodes will be wiped.")) {
      addLog('warning', 'Master reset signal dispatched. Local storage cleared.');
      const fresh = db.reset();
      setData(fresh);
      window.location.reload();
    }
  };

  useEffect(() => { localStorage.setItem('isLoggedIn', isLoggedIn.toString()); }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.7) simulateLead();
    }, 45000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const sendMessage = (convId: string, text: string, sender: 'staff' | 'ai' | 'customer', type: 'text' | 'image' | 'voice' = 'text', mediaUrl?: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = Math.random().toString(36).substr(2, 9);
    const newMsg: Message = { id: msgId, sender, text, timestamp, type, status: 'sent', mediaUrl };
    
    setData(prev => {
      const updatedConv = prev.conversations.map(c => c.id === convId ? {
        ...c,
        messages: [...c.messages, newMsg],
        lastMessage: type === 'voice' ? 'Voice Message' : (type === 'image' ? 'Sent an image' : text),
        lastTimestamp: timestamp,
        unreadCount: sender === 'customer' ? c.unreadCount + 1 : 0
      } : c);
      
      const next = { ...prev, conversations: updatedConv };
      db.save(next);
      
      const target = updatedConv.find(c => c.id === convId);
      if (sender === 'customer' && target?.aiEnabled) {
        handleAiAutoReply(target, text);
      }
      
      // Simulate status progression for staff/ai
      if (sender !== 'customer') {
        setTimeout(() => updateMessageStatus(convId, msgId, 'delivered'), 1500);
        setTimeout(() => updateMessageStatus(convId, msgId, 'read'), 3000);
      }
      
      return next;
    });

    if (sender === 'ai') addLog('ai', `AI Synthesis node responded to conversation ${convId}.`);
    else if (sender === 'staff') addLog('info', `Manual signal released to node ${convId}.`);
  };

  const updateMessageStatus = (convId: string, msgId: string, status: 'delivered' | 'read') => {
    setData(prev => {
      const updatedConv = prev.conversations.map(c => c.id === convId ? {
        ...c,
        messages: c.messages.map(m => m.id === msgId ? { ...m, status } : m)
      } : c);
      const next = { ...prev, conversations: updatedConv };
      db.save(next);
      return next;
    });
  };

  const handleAiAutoReply = async (conv: Conversation, query: string) => {
    try {
      addLog('ai', `Gemini 3 Flash analyzing ${conv.platform} signal: "${query.substring(0, 15)}..."`);
      setTimeout(async () => {
        const history = conv.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
        const suggestion = await gemini.getAiResponseSuggestion(`Platform: ${conv.platform}\nHistory:\n${history}`, query, dataRef.current.aiSettings);
        sendMessage(conv.id, suggestion, 'ai');
      }, 2000);
    } catch (e) {
      addLog('error', 'Neural Core Exception: AI failed to synthesize response.');
    }
  };

  const assignStaff = (convId: string, staffName: string) => {
    setConversations(data.conversations.map(c => c.id === convId ? { ...c, assignedStaff: staffName, isHumanTakeover: true, aiEnabled: false } : c));
    addLog('success', `Perimeter node ${convId} assigned to ${staffName}.`);
    playNotificationSound();
  };

  const toggleAi = (convId: string) => {
    const currentConv = data.conversations.find(c => c.id === convId);
    const newState = !currentConv?.aiEnabled;
    setConversations(data.conversations.map(c => c.id === convId ? { ...c, aiEnabled: newState, isHumanTakeover: !newState } : c));
    addLog('ai', `Cognitive Hub ${newState ? 'Enabled' : 'Disabled'} for node ${convId}.`);
  };

  const markAsOpened = (convId: string) => {
    setConversations(data.conversations.map(c => c.id === convId ? { ...c, isOpenedByStaff: true, unreadCount: 0 } : c));
  };

  const generateInvoice = (convId: string, amount: number) => {
    const id = `#TOTO-${Date.now().toString().slice(-4)}`;
    setOrders([{ id, customer: data.conversations.find(c => c.id === convId)?.customerName || 'Customer', status: 'pending', amount, date: 'Just Now', platform: 'whatsapp' }, ...data.orders]);
    sendMessage(convId, `Invoice ${id} for RM ${amount} issued.`, 'staff');
    addLog('success', `Financial Node initialized: Invoice ${id}.`);
  };

  const simulateLead = (isSilent = false) => {
    const { whatsappEnabled, instagramEnabled, tiktokEnabled } = dataRef.current.integrationSettings;
    const availablePlatforms: Platform[] = [];
    if (whatsappEnabled) availablePlatforms.push('whatsapp');
    if (instagramEnabled) availablePlatforms.push('instagram');
    if (tiktokEnabled) availablePlatforms.push('tiktok');
    if (availablePlatforms.length === 0) return;

    const platform = availablePlatforms[Math.floor(Math.random() * availablePlatforms.length)];
    const names = ["Mohd Hafiz", "Siew Ling", "Ravi Shankar", "Evelyn Tan", "Zul Ariffin", "Kimmy IG", "TikTok User 44"];
    const name = names[Math.floor(Math.random() * names.length)];
    const id = Date.now().toString();
    const queries = ["Price for A100?", "Is installation available in KL?", "Warranty for gate locks?", "Promo for new users?"];
    const query = queries[Math.floor(Math.random() * queries.length)];

    const newConv: Conversation = {
      id, customerName: name, customerPhone: platform === 'whatsapp' ? '+6012-XXX-XXXX' : `@${name.toLowerCase().replace(' ', '_')}`, 
      platform, lastMessage: query, lastTimestamp: 'Just Now', unreadCount: 1, isHumanTakeover: false, priority: 'high', status: 'active', aiEnabled: true,
      messages: [{ id: 'm'+id, sender: 'customer', text: query, timestamp: 'Just Now', type: 'text' }]
    };
    
    setConversations([newConv, ...dataRef.current.conversations]);
    if (!isSilent) {
      playNotificationSound();
      addLog('warning', `New ${platform.toUpperCase()} lead captured: ${name}.`);
      setNotifications(prev => [{ id: Date.now(), title: 'Incoming Signal', message: `${platform}: ${name}`, type: 'lead', time: 'Just Now', read: false }, ...prev]);
    }
  };

  const stressTest = () => {
    addLog('error', 'System Stress Test initiated. Burst signal injection active.');
    for(let i=0; i<5; i++) {
      setTimeout(() => simulateLead(true), i * 300);
    }
  };

  const syncCatalog = () => {
    addLog('info', 'Shopify Master Catalog synchronization in progress...');
    setTimeout(() => {
      const updatedProducts = data.products.map(p => ({
        ...p,
        stock: Math.floor(Math.random() * 50),
        price: p.price + (Math.random() > 0.8 ? (Math.random() * 20 - 10) : 0)
      }));
      setProducts(updatedProducts);
      addLog('success', 'Commerce Node synchronized. Inventory verified.');
    }, 1500);
  };

  const t = (key: string) => (translations[lang] as any)[key] || key;

  return (
    <AppContext.Provider value={{ 
      lang, setLang, t, searchQuery, setSearchQuery, activeUser, setActiveUser, isLoggedIn, setIsLoggedIn,
      notifications, setNotifications, products: data.products, setProducts, conversations: data.conversations, setConversations,
      staff: data.staff, setStaff, orders: data.orders, setOrders, aiSettings: data.aiSettings, setAiSettings, 
      integrationSettings: data.integrationSettings, setIntegrationSettings,
      systemLogs, addLog, sendMessage, assignStaff, toggleAi, markAsOpened, generateInvoice, simulateLead, stressTest, syncCatalog,
      isSidebarOpen, setSidebarOpen, playNotificationSound, resetDatabase
    }}>
      <Router>
        <div className="flex h-screen overflow-hidden bg-primary transition-colors duration-500">
          {isLoggedIn && <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />}
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            {isLoggedIn && <Header />}
            <main className="flex-1 relative overflow-y-auto focus:outline-none scrollbar-none">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/ai-manager" element={<ProtectedRoute roles={['super_admin', 'admin']}><AIManager /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute roles={['super_admin', 'admin']}><UserManagement /></ProtectedRoute>} />
                <Route path="/docs" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
