import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import AIManager from './pages/AIManager';
import Products from './pages/Products';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import Analytics from './pages/Analytics';
import Documentation from './pages/Documentation';
import Orders from './pages/Orders';
import { Language, Product, Conversation, User as UserType, AiSettings, Message } from './types';
import { translations } from './i18n';
import { LayoutDashboard, MessageSquare, Package, BookOpen, ShoppingCart } from 'lucide-react';

const NOTIFICATION_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_73130c2c3e.mp3'; // High-quality 'ding'

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
  activeUser: { name: string; role: string; id: string; avatar?: string; email?: string };
  setActiveUser: (u: any) => void;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  staff: UserType[];
  setStaff: React.Dispatch<React.SetStateAction<UserType[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  aiSettings: AiSettings;
  setAiSettings: React.Dispatch<React.SetStateAction<AiSettings>>;
  sendMessage: (convId: string, text: string, sender: 'staff' | 'ai', type?: 'text' | 'image' | 'voice', mediaUrl?: string) => void;
  assignStaff: (convId: string, staffName: string) => void;
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

const BottomNav: React.FC = () => {
  const { t } = useApp();
  const navItems = [
    { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: t('inbox'), icon: <MessageSquare size={20} />, path: '/inbox' },
    { name: t('products'), icon: <Package size={20} />, path: '/products' },
    { name: 'Docs', icon: <BookOpen size={20} />, path: '/docs' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-surface border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 pb-safe z-[90] shadow-md">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 ${
              isActive ? 'text-brand font-black' : 'text-slate-400'
            }`
          }
        >
          <div className="mb-0.5">{item.icon}</div>
          <span className="text-[9px] uppercase tracking-tighter">{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeUser, setActiveUser] = useState({ 
    name: 'Mustafa Shoukat', 
    role: 'Super Admin', 
    id: 'admin1',
    email: 'admin@locksnmore.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
  });
  
  const [aiSettings, setAiSettings] = useState<AiSettings>({
    personality: 'helpful',
    tone: 'casual',
    responseLength: 60,
    creativity: 75
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'High Priority Lead', message: 'Beh Chen is asking about biometric locks for sliding doors.', type: 'lead', time: '2m ago', read: false },
    { id: 2, title: 'Shopify Sync Success', message: 'All 240 product nodes synchronized.', type: 'system', time: '1h ago', read: false },
  ]);

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'TOTO Smart Lock A100 Pro', price: 1299.00, stock: 45, category: 'Digital Locks', sku: 'SL-A100P', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=200' },
    { id: '2', name: 'Slim-Fit Deadbolt X1', price: 899.00, stock: 12, category: 'Deadbolts', sku: 'SD-X1-BL', image: 'https://images.unsplash.com/photo-1510003307521-f09516640925?auto=format&fit=crop&q=80&w=200' },
  ]);

  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', customerName: 'Beh Chen', customerPhone: '+60 12-345 6789', platform: 'whatsapp', lastMessage: 'Biometric locks for sliding doors?', lastTimestamp: '10:42 AM', unreadCount: 2, isHumanTakeover: false, priority: 'high', status: 'active', messages: [
      { id: 'm1', sender: 'customer', text: 'Hi, I saw your ad on Facebook.', timestamp: '10:40 AM', type: 'text' },
      { id: 'm2', sender: 'ai', text: 'Hello Beh! I am the TOTO assistant. How can I help you today?', timestamp: '10:41 AM', type: 'text', status: 'read' },
      { id: 'm3', sender: 'customer', text: 'Do you have biometric locks for sliding doors?', timestamp: '10:42 AM', type: 'text' },
    ] },
  ]);

  const [staff, setStaff] = useState<UserType[]>([
    { id: 'staff1', name: 'Mustafa S.', email: 'admin@locksnmore.com', role: 'super_admin', active: true, lastLogin: '1h ago', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    { id: 'staff2', name: 'Agent Sarah', email: 'sarah@locksnmore.com', role: 'agent', active: true, lastLogin: '4h ago', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { id: 'staff3', name: 'Agent Daniel', email: 'daniel@locksnmore.com', role: 'agent', active: true, lastLogin: '12m ago', avatar: 'https://i.pravatar.cc/150?u=daniel' },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    { id: '#TOTO-1024', customer: 'Beh Chen', status: 'fulfilled', amount: 1299.00, date: 'Today, 10:45 AM', platform: 'whatsapp' },
  ]);

  const prevNotificationCount = useRef(notifications.length);

  const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.6;
    audio.play().catch(e => console.warn("Audio playback failed:", e));
  };

  // Simulate read status updates for sent messages
  useEffect(() => {
    const interval = setInterval(() => {
      setConversations(prev => prev.map(conv => ({
        ...conv,
        messages: conv.messages.map(msg => {
          if (msg.sender !== 'customer') {
            if (msg.status === 'sent') return { ...msg, status: 'delivered' };
            if (msg.status === 'delivered') return { ...msg, status: 'read' };
          }
          return msg;
        })
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notifications.length > prevNotificationCount.current) {
      const latest = notifications[0];
      if (latest && !latest.read) playNotificationSound();
    }
    prevNotificationCount.current = notifications.length;
  }, [notifications]);

  const sendMessage = (convId: string, text: string, sender: 'staff' | 'ai', type: 'text' | 'image' | 'voice' = 'text', mediaUrl?: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender,
      text,
      timestamp,
      type,
      mediaUrl,
      status: 'sent'
    };

    setConversations(prev => prev.map(c => 
      c.id === convId 
        ? { ...c, messages: [...c.messages, newMessage], lastMessage: type === 'voice' ? 'Sent a voice message' : text, lastTimestamp: timestamp, unreadCount: 0 }
        : c
    ));
  };

  const generateInvoice = (convId: string, amount: number) => {
    const activeChat = conversations.find(c => c.id === convId);
    if (!activeChat) return;

    const invoiceId = `#TOTO-${1025 + orders.length}`;
    const newOrder: Order = {
      id: invoiceId,
      customer: activeChat.customerName,
      status: 'pending',
      amount: amount,
      date: 'Just Now',
      platform: activeChat.platform
    };

    setOrders(prev => [newOrder, ...prev]);
    sendMessage(convId, `Order generated! Secure Shopify Invoice Link: https://checkout.shopify.com/toto/${invoiceId}\nTotal: RM ${amount.toLocaleString()}`, 'staff');
    
    setNotifications(prev => [{
      id: Date.now(),
      title: 'Order Generated',
      message: `Invoice ${invoiceId} for RM ${amount.toLocaleString()} sent to ${activeChat.customerName}.`,
      type: 'system',
      time: 'Just now',
      read: false
    }, ...prev]);
  };

  const simulateLead = () => {
    const names = ['Wei Lung', 'Aisha', 'Ramesh', 'Kevin Tan', 'Siti'];
    const platforms: any[] = ['whatsapp', 'instagram', 'tiktok'];
    const name = names[Math.floor(Math.random() * names.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const id = (conversations.length + 1).toString();

    const newConv: Conversation = {
      id,
      customerName: name,
      customerPhone: '+60 1x-xxx xxxx',
      platform,
      lastMessage: 'I want to ask about your face-ID locks.',
      lastTimestamp: 'Just Now',
      unreadCount: 1,
      isHumanTakeover: false,
      priority: 'high',
      status: 'active',
      messages: [{ id: Math.random().toString(), sender: 'customer', text: 'I want to ask about your face-ID locks.', timestamp: 'Just Now', type: 'text' }]
    };

    setConversations(prev => [newConv, ...prev]);
    setNotifications(prev => [{
      id: Date.now(),
      title: 'New Lead Node',
      message: `${name} initiated a thread via ${platform.toUpperCase()}.`,
      type: 'lead',
      time: 'Just now',
      read: false
    }, ...prev]);
  };

  const assignStaff = (convId: string, staffName: string) => {
    setConversations(prev => prev.map(c => 
      c.id === convId ? { ...c, assignedStaff: staffName, isHumanTakeover: true } : c
    ));
  };

  const t = (key: string) => (translations[lang] as any)[key] || key;

  return (
    <AppContext.Provider value={{ 
      lang, setLang, t, searchQuery, setSearchQuery, activeUser, setActiveUser,
      notifications, setNotifications, products, setProducts, conversations, setConversations,
      staff, setStaff, orders, setOrders, aiSettings, setAiSettings, sendMessage, assignStaff, generateInvoice,
      simulateLead, isSidebarOpen, setSidebarOpen, playNotificationSound
    }}>
      <Router>
        <div className="flex h-screen overflow-hidden bg-primary">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            <Header />
            <main className="flex-1 relative overflow-y-auto focus:outline-none pb-20 md:pb-0 scrollbar-none">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/ai-manager" element={<AIManager />} />
                <Route path="/products" element={<Products />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/docs" element={<Documentation />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;