
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router';
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
import { Language, Product, Conversation, User as UserType, AiSettings, Message } from './types';
import { translations } from './i18n';

const NOTIFICATION_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_73130c2c3e.mp3';

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
  sendMessage: (convId: string, text: string, sender: 'staff' | 'ai' | 'customer', type?: 'text' | 'image' | 'voice', mediaUrl?: string) => void;
  assignStaff: (convId: string, staffName: string) => void;
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

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeUser, setActiveUser] = useState({ 
    name: 'Mustafa Shoukat', 
    role: 'Super Admin', 
    id: 'admin1',
    email: 'mustafa@locksnmore.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
  });
  
  const [aiSettings, setAiSettings] = useState<AiSettings>({
    personality: 'helpful',
    tone: 'casual',
    responseLength: 60,
    creativity: 75
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Priority Signal', message: 'Beh Chen is asking about smart locks.', type: 'lead', time: '2m ago', read: false },
  ]);

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'TOTO Smart Lock A100 Pro', price: 1299.00, stock: 45, category: 'Digital Locks', sku: 'SL-A100P', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=200', salesCount: 156 },
    { id: '2', name: 'FaceID Gate Lock X2', price: 2499.00, stock: 12, category: 'Gate Locks', sku: 'GL-X2', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=200', salesCount: 89 },
    { id: '3', name: 'TOTO Padlock Lite', price: 199.00, stock: 0, category: 'Padlocks', sku: 'PL-LITE', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=200', salesCount: 240 },
  ]);

  // Mock data for testing KPI Analysis
  const [conversations, setConversations] = useState<Conversation[]>([
    { 
      id: '1', 
      customerName: 'Beh Chen', 
      customerPhone: '+60 12-345 6789', 
      platform: 'whatsapp', 
      lastMessage: 'Biometric locks for sliding doors?', 
      lastTimestamp: '10:42 AM', 
      unreadCount: 2, 
      isHumanTakeover: false, 
      priority: 'high', 
      status: 'active', 
      dealStatus: 'open',
      messages: [{ id: 'm1', sender: 'customer', text: 'Do you have biometric locks for sliding doors?', timestamp: '10:42 AM', type: 'text' }] 
    },
    { 
      id: '2', 
      customerName: 'Sarah Lim', 
      customerPhone: '+60 11-234 5678', 
      platform: 'instagram', 
      lastMessage: 'Price for A100 Pro?', 
      lastTimestamp: '09:15 AM', 
      unreadCount: 0, 
      isHumanTakeover: true, 
      assignedStaff: 'Agent Sarah',
      assignedAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago (Delayed)
      firstResponseAt: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
      isOpenedByStaff: true,
      priority: 'medium', 
      status: 'active', 
      dealStatus: 'won',
      messages: [{ id: 'm2', sender: 'customer', text: 'Price for A100 Pro?', timestamp: '09:15 AM', type: 'text' }] 
    },
    { 
        id: '3', 
        customerName: 'David Tan', 
        customerPhone: '+60 17-999 0000', 
        platform: 'whatsapp', 
        lastMessage: 'Need help with installation.', 
        lastTimestamp: '08:00 AM', 
        unreadCount: 1, 
        isHumanTakeover: true, 
        assignedStaff: 'Mustafa Shoukat',
        assignedAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
        isOpenedByStaff: false,
        priority: 'high', 
        status: 'active', 
        messages: [{ id: 'm3', sender: 'customer', text: 'Need help with installation.', timestamp: '08:00 AM', type: 'text' }] 
      },
  ]);

  const [staff, setStaff] = useState<UserType[]>([
    { id: 'staff1', name: 'Mustafa Shoukat', email: 'mustafa@locksnmore.com', role: 'super_admin', active: true, lastLogin: '1h ago', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    { id: 'staff2', name: 'Agent Sarah', email: 'sarah@locksnmore.com', role: 'agent', active: true, lastLogin: '4h ago', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    { id: '#TOTO-5501', customer: 'Beh Chen', status: 'processing', amount: 1299.00, date: 'Today', platform: 'whatsapp' },
    { id: '#TOTO-5502', customer: 'Sarah Lim', status: 'fulfilled', amount: 2499.00, date: 'Yesterday', platform: 'instagram' },
  ]);

  const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5;
    audio.play().catch(e => console.warn("Audio failed:", e));
  };

  const sendMessage = (convId: string, text: string, sender: 'staff' | 'ai' | 'customer', type: 'text' | 'image' | 'voice' = 'text', mediaUrl?: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConversations(prev => prev.map(c => c.id === convId ? {
      ...c,
      messages: [...c.messages, { id: Math.random().toString(36).substr(2, 9), sender, text, timestamp, type, mediaUrl, status: sender === 'customer' ? undefined : 'sent' }],
      lastMessage: type === 'voice' ? 'Voice Message' : text,
      lastTimestamp: timestamp,
      unreadCount: sender === 'customer' ? c.unreadCount + 1 : 0,
      firstResponseAt: (sender === 'staff' || sender === 'ai') && !c.firstResponseAt ? now.toISOString() : c.firstResponseAt
    } : c));
    
    // Auto-update message status to 'read' after 2s for realism in UI testing
    if (sender !== 'customer') {
      setTimeout(() => {
        setConversations(prev => prev.map(c => c.id === convId ? {
          ...c,
          messages: c.messages.map(m => m.sender === sender ? { ...m, status: 'read' as const } : m)
        } : c));
      }, 2000);
    }
  };

  const assignStaff = (convId: string, staffName: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { 
      ...c, 
      assignedStaff: staffName, 
      assignedAt: new Date().toISOString(), 
      isHumanTakeover: true,
      isOpenedByStaff: false 
    } : c));
  };

  const markAsOpened = (convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, isOpenedByStaff: true, unreadCount: 0 } : c));
  };

  const generateInvoice = (convId: string, amount: number) => {
    const id = `#TOTO-${Date.now().toString().slice(-4)}`;
    const customer = conversations.find(c => c.id === convId)?.customerName || 'Customer';
    setOrders(prev => [{ id, customer, status: 'pending', amount, date: 'Just Now', platform: 'whatsapp' }, ...prev]);
    sendMessage(convId, `Invoice ${id} for RM ${amount} generated.`, 'staff');
  };

  const simulateLead = () => {
    const id = Date.now().toString();
    const newConv: Conversation = {
      id, customerName: 'New Lead', customerPhone: '+6011-0000 0000', platform: 'whatsapp', lastMessage: 'Inquiry', lastTimestamp: 'Just Now', unreadCount: 1, isHumanTakeover: false, priority: 'high', status: 'active', messages: [{ id: 'm'+id, sender: 'customer', text: 'I need a lock.', timestamp: 'Just Now', type: 'text' }]
    };
    setConversations(prev => [newConv, ...prev]);
    playNotificationSound();
  };

  const t = (key: string) => (translations[lang] as any)[key] || key;

  return (
    <AppContext.Provider value={{ 
      lang, setLang, t, searchQuery, setSearchQuery, activeUser, setActiveUser,
      notifications, setNotifications, products, setProducts, conversations, setConversations,
      staff, setStaff, orders, setOrders, aiSettings, setAiSettings, sendMessage, assignStaff, markAsOpened, generateInvoice,
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
                <Route path="/settings" element={<Settings />} />
                <Route path="/docs" element={<Documentation />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
