
import React, { useState, createContext, useContext, useEffect } from 'react';
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
import { Language, Product, Conversation, User as UserType, AiSettings, Message } from './types';
import { translations } from './i18n';
import { db } from './services/db';

const NOTIFICATION_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_73130c2c3e.mp3';

export const SafeText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  let cleanText = text.replace(/^"|"$/g, ''); 
  cleanText = cleanText.replace(/###/g, ''); 
  const parts = cleanText.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-black text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
};

interface Order {
  id: string;
  customer: string;
  status: 'fulfilled' | 'pending' | 'processing';
  amount: number;
  date: string;
  platform: string;
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
  orders: Order[];
  setOrders: (o: Order[]) => void;
  aiSettings: AiSettings;
  setAiSettings: (s: AiSettings) => void;
  sendMessage: (convId: string, text: string, sender: 'staff' | 'ai' | 'customer', type?: 'text' | 'image' | 'voice', mediaUrl?: string) => void;
  assignStaff: (convId: string, staffName: string) => void;
  toggleAi: (convId: string) => void;
  markAsOpened: (convId: string) => void;
  generateInvoice: (convId: string, amount: number) => void;
  simulateLead: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  playNotificationSound: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { isLoggedIn, activeUser } = useApp();
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && activeUser && !roles.includes(activeUser.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const initialState = db.load();
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [lang, setLang] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [staff, setStaffInternal] = useState<UserType[]>(initialState.staff);
  const [activeUser, setActiveUser] = useState<UserType | null>(isLoggedIn ? initialState.staff[0] : null);
  const [aiSettings, setAiSettingsInternal] = useState<AiSettings>(initialState.aiSettings);
  const [products, setProductsInternal] = useState<Product[]>(initialState.products);
  const [conversations, setConversationsInternal] = useState<Conversation[]>(initialState.conversations);
  const [orders, setOrdersInternal] = useState<Order[]>(initialState.orders);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Priority Signal', message: 'Beh Chen is asking about smart locks.', type: 'lead', time: '2m ago', read: false },
    { id: 2, title: 'Security Alert', message: 'New login node detected.', type: 'system', time: '1h ago', read: false },
  ]);

  const setStaff = (s: UserType[]) => { setStaffInternal(s); db.save({ staff: s }); };
  const setAiSettings = (s: AiSettings) => { setAiSettingsInternal(s); db.save({ aiSettings: s }); };
  const setProducts = (p: Product[]) => { setProductsInternal(p); db.save({ products: p }); };
  const setConversations = (c: Conversation[]) => { setConversationsInternal(c); db.save({ conversations: c }); };
  const setOrders = (o: Order[]) => { setOrdersInternal(o); db.save({ orders: o }); };

  useEffect(() => { localStorage.setItem('isLoggedIn', isLoggedIn.toString()); }, [isLoggedIn]);

  const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const sendMessage = (convId: string, text: string, sender: 'staff' | 'ai' | 'customer', type: 'text' | 'image' | 'voice' = 'text') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: Math.random().toString(36).substr(2, 9), sender, text, timestamp, type, status: 'sent' as const };
    setConversations(conversations.map(c => c.id === convId ? {
      ...c,
      messages: [...c.messages, newMsg],
      lastMessage: type === 'voice' ? 'Voice Message' : text,
      lastTimestamp: timestamp,
      unreadCount: sender === 'customer' ? c.unreadCount + 1 : 0
    } : c));
  };

  const assignStaff = (convId: string, staffName: string) => {
    setConversations(conversations.map(c => c.id === convId ? { ...c, assignedStaff: staffName, assignedAt: new Date().toISOString(), isHumanTakeover: true, aiEnabled: false } : c));
  };

  const toggleAi = (convId: string) => {
    setConversations(conversations.map(c => c.id === convId ? { ...c, aiEnabled: !c.aiEnabled, isHumanTakeover: c.aiEnabled } : c));
  };

  const markAsOpened = (convId: string) => {
    setConversations(conversations.map(c => c.id === convId ? { ...c, isOpenedByStaff: true, unreadCount: 0 } : c));
  };

  const generateInvoice = (convId: string, amount: number) => {
    const id = `#TOTO-${Date.now().toString().slice(-4)}`;
    const customer = conversations.find(c => c.id === convId)?.customerName || 'Customer';
    setOrders([{ id, customer, status: 'pending', amount, date: 'Just Now', platform: 'whatsapp' }, ...orders]);
    sendMessage(convId, `Invoice ${id} for RM ${amount} generated.`, 'staff');
  };

  const simulateLead = () => {
    const id = Date.now().toString();
    const newConv: Conversation = {
      id, customerName: 'New Lead ' + id.slice(-3), customerPhone: '+6011-XXXX-XXXX', platform: 'whatsapp', lastMessage: 'Biometric locks inquiry.', lastTimestamp: 'Just Now', unreadCount: 1, isHumanTakeover: false, priority: 'high', status: 'active', aiEnabled: true,
      messages: [{ id: 'm'+id, sender: 'customer', text: 'I need a smart lock.', timestamp: 'Just Now', type: 'text' }]
    };
    setConversations([newConv, ...conversations]);
    playNotificationSound();
    setNotifications([{ id: Date.now(), title: 'Lead Signal', message: `New inquiry from ${newConv.customerName}`, type: 'lead', time: 'Just Now', read: false }, ...notifications]);
  };

  const t = (key: string) => (translations[lang] as any)[key] || key;

  return (
    <AppContext.Provider value={{ 
      lang, setLang, t, searchQuery, setSearchQuery, activeUser, setActiveUser, isLoggedIn, setIsLoggedIn,
      notifications, setNotifications, products, setProducts, conversations, setConversations,
      staff, setStaff, orders, setOrders, aiSettings, setAiSettings, sendMessage, assignStaff, toggleAi, markAsOpened, generateInvoice,
      simulateLead, isSidebarOpen, setSidebarOpen, playNotificationSound
    }}>
      <Router>
        <div className="flex h-screen overflow-hidden bg-primary">
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
