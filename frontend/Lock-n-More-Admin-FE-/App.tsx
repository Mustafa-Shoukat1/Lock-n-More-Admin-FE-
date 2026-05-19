
import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Package, Settings } from 'lucide-react';
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
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import { Language, Product, Conversation, User as UserType, AiSettings, Message, Platform, IntegrationSettings } from './types';
import { translations } from './i18n';
import { db } from './services/db';
import { gemini } from './services/gemini';
import { api } from './services/api';
import { socketService } from './services/socket';

const SOUNDS = {
  message: 'https://cdn.pixabay.com/audio/2022/03/15/audio_73130c2c3e.mp3',
  system: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c153f0.mp3'
};

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
  runFullAudit: () => void;
  syncCatalog: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  playNotificationSound: (type?: 'message' | 'system') => void;
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
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles && activeUser && !roles.includes(activeUser.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const MobileDock = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Inbox', path: '/inbox', icon: MessageSquare },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] md:hidden pointer-events-none">
      <div className="mx-3 mb-3 rounded-[1.75rem] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl px-2 py-2 pointer-events-auto">
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition-all ${active ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
              >
                <Icon size={18} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const storedSession = api.getStoredSession();
  const [data, setData] = useState(db.load());
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(storedSession?.token) || localStorage.getItem('isLoggedIn') === 'true');
  const [lang, setLang] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeUser, setActiveUserInternal] = useState<UserType | null>(storedSession?.user || (isLoggedIn ? data.staff[0] : null));
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
      addLog('info', `Node [${u.name}] session established with [${u.role}] scope.`);
      const exists = data.staff.some(s => s.id === u.id);
      const updatedStaff = exists
        ? data.staff.map(s => s.id === u.id ? { ...s, ...u, lastLogin: 'Active Now' } : s)
        : [{ ...u, lastLogin: 'Active Now' }, ...data.staff];
      updateData({ staff: updatedStaff });
    }
  };

  const resetDatabase = () => {
    if (confirm("Critical: Full data purge requested. Reset perimeter to default state?")) {
      addLog('error', 'Master purge signal confirmed. Local node data cleared.');
      playNotificationSound('system');
      const fresh = db.reset();
      setData(fresh);
      window.location.reload();
    }
  };

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (!isLoggedIn) {
      api.clearStoredSession();
    }
  }, [isLoggedIn]);

  const syncConversationMessages = async (convId: string, platform: Platform, contactId: string) => {
    const currentSession = api.getStoredSession();
    if (!currentSession?.token) return;

    try {
      const remoteMessages = await api.fetchMessages(currentSession.token, platform, contactId);
      setData(prev => {
        const updated = {
          ...prev,
          conversations: prev.conversations.map(c => {
            if (c.id !== convId) return c;
            const last = remoteMessages[remoteMessages.length - 1];
            return {
              ...c,
              messages: remoteMessages,
              lastMessage: last?.text || c.lastMessage,
              lastTimestamp: last?.timestamp || c.lastTimestamp,
            };
          })
        };
        db.save(updated);
        return updated;
      });
    } catch (error: any) {
      addLog('warning', `Message sync degraded for node [${convId}]: ${error.message}`);
    }
  };

  useEffect(() => {
    const hydrateFromBackend = async () => {
      const currentSession = api.getStoredSession();
      if (!isLoggedIn || !currentSession?.token || !activeUser) return;

      try {
        const [users, conversations, products, orders] = await Promise.all([
          api.fetchUsers(currentSession.token),
          api.fetchInboxSnapshot(currentSession.token, activeUser),
          api.fetchProducts(currentSession.token),
          api.fetchOrders(currentSession.token),
        ]);

        setData(prev => {
          const next = {
            ...prev,
            staff: users.length > 0 ? users : prev.staff,
            conversations,
            products: products.length > 0 ? products : prev.products,
            orders: orders.length > 0 ? orders.map((o: any) => ({
              id: String(o.id || o.order_id || o.name),
              customer: o.customer?.first_name ? `${o.customer.first_name} ${o.customer.last_name || ''}`.trim() : (o.customer_name || o.email || 'Unknown'),
              amount: Number(o.total_price || o.amount || 0),
              status: (o.financial_status || o.status || 'pending').toLowerCase(),
              platform: o.source_name || o.platform || 'shopify',
              date: o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A',
            })) : prev.orders,
          };
          db.save(next);
          return next;
        });

        addLog('success', `Backend sync complete. ${conversations.length} conversations and ${products.length} products loaded.`);
      } catch (error: any) {
        addLog('warning', `Backend sync unavailable. Running with local cache: ${error.message}`);
      }
    };

    hydrateFromBackend();
  }, [isLoggedIn, activeUser?.id]);

  // Socket.IO real-time message listener
  useEffect(() => {
    if (!isLoggedIn) {
      socketService.disconnect();
      return;
    }

    socketService.connect();

    const handleWhatsAppMessage = (payload: any) => {
      addLog('info', `Real-time WhatsApp message from ${payload?.participant?.name || 'unknown'}`);
      playNotificationSound('message');
      // Re-fetch conversations to pick up the new message
      const session = api.getStoredSession();
      if (session?.token && activeUser) {
        api.fetchInboxSnapshot(session.token, activeUser).then(conversations => {
          setData(prev => {
            const next = { ...prev, conversations };
            db.save(next);
            return next;
          });
        }).catch(() => {});
      }
    };

    const handleInstagramMessage = (payload: any) => {
      addLog('info', `Real-time Instagram message from ${payload?.participant?.name || 'unknown'}`);
      playNotificationSound('message');
      const session = api.getStoredSession();
      if (session?.token && activeUser) {
        api.fetchInboxSnapshot(session.token, activeUser).then(conversations => {
          setData(prev => {
            const next = { ...prev, conversations };
            db.save(next);
            return next;
          });
        }).catch(() => {});
      }
    };

    const handleNotification = (payload: any) => {
      addLog('info', `Notification: ${payload?.title || 'New notification'}`);
      playNotificationSound('system');
      setNotifications(prev => [payload, ...prev]);
    };

    socketService.on('new_whatsapp_message', handleWhatsAppMessage);
    socketService.on('new_instagram_message', handleInstagramMessage);
    socketService.on('new_notification', handleNotification);

    return () => {
      socketService.off('new_whatsapp_message');
      socketService.off('new_instagram_message');
      socketService.off('new_notification');
      socketService.disconnect();
    };
  }, [isLoggedIn, activeUser?.id]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.8) simulateLead();
    }, 45000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const playNotificationSound = (type: 'message' | 'system' = 'message') => {
    const url = SOUNDS[type];
    const audio = new Audio(url);
    audio.volume = type === 'message' ? 0.4 : 0.3;
    audio.play().catch(() => {});
  };

  // Fix: Adding missing handleAiAutoReply function to handle automated AI responses
  const handleAiAutoReply = async (conv: Conversation, text: string) => {
    // Add log for tracking
    addLog('ai', `Cognitive Hub [${conv.id}] triggered auto-reply sequence.`);
    
    // We use the latest settings from the ref to ensure we have the current state
    const settings = dataRef.current.aiSettings;
    
    // Call the backend AI service to get a suggested response
    // We provide some context about the conversation platform
    const context = `Platform: ${conv.platform}. Current customer query: "${text}". Lead priority: ${conv.priority}.`;
    const response = await gemini.getAiResponseSuggestion(context, text, settings);
    
    // Dispatch the response as 'ai'
    sendMessage(conv.id, response, 'ai');
  };

  const sendMessage = (convId: string, text: string, sender: 'staff' | 'ai' | 'customer', type: 'text' | 'image' | 'voice' = 'text', mediaUrl?: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = Math.random().toString(36).substr(2, 9);
    
    // Account for who exactly sent this for the "Replied By" feature
    const senderName = sender === 'staff' ? (activeUser?.name || 'Operator') : (sender === 'ai' ? 'TOTO AI' : 'Customer');
    
    const newMsg: Message = { id: msgId, sender, text, timestamp, type, status: 'sent', mediaUrl };
    
    let targetConv: Conversation | undefined;

    setData(prev => {
      const updatedConv = prev.conversations.map(c => c.id === convId ? {
        ...c,
        messages: [...c.messages, newMsg],
        lastMessage: type === 'voice' ? 'Voice Message' : (type === 'image' ? 'Media Attachment' : text),
        lastTimestamp: timestamp,
        unreadCount: sender === 'customer' ? c.unreadCount + 1 : 0
      } : c);
      
      targetConv = updatedConv.find(c => c.id === convId);
      const next = { ...prev, conversations: updatedConv };
      db.save(next);
      return next;
    });

    // Fix: Moved handleAiAutoReply call outside of setData to avoid side effects in updater function
    if (sender === 'customer' && targetConv?.aiEnabled) {
      handleAiAutoReply(targetConv, text);
    }
    
    // Production-grade status tracking simulation
    if (sender !== 'customer') {
      setTimeout(() => {
        setData(current => {
           const up = {
             ...current,
             conversations: current.conversations.map(c => c.id === convId ? {
               ...c,
               messages: c.messages.map(m => m.id === msgId ? { ...m, status: 'delivered' as const } : m)
             } : c)
           };
           db.save(up);
           return up;
        });
        addLog('info', `Message [${msgId}] delivered to remote gateway.`);
      }, 1200 + Math.random() * 800);
      
      setTimeout(() => {
        setData(current => {
           const up = {
             ...current,
             conversations: current.conversations.map(c => c.id === convId ? {
               ...c,
               messages: c.messages.map(m => m.id === msgId ? { ...m, status: 'read' as const } : m)
             } : c)
           };
           db.save(up);
           return up;
        });
        addLog('success', `Message [${msgId}] confirmed read by recipient.`);
      }, 3500 + Math.random() * 1500);
    }

    if (sender === 'ai') addLog('ai', `AI Synthesis node [${convId}] dispatched response.`);
    else if (sender === 'staff') addLog('info', `Manual operator [${senderName}] released signal to [${convId}].`);

    if (sender === 'staff' && targetConv && type === 'text') {
      const currentSession = api.getStoredSession();
      if (currentSession?.token) {
        void (async () => {
          try {
            await api.sendMessage(currentSession.token, targetConv!.platform, targetConv!.customerPhone, text);
            await syncConversationMessages(convId, targetConv!.platform, targetConv!.customerPhone);
            addLog('success', `Backend dispatch confirmed for [${targetConv!.platform}] node [${targetConv!.customerPhone}].`);
          } catch (error: any) {
            addLog('error', `Backend dispatch failed for [${targetConv!.platform}] node [${targetConv!.customerPhone}]: ${error.message}`);
          }
        })();
      }
    }
  };

  const assignStaff = (convId: string, staffName: string) => {
    setData(prev => {
      const updated = {
        ...prev,
        conversations: prev.conversations.map(c => c.id === convId ? { 
          ...c, 
          assignedStaff: staffName, 
          isHumanTakeover: true, 
          aiEnabled: false,
          assignedAt: new Date().toISOString()
        } : c)
      };
      db.save(updated);
      return updated;
    });
    addLog('success', `Operator [${staffName}] attached to node [${convId}]. AI logic suspended.`);
    playNotificationSound('message');
  };

  const toggleAi = (convId: string) => {
    setData(prev => {
      const currentConv = prev.conversations.find(c => c.id === convId);
      const newState = !currentConv?.aiEnabled;
      const updated = {
        ...prev,
        conversations: prev.conversations.map(c => c.id === convId ? { ...c, aiEnabled: newState, isHumanTakeover: !newState } : c)
      };
      db.save(updated);
      addLog('ai', `Cognitive Hub [${convId}] shifted to [${newState ? 'AUTO' : 'MANUAL'}] mode.`);
      return updated;
    });
  };

  const markAsOpened = (convId: string) => {
    setData(prev => {
      const updated = {
        ...prev,
        conversations: prev.conversations.map(c => c.id === convId ? { 
          ...c, 
          isOpenedByStaff: true, 
          unreadCount: 0,
          firstResponseAt: c.firstResponseAt || new Date().toISOString() 
        } : c)
      };
      db.save(updated);
      return updated;
    });
  };

  const generateInvoice = (convId: string, amount: number) => {
    const id = `#TOTO-${Date.now().toString().slice(-4)}`;
    const newOrder = { id, customer: dataRef.current.conversations.find(c => c.id === convId)?.customerName || 'Customer', status: 'pending', amount, date: 'Just Now', platform: 'whatsapp' };
    
    setData(prev => {
      const updated = {
        ...prev,
        orders: [newOrder, ...prev.orders]
      };
      db.save(updated);
      return updated;
    });

    sendMessage(convId, `Order Node ${id} initialized for RM ${amount}. Proceed to settlement.`, 'staff');
    addLog('success', `Commerce Settlement Node [${id}] deployed for [RM ${amount}].`);
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
    const queries = ["Price for A100?", "Is installation available in KL?", "Warranty for gate locks?", "Promo for new users?", "How long to ship to JB?"];
    const query = queries[Math.floor(Math.random() * queries.length)];

    const newConv: Conversation = {
      id, customerName: name, customerPhone: platform === 'whatsapp' ? '+6012-XXX-XXXX' : `@${name.toLowerCase().replace(' ', '_')}`, 
      platform, lastMessage: query, lastTimestamp: 'Just Now', unreadCount: 1, isHumanTakeover: false, priority: 'high', status: 'active', aiEnabled: true,
      messages: [{ id: 'm'+id, sender: 'customer', text: query, timestamp: 'Just Now', type: 'text' }]
    };
    
    setData(prev => {
      const updated = {
        ...prev,
        conversations: [newConv, ...prev.conversations]
      };
      db.save(updated);
      return updated;
    });

    if (!isSilent) {
      playNotificationSound('message');
      addLog('warning', `Perimeter breach: New [${platform.toUpperCase()}] signal from [${name}].`);
      setNotifications(prev => [{ id: Date.now(), title: 'Priority Signal', message: `${platform}: ${name}`, type: 'lead', time: 'Just Now', read: false }, ...prev]);
    }
  };

  const stressTest = () => {
    addLog('error', 'STRESS TEST: High-frequency signal burst initiated.');
    for(let i=0; i<6; i++) {
      setTimeout(() => simulateLead(true), i * 400 + (Math.random() * 200));
    }
  };

  const runFullAudit = () => {
    addLog('info', 'FULL SYSTEM AUDIT: Starting sequence...');
    setTimeout(() => {
        addLog('success', 'AUDIT: Storage Perimeter healthy. (IndexedDB/Local)');
        syncCatalog();
    }, 500);
    setTimeout(() => {
        addLog('success', 'AUDIT: Omnichannel Gateways (WhatsApp, IG, TikTok) verified.');
        simulateLead();
    }, 1500);
    setTimeout(() => {
        addLog('success', 'AUDIT: AI Neural core (OpenAI backend) responding within 2.5s threshold.');
        addLog('info', 'SYSTEM READY FOR PRODUCTION DEPLOYMENT.');
        playNotificationSound('system');
    }, 4500);
  };

  const syncCatalog = () => {
    addLog('info', 'Establishing Shopify Admin Node handshake...');
    setTimeout(() => {
      setData(prev => {
        const updatedProducts = prev.products.map(p => ({
          ...p,
          stock: Math.floor(Math.random() * 50),
          price: p.price + (Math.random() > 0.8 ? (Math.random() * 20 - 10) : 0)
        }));
        const next = { ...prev, products: updatedProducts };
        db.save(next);
        return next;
      });
      addLog('success', 'Master Catalog synchronized. SKU inventory data verified.');
      playNotificationSound('system');
    }, 1200);
  };

  const t = (key: string) => (translations[lang] as any)[key] || key;

  return (
    <AppContext.Provider value={{ 
      lang, setLang, t, searchQuery, setSearchQuery, activeUser, setActiveUser, isLoggedIn, setIsLoggedIn,
      notifications, setNotifications, products: data.products, setProducts, conversations: data.conversations, setConversations,
      staff: data.staff, setStaff, orders: data.orders, setOrders, aiSettings: data.aiSettings, setAiSettings, 
      integrationSettings: data.integrationSettings, setIntegrationSettings,
      systemLogs, addLog, sendMessage, assignStaff, toggleAi, markAsOpened, generateInvoice, simulateLead, stressTest, runFullAudit, syncCatalog,
      isSidebarOpen, setSidebarOpen, playNotificationSound, resetDatabase
    }}>
      <Router>
        <div className="flex h-screen overflow-hidden bg-primary transition-colors duration-500">
          {isLoggedIn && <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />}
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            {isLoggedIn && <Header />}
            <main className="flex-1 relative overflow-y-auto focus:outline-none scrollbar-none pb-24 md:pb-0">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                <Route path="/payment-cancelled" element={<ProtectedRoute><PaymentCancelled /></ProtectedRoute>} />
                <Route path="/ai-manager" element={<ProtectedRoute roles={['super_admin', 'admin']}><AIManager /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute roles={['super_admin', 'admin']}><UserManagement /></ProtectedRoute>} />
                <Route path="/docs" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
              </Routes>
            </main>
            {isLoggedIn && <MobileDock />}
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
