
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
  simulateLead: () => void;
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
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Priority Signal', message: 'Beh Chen is asking about smart locks.', type: 'lead', time: '2m ago', read: false },
    { id: 2, title: 'Security Alert', message: 'Node Alpha connected.', type: 'system', time: '1h ago', read: false },
  ]);

  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const addLog = (type: SystemLog['type'], message: string) => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setSystemLogs(prev => [newLog, ...prev].slice(0, 50));
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
      addLog('info', `User ${u.name} initialized session.`);
      const updatedStaff = data.staff.map(s => s.id === u.id ? { ...s, lastLogin: 'Active Now' } : s);
      updateData({ staff: updatedStaff });
    }
  };

  const resetDatabase = () => {
    if (confirm("Permanently wipe local perimeter data and reset to production defaults?")) {
      addLog('warning', 'Hard system reset initiated.');
      const fresh = db.reset();
      setData(fresh);
      window.location.reload();
    }
  };

  useEffect(() => { localStorage.setItem('isLoggedIn', isLoggedIn.toString()); }, [isLoggedIn]);

  // Automated Lead Simulation Loop (Heartbeat)
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.65) {
        simulateLead();
      }
    }, 35000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const sendMessage = (convId: string, text: string, sender: 'staff' | 'ai' | 'customer', type: 'text' | 'image' | 'voice' = 'text', mediaUrl?: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = { id: Math.random().toString(36).substr(2, 9), sender, text, timestamp, type, status: 'sent', mediaUrl };
    
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
      
      return next;
    });

    if (sender === 'ai') addLog('ai', `AI Node responded to conversation ${convId}.`);
    else if (sender === 'staff') addLog('info', `Agent signal dispatched to ${convId}.`);
  };

  const handleAiAutoReply = async (conv: Conversation, query: string) => {
    try {
      addLog('ai', `AI synthesizing response for ${conv.platform} lead: ${conv.customerName}...`);
      // Simulate real thinking time
      setTimeout(async () => {
        const history = conv.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
        const context = `Conversation with ${conv.customerName} on ${conv.platform}. Current history:\n${history}`;
        const suggestion = await gemini.getAiResponseSuggestion(context, query, dataRef.current.aiSettings);
        sendMessage(conv.id, suggestion, 'ai');
      }, 3000);
    } catch (e) {
      addLog('error', 'AI Neural Core failed to process signal.');
    }
  };

  const assignStaff = (convId: string, staffName: string) => {
    const conv = data.conversations.find(c => c.id === convId);
    setConversations(data.conversations.map(c => c.id === convId ? { ...c, assignedStaff: staffName, assignedAt: new Date().toISOString(), isHumanTakeover: true, aiEnabled: false } : c));
    
    setNotifications(prev => [{
      id: Date.now(),
      title: 'Action Required',
      message: `Conversation with ${conv?.customerName || 'Customer'} assigned to ${staffName}.`,
      type: 'lead',
      time: 'Just Now',
      read: false
    }, ...prev]);
    
    addLog('success', `Assigned ${staffName} to node ${convId}.`);
    playNotificationSound();
  };

  const toggleAi = (convId: string) => {
    const currentConv = data.conversations.find(c => c.id === convId);
    const newState = !currentConv?.aiEnabled;
    setConversations(data.conversations.map(c => c.id === convId ? { ...c, aiEnabled: newState, isHumanTakeover: !newState } : c));
    addLog('ai', `AI Mode ${newState ? 'Activated' : 'Suspended'} for node ${convId}.`);
  };

  const markAsOpened = (convId: string) => {
    setConversations(data.conversations.map(c => c.id === convId ? { ...c, isOpenedByStaff: true, unreadCount: 0 } : c));
  };

  const generateInvoice = (convId: string, amount: number) => {
    const id = `#TOTO-${Date.now().toString().slice(-4)}`;
    const customer = data.conversations.find(c => c.id === convId)?.customerName || 'Customer';
    setOrders([{ id, customer, status: 'pending', amount, date: 'Just Now', platform: 'whatsapp' }, ...data.orders]);
    sendMessage(convId, `Invoice ${id} for RM ${amount} generated.`, 'staff');
    addLog('success', `Settlement Node deployed: Invoice ${id} for RM ${amount}.`);
  };

  const simulateLead = () => {
    const { whatsappEnabled, instagramEnabled, tiktokEnabled } = dataRef.current.integrationSettings;
    const availablePlatforms: Platform[] = [];
    if (whatsappEnabled) availablePlatforms.push('whatsapp');
    if (instagramEnabled) availablePlatforms.push('instagram');
    if (tiktokEnabled) availablePlatforms.push('tiktok');

    if (availablePlatforms.length === 0) return;

    const platform = availablePlatforms[Math.floor(Math.random() * availablePlatforms.length)];
    
    const messagesByPlatform = {
      whatsapp: ["How much for the A100 Pro?", "Is installation included?", "Do you ship to Penang?", "I need a quote for 5 units."],
      instagram: ["Love this lock! Price?", "Is the X2 available in black?", "Showroom location please.", "Check DM!"],
      tiktok: ["Need this for my airbnb!", "Price please?", "Is this biometric only?", "Wow, so convenient!"]
    };

    const names = ["Ahmad Fauzi", "Jenny Tan", "Siva Kumar", "Lim Wei", "Syed Kamal", "Wong YM", "Zul IG", "Sarah Lim", "TikTok Fan"];
    
    const id = Date.now().toString();
    const query = messagesByPlatform[platform][Math.floor(Math.random() * messagesByPlatform[platform].length)];
    const name = names[Math.floor(Math.random() * names.length)];
    
    const newConv: Conversation = {
      id, 
      customerName: name, 
      customerPhone: platform === 'whatsapp' ? `+601${Math.floor(Math.random()*90000000+10000000)}` : `@${name.toLowerCase().replace(' ', '_')}`, 
      platform, 
      lastMessage: query, 
      lastTimestamp: 'Just Now', 
      unreadCount: 1, 
      isHumanTakeover: false, 
      priority: 'high', 
      status: 'active', 
      aiEnabled: true,
      messages: [{ id: 'm'+id, sender: 'customer', text: query, timestamp: 'Just Now', type: 'text' }]
    };
    
    setConversations([newConv, ...dataRef.current.conversations]);
    playNotificationSound();
    addLog('warning', `New ${platform.toUpperCase()} lead: ${name} initiated a signal.`);
    setNotifications(prev => [{ id: Date.now(), title: 'Lead Signal', message: `New ${platform} lead: ${name}`, type: 'lead', time: 'Just Now', read: false }, ...prev]);
  };

  const syncCatalog = () => {
    const updatedProducts = data.products.map(p => ({
      ...p,
      stock: Math.floor(Math.random() * 60),
      price: p.price + (Math.random() > 0.9 ? (Math.random() * 40 - 20) : 0)
    }));
    setProducts(updatedProducts);
    addLog('success', 'Master Commerce Catalog synchronized.');
  };

  const t = (key: string) => (translations[lang] as any)[key] || key;

  return (
    <AppContext.Provider value={{ 
      lang, setLang, t, searchQuery, setSearchQuery, activeUser, setActiveUser, isLoggedIn, setIsLoggedIn,
      notifications, setNotifications, products: data.products, setProducts, conversations: data.conversations, setConversations,
      staff: data.staff, setStaff, orders: data.orders, setOrders, aiSettings: data.aiSettings, setAiSettings, 
      integrationSettings: data.integrationSettings, setIntegrationSettings,
      systemLogs, addLog, sendMessage, assignStaff, toggleAi, markAsOpened, generateInvoice, simulateLead, syncCatalog,
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
