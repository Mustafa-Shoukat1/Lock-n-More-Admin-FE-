
import { Conversation, Product, User as UserType, AiSettings, Message } from '../types';

const STORAGE_KEY = 'toto_perimeter_data';

interface AppState {
  staff: UserType[];
  products: Product[];
  conversations: Conversation[];
  orders: any[];
  aiSettings: AiSettings;
}

const DEFAULT_STATE: AppState = {
  staff: [
    { id: 'staff1', name: 'Mustafa Shoukat', email: 'mustafa@locksnmore.com', role: 'super_admin', active: true, lastLogin: 'Active Now', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    { id: 'staff2', name: 'Agent Sarah', email: 'sarah@locksnmore.com', role: 'agent', active: true, lastLogin: '4h ago', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { id: 'staff3', name: 'Beh SM', email: 'beh@locksnmore.com', role: 'admin', active: true, lastLogin: '10m ago', avatar: 'https://i.pravatar.cc/150?u=beh' },
  ],
  products: [
    { id: '1', name: 'TOTO Smart Lock A100 Pro', price: 1299.00, stock: 45, category: 'Digital Locks', sku: 'SL-A100P', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400', salesCount: 420 },
    { id: '2', name: 'FaceID Gate Lock X2', price: 2499.00, stock: 12, category: 'Gate Locks', sku: 'GL-X2', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=401', salesCount: 89 },
    { id: '3', name: 'TOTO Padlock Lite', price: 199.00, stock: 15, category: 'Padlocks', sku: 'PL-LITE', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=402', salesCount: 1200 },
    { id: '4', name: 'Biometric Safe S-50', price: 899.00, stock: 8, category: 'Safes', sku: 'SAFE-S50', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=403', salesCount: 56 },
    { id: '5', name: 'Smart Keybox G2', price: 349.00, stock: 0, category: 'Keyboxes', sku: 'KB-G2', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=404', salesCount: 310 },
  ],
  conversations: [
    { 
      id: '1', customerName: 'Beh Chen', customerPhone: '+60 12-345 6789', platform: 'whatsapp', lastMessage: 'Biometric locks for sliding doors?', lastTimestamp: '10:42 AM', unreadCount: 2, isHumanTakeover: false, priority: 'high', status: 'active', aiEnabled: true,
      messages: [{ id: 'm1', sender: 'customer', text: 'Do you have biometric locks for sliding doors?', timestamp: '10:42 AM', type: 'text' }] 
    },
    { 
      id: '2', customerName: 'Sarah Lim', customerPhone: '@sarah_locks', platform: 'instagram', lastMessage: 'Price for A100 Pro?', lastTimestamp: '09:15 AM', unreadCount: 1, isHumanTakeover: true, assignedStaff: 'Agent Sarah', assignedAt: new Date(Date.now() - 3600000).toISOString(), firstResponseAt: new Date(Date.now() - 3000000).toISOString(), isOpenedByStaff: true, priority: 'medium', status: 'active', aiEnabled: false,
      messages: [{ id: 'm2', sender: 'customer', text: 'Price for A100 Pro?', timestamp: '09:15 AM', type: 'text' }] 
    },
    { 
      id: '3', customerName: 'Daniel TikTok', customerPhone: '@daniellocks', platform: 'tiktok', lastMessage: 'Saw your video on the X2 lock!', lastTimestamp: 'Just Now', unreadCount: 1, isHumanTakeover: false, priority: 'high', status: 'active', aiEnabled: true,
      messages: [{ id: 'm3', sender: 'customer', text: 'Just saw your TikTok about the FaceID X2 lock, do you ship to Penang?', timestamp: 'Just Now', type: 'text' }] 
    },
  ],
  orders: [
    { id: '#TOTO-5501', customer: 'Beh Chen', status: 'processing', amount: 1299.00, date: 'Today', platform: 'whatsapp' },
    { id: '#TOTO-5502', customer: 'Sarah Lim', status: 'fulfilled', amount: 2499.00, date: 'Yesterday', platform: 'instagram' },
    { id: '#TOTO-5503', customer: 'Tan Ah Kow', status: 'fulfilled', amount: 199.00, date: '2 days ago', platform: 'tiktok' },
  ],
  aiSettings: {
    personality: 'helpful',
    tone: 'casual',
    responseLength: 60,
    creativity: 75
  }
};

export const db = {
  save: (state: Partial<AppState>) => {
    const current = db.load();
    const updated = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
  load: (): AppState => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_STATE;
  },
  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_STATE;
  }
};
