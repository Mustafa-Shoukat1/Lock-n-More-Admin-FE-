
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
  assignedAt?: string; 
  firstResponseAt?: string; 
  isOpenedByStaff?: boolean;
  status: 'active' | 'pending' | 'closed';
  dealStatus?: 'won' | 'lost' | 'open';
  messages: Message[];
  aiEnabled: boolean; // Control if AI is currently managing this chat
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  sku: string;
  salesCount?: number;
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

export interface AiSettings {
  personality: 'professional' | 'helpful' | 'aggressive' | 'passive' | 'witty' | 'detective';
  tone: 'formal' | 'casual' | 'urgent' | 'empathetic';
  responseLength: number;
  creativity: number;
}
