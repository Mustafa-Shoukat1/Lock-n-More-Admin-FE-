
export type Platform = 'whatsapp' | 'instagram' | 'tiktok';
export type UserRole = 'super_admin' | 'admin' | 'agent';
export type Language = 'en' | 'ms';

export interface Message {
  id: string;
  sender: 'customer' | 'ai' | 'staff';
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice';
  mediaUrl?: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  platform: Platform;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  isHumanTakeover: boolean;
  priority: 'low' | 'medium' | 'high';
  assignedStaff?: string;
  status: 'active' | 'pending' | 'closed';
  messages: Message[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  sku: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLogin: string;
  avatar?: string;
}

export interface Session {
  id: string;
  userId: string;
  device: string;
  ip: string;
  lastSeen: string;
}

export interface AiSettings {
  personality: 'professional' | 'helpful' | 'aggressive' | 'passive';
  tone: 'formal' | 'casual' | 'urgent' | 'empathetic';
  responseLength: number; // 0-100
  creativity: number; // 0-100
}
