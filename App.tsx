import React, { useState, createContext, useContext, useEffect } from 'react';
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
import { Language, Product, Conversation, User as UserType, AiSettings } from './types';
import { translations } from './i18n';
import { LayoutDashboard, MessageSquare, Package, BarChart3 } from 'lucide-react';

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeUser: { name: string; role: string; id: string; avatar?: string };
  setActiveUser: (u: any) => void;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  staff: UserType[];
  setStaff: React.Dispatch<React.SetStateAction<UserType[]>>;
  aiSettings: AiSettings;
  setAiSettings: React.Dispatch<React.SetStateAction<AiSettings>>;
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
    { name: t('analytics'), icon: <BarChart3 size={20} />, path: '/analytics' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-surface/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 pb-safe z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              isActive ? 'text-brand scale-110 font-black' : 'text-slate-400'
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
  const [activeUser, setActiveUser] = useState({ 
    name: 'Mustafa Shoukat', 
    role: 'Super Admin', 
    id: 'admin1',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
  });
  
  const [aiSettings, setAiSettings] = useState<AiSettings>({
    personality: 'helpful',
    tone: 'casual',
    responseLength: 60,
    creativity: 75
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New High Priority Lead', message: 'Beh Chen is asking about smart locks.', type: 'lead', time: '2m ago', read: false },
    { id: 2, title: 'Shopify Sync Success', message: '124 products updated.', type: 'system', time: '1h ago', read: false },
    { id: 3, title: 'AI Escalation', message: 'Customer needs human help on TikTok.', type: 'alert', time: '3h ago', read: false },
  ]);

  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Smart Lock A100 Pro', price: 1299.00, stock: 45, category: 'Digital Locks', sku: 'SL-A100P', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=200' },
    { id: '2', name: 'Slim-Fit Deadbolt X1', price: 899.00, stock: 12, category: 'Deadbolts', sku: 'SD-X1-BL', image: 'https://images.unsplash.com/photo-1510003307521-f09516640925?auto=format&fit=crop&q=80&w=200' },
  ]);

  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', customerName: 'Beh Chen', customerPhone: '+60 12-345 6789', platform: 'whatsapp', lastMessage: 'Sliding door locks?', lastTimestamp: '10:42 AM', unreadCount: 2, isHumanTakeover: false, priority: 'high', status: 'active', messages: [{ id: 'm1', sender: 'customer', text: 'Sliding door locks?', timestamp: '10:42 AM', type: 'text' }] },
    { id: '2', customerName: 'Sarah Lim', customerPhone: '@sarah_l', platform: 'instagram', lastMessage: 'Thank you!', lastTimestamp: '09:15 AM', unreadCount: 0, isHumanTakeover: false, priority: 'low', status: 'active', messages: [] },
    { id: '3', customerName: 'Ahmad Faiz', customerPhone: '@faiz_locks', platform: 'tiktok', lastMessage: 'Show A100 photos', lastTimestamp: '08:10 AM', unreadCount: 1, isHumanTakeover: true, assignedStaff: 'Staff 1', priority: 'medium', status: 'active', messages: [] },
    { id: '4', customerName: 'Dummy Chat 1', customerPhone: '+60 11-123 4444', platform: 'whatsapp', lastMessage: 'Checking prices', lastTimestamp: '07:30 AM', unreadCount: 0, isHumanTakeover: false, priority: 'high', status: 'active', messages: [] },
    { id: '5', customerName: 'Dummy Chat 2', customerPhone: '@user_insta_01', platform: 'instagram', lastMessage: 'In stock?', lastTimestamp: '06:45 AM', unreadCount: 0, isHumanTakeover: false, priority: 'medium', status: 'active', messages: [] },
    { id: '6', customerName: 'Dummy Chat 3', customerPhone: '@tiktok_fan_01', platform: 'tiktok', lastMessage: 'Shipping info?', lastTimestamp: '05:20 AM', unreadCount: 0, isHumanTakeover: false, priority: 'low', status: 'active', messages: [] }
  ]);

  const [staff, setStaff] = useState<UserType[]>([
    { id: 'staff1', name: 'Staff 1', email: 'staff1@locksnmore.com', role: 'agent', active: true, lastLogin: '1h ago', avatar: 'https://i.pravatar.cc/150?u=staff1' },
    { id: 'staff2', name: 'Staff 2', email: 'staff2@locksnmore.com', role: 'agent', active: true, lastLogin: '4h ago', avatar: 'https://i.pravatar.cc/150?u=staff2' },
    { id: 'staff3', name: 'Staff 3', email: 'staff3@locksnmore.com', role: 'agent', active: false, lastLogin: '1d ago', avatar: 'https://i.pravatar.cc/150?u=staff3' },
  ]);

  const t = (key: string) => (translations[lang] as any)[key] || key;

  return (
    <AppContext.Provider value={{ 
      lang, setLang, t, searchQuery, setSearchQuery, activeUser, setActiveUser,
      notifications, setNotifications, products, setProducts, conversations, setConversations,
      staff, setStaff, aiSettings, setAiSettings
    }}>
      <Router>
        <div className="flex h-screen overflow-hidden bg-primary transition-colors duration-300">
          <Sidebar />
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            <Header />
            <main className="flex-1 relative overflow-y-auto focus:outline-none pb-20 md:pb-0 scrollbar-thin">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/ai-manager" element={<AIManager />} />
                <Route path="/products" element={<Products />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/settings" element={<Settings />} />
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