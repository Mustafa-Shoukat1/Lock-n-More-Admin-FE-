
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
import UserManagement from './pages/UserManagement';
import { Language, Product, Conversation, User as UserType, AiSettings, Message } from './types';
import { translations } from './i18n';
import { db } from './services/db';

const NOTIFICATION_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_73130c2c3e.mp3';

/**
 * SafeText: Converts basic markdown into bold HTML and strips all raw markers.
 * Ensures the "Real View" without stars or pound signs.
 */
export const SafeText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  
  // 1. Clean up AI-specific prefixing and raw characters
  let clean = text
    .replace(/^"|"$/g, '')          // Remove outer quotes
    .replace(/###\s+/g, '')         // Remove H3 markers
    .replace(/##\s+/g, '')          // Remove H2 markers
    .replace(/#\s+/g, '')           // Remove H1 markers
    .replace(/(\r\n|\n|\r)/gm, " ") // Optional: Normalize line breaks for chat bubbles
    .trim();

  // 2. Process bolding while removing the ** characters
  const parts = clean.split(/(\*\*.*?\*\*)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{boldText}</strong>;
        }
        // Handle single * just in case
        return part.replace(/\*/g, '');
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
  resetDatabase: () => void;
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
  const [data, setData] = useState(db.load());
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [lang, setLang] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeUser, setActiveUserInternal] = useState<UserType | null>(isLoggedIn ? data.staff[0] : null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Priority Signal', message: 'Beh Chen is asking about smart locks.', type: 'lead', time: '2m ago', read: false },
    { id: 2, title: 'Security Alert', message: 'Node Alpha connected.', type: 'system', time: '1h ago', read: false },
  ]);

  // Unified persistence wrapper for Vercel persistence
  const updateData = (updates: Partial<typeof data>) => {
    setData(prev => {
      const next = { ...prev, ...updates };
      db.save(updates);
      return next;
    });
  };

  const setStaff = (staff: UserType[]) => updateData({ staff });
  const setProducts = (products: Product[]) => updateData({ products });
  const setConversations = (conversations: Conversation[]) => updateData({ conversations });
  const setOrders = (orders: Order[]) => updateData({ orders });
  const setAiSettings = (aiSettings: AiSettings) => updateData({ aiSettings });
  
  const setActiveUser = (u: UserType | null) => {
    setActiveUserInternal(u);
    if (u) {
      const updatedStaff = data.staff.map(s => s.id === u.id ? { ...s, lastLogin: 'Active Now' } : s);
      updateData({ staff: updatedStaff });
    }
  };

  const resetDatabase = () => {
    const fresh = db.reset();
    setData(fresh);
    window.location.reload();
  };

  useEffect(() => { 
    localStorage.setItem('isLoggedIn', isLoggedIn.toString()); 
  }, [isLoggedIn]);

  const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const sendMessage = (convId: string, text: string, sender: 'staff' | 'ai' | 'customer', type: 'text' | 'image' | 'voice' = 'text') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: Math.random().toString(36).substr(2, 9), sender, text, timestamp, type, status: 'sent' as const };
    const updated = data.conversations.map(c => c.id === convId ? {
      ...c,
      messages: [...c.messages, newMsg],
      lastMessage: type === 'voice' ? 'Voice Message' : text,
      lastTimestamp: timestamp,
      unreadCount: sender === 'customer' ? c.unreadCount + 1 : 0
    } : c);
    setConversations(updated);
  };

  const assignStaff = (convId: string, staffName: string) => {
    setConversations(data.conversations.map(c => c.id === convId ? { ...c, assignedStaff: staffName, assignedAt: new Date().toISOString(), isHumanTakeover: true, aiEnabled: false } : c));
  };

  const toggleAi = (convId: string) => {
    setConversations(data.conversations.map(c => c.id === convId ? { ...c, aiEnabled: !c.aiEnabled, isHumanTakeover: c.aiEnabled } : c));
  };

  const markAsOpened = (convId: string) => {
    setConversations(data.conversations.map(c => c.id === convId ? { ...c, isOpenedByStaff: true, unreadCount: 0 } : c));
  };

  const generateInvoice = (convId: string, amount: number) => {
    const id = `#TOTO-${Date.now().toString().slice(-4)}`;
    const customer = data.conversations.find(c => c.id === convId)?.customerName || 'Customer';
    setOrders([{ id, customer, status: 'pending', amount, date: 'Just Now', platform: 'whatsapp' }, ...data.orders]);
    sendMessage(convId, `Invoice ${id} for RM ${amount} generated.`, 'staff');
  };

  const simulateLead = () => {
    const id = Date.now().toString();
    const newConv: Conversation = {
      id, customerName: 'New Lead ' + id.slice(-3), customerPhone: '+6011-XXXX-XXXX', platform: 'whatsapp', lastMessage: 'Biometric locks inquiry.', lastTimestamp: 'Just Now', unreadCount: 1, isHumanTakeover: false, priority: 'high', status: 'active', aiEnabled: true,
      messages: [{ id: 'm'+id, sender: 'customer', text: 'I need a smart lock.', timestamp: 'Just Now', type: 'text' }]
    };
    setConversations([newConv, ...data.conversations]);
    playNotificationSound();
    setNotifications(prev => [{ id: Date.now(), title: 'Lead Signal', message: `New inquiry from ${newConv.customerName}`, type: 'lead', time: 'Just Now', read: false }, ...prev]);
  };

  const t = (key: string) => (translations[lang] as any)[key] || key;

  return (
    <AppContext.Provider value={{ 
      lang, setLang, t, searchQuery, setSearchQuery, activeUser, setActiveUser, isLoggedIn, setIsLoggedIn,
      notifications, setNotifications, products: data.products, setProducts, conversations: data.conversations, setConversations,
      staff: data.staff, setStaff, orders: data.orders, setOrders, aiSettings: data.aiSettings, setAiSettings, sendMessage, assignStaff, toggleAi, markAsOpened, generateInvoice,
      simulateLead, isSidebarOpen, setSidebarOpen, playNotificationSound, resetDatabase
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
