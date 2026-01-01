
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
    { id: 1, title: 'High Priority Lead', message: 'Beh Chen is asking about biometric locks.', type: 'lead', time: '2m ago', read: false },
  ]);

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'TOTO Smart Lock A100 Pro', price: 1299.00, stock: 45, category: 'Digital Locks', sku: 'SL-A100P', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=200' },
  ]);

  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', customerName: 'Beh Chen', customerPhone: '+60 12-345 6789', platform: 'whatsapp', lastMessage: 'Biometric locks for sliding doors?', lastTimestamp: '10:42 AM', unreadCount: 2, isHumanTakeover: false, priority: 'high', status: 'active', messages: [
      { id: 'm1', sender: 'customer', text: 'Do you have biometric locks for sliding doors?', timestamp: '10:42 AM', type: 'text' },
    ] },
  ]);

  const [staff, setStaff] = useState<UserType[]>([
    { id: 'staff1', name: 'Mustafa S.', email: 'admin@locksnmore.com', role: 'super_admin', active: true, lastLogin: '1h ago', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    { id: 'staff2', name: 'Agent Sarah', email: 'sarah@locksnmore.com', role: 'agent', active: true, lastLogin: '4h ago', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  ]);

  const [orders, setOrders] = useState<Order[]>([]);

  // Simulation: Progressively mark staff/ai messages as Delivered and then Read
  useEffect(() => {
    const interval = setInterval(() => {
      setConversations(prev => prev.map(conv => ({
        ...conv,
        messages: conv.messages.map(msg => {
          if (msg.sender !== 'customer' && msg.status !== 'read') {
            const nextStatus = msg.status === 'sent' ? 'delivered' : 'read';
            // Random chance to progress status
            return Math.random() > 0.7 ? { ...msg, status: nextStatus as any } : msg;
          }
          return msg;
        })
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5;
    audio.play().catch(e => console.warn("Audio failed:", e));
  };

  const sendMessage = (convId: string, text: string, sender: 'staff' | 'ai' | 'customer', type: 'text' | 'image' | 'voice' = 'text', mediaUrl?: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setConversations(prev => prev.map(c => {
      if (c.id === convId) {
        const isResponse = sender === 'staff' || sender === 'ai';
        const firstResponseAt = isResponse && !c.firstResponseAt ? now.toISOString() : c.firstResponseAt;
        
        return {
          ...c,
          messages: [...c.messages, { 
            id: Math.random().toString(36).substr(2, 9), 
            sender, 
            text, 
            timestamp, 
            type, 
            mediaUrl, 
            status: isResponse ? 'sent' : undefined 
          }],
          lastMessage: type === 'voice' ? 'Voice Message' : text,
          lastTimestamp: timestamp,
          unreadCount: sender === 'customer' ? c.unreadCount + 1 : 0,
          firstResponseAt
        };
      }
      return c;
    }));
  };

  const assignStaff = (convId: string, staffName: string) => {
    setConversations(prev => prev.map(c => 
      c.id === convId ? { 
        ...c, 
        assignedStaff: staffName, 
        assignedAt: new Date().toISOString(), 
        isHumanTakeover: true,
        isOpenedByStaff: false 
      } : c
    ));
  };

  const markAsOpened = (convId: string) => {
    setConversations(prev => prev.map(c => 
      c.id === convId ? { ...c, isOpenedByStaff: true, unreadCount: 0 } : c
    ));
  };

  const generateInvoice = (convId: string, amount: number) => {
    const id = `#TOTO-${Date.now().toString().slice(-6)}`;
    setOrders(prev => [{ id, customer: 'Customer', status: 'pending', amount, date: 'Just Now', platform: 'whatsapp' }, ...prev]);
    sendMessage(convId, `Order ID ${id} generated! Please authorize payment: https://checkout.toto.com/${id}`, 'staff');
  };

  const simulateLead = () => {
    const id = Date.now().toString();
    const newConv: Conversation = {
      id,
      customerName: 'Aisha Malik',
      customerPhone: '+6011-2233 4455',
      platform: 'whatsapp',
      lastMessage: 'Interested in the A100 Pro model.',
      lastTimestamp: 'Just Now',
      unreadCount: 1,
      isHumanTakeover: false,
      priority: 'high',
      status: 'active',
      messages: [{ id: 'm' + Date.now(), sender: 'customer', text: 'Interested in the A100 Pro model.', timestamp: 'Just Now', type: 'text' }]
    };
    setConversations(prev => [newConv, ...prev]);
    playNotificationSound();
    setNotifications(prev => [{
      id: Date.now(),
      title: 'New High Priority Signal',
      message: 'Aisha Malik is inquiring about A100 Pro.',
      type: 'lead',
      time: 'Just now',
      read: false
    }, ...prev]);
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
                <Route path="/users" element={<UserManagement />} />
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
