import { Conversation, Message, Platform, Product, User } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:5000';
const SESSION_KEY = 'toto_backend_session';

type BackendUser = {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'agent';
  created_at?: string;
};

type BackendConversation = {
  id: string | number;
  participant?: {
    id?: string;
    phone?: string;
    name?: string;
    username?: string;
  };
  lastMessage?: {
    text?: string;
    created_at?: string;
    timestamp?: string;
  };
  unreadCount?: number;
  assigned_user_id?: number | null;
  is_ai_active?: boolean;
};

type BackendProduct = {
  id: string;
  title: string;
  product_type?: string;
  total_inventory?: number;
  variants?: Array<{
    id: string;
    title: string;
    price?: string | number;
    sku?: string;
    inventory_quantity?: number;
  }>;
  images?: Array<{
    id: string;
    src?: string;
  }>;
};

type StoredSession = {
  token: string;
  user: User;
};

const toTimeLabel = (value?: string) => {
  if (!value) return 'Just Now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just Now';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const parseJsonSafely = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const request = async <T>(path: string, options: RequestInit = {}, token?: string): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    const message = payload?.error || payload?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
};

const mapBackendUser = (user: BackendUser): User => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  role: user.role,
  active: true,
  lastLogin: 'Active Now',
});

const mapConversation = (platform: Platform, item: BackendConversation): Conversation => {
  const participantId =
    item.participant?.phone ||
    item.participant?.id ||
    String(item.id);

  const participantName =
    item.participant?.name ||
    item.participant?.username ||
    participantId;

  const lastText = item.lastMessage?.text || '';
  const lastTimestamp = item.lastMessage?.created_at || item.lastMessage?.timestamp;

  return {
    id: `${platform}:${participantId}`,
    customerName: participantName,
    customerPhone: participantId,
    platform,
    lastMessage: lastText,
    lastTimestamp: toTimeLabel(lastTimestamp),
    unreadCount: item.unreadCount || 0,
    isHumanTakeover: item.is_ai_active === false,
    priority: 'medium',
    status: 'active',
    aiEnabled: item.is_ai_active ?? true,
    messages: [],
  };
};

const mapMessage = (platform: Platform, row: any): Message => {
  const direction = row.direction || (row.is_from_user ? 'inbound' : 'outbound');
  const contentText = row.content?.text || row.text || '';
  const mediaUrl = row.media_url || row.mediaUrl;
  const rawType = row.type || (mediaUrl ? 'image' : 'text');

  let type: 'text' | 'image' | 'voice' = 'text';
  if (rawType === 'image') type = 'image';
  if (rawType === 'audio') type = 'voice';

  return {
    id: String(row.id),
    sender: direction === 'inbound' ? 'customer' : 'staff',
    text: contentText || (rawType && rawType !== 'text' ? `[${rawType}]` : ''),
    timestamp: toTimeLabel(row.created_at || row.timestamp),
    type,
    mediaUrl,
    status: direction === 'outbound' ? 'sent' : undefined,
  };
};

const mapProduct = (item: BackendProduct): Product => {
  const firstVariant = item.variants?.[0];
  const firstImage = item.images?.[0];
  const rawPrice = firstVariant?.price;
  const price = typeof rawPrice === 'string' ? Number(rawPrice) : rawPrice;

  return {
    id: String(item.id),
    name: item.title,
    price: Number.isFinite(price as number) ? Number(price) : 0,
    image: firstImage?.src || 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400',
    stock: firstVariant?.inventory_quantity ?? item.total_inventory ?? 0,
    category: item.product_type || 'Uncategorized',
    sku: firstVariant?.sku || String(item.id),
  };
};

export const api = {
  baseUrl: API_BASE_URL,

  getStoredSession(): StoredSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  setStoredSession(token: string, user: User) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
  },

  clearStoredSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const result = await request<{ token: string; user: BackendUser }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    return {
      token: result.token,
      user: mapBackendUser(result.user),
    };
  },

  async fetchUsers(token: string): Promise<User[]> {
    const users = await request<BackendUser[]>('/users', { method: 'GET' }, token);
    return users.map(mapBackendUser);
  },

  async fetchConversations(token: string, user: User): Promise<Conversation[]> {
    const query = `?userId=${encodeURIComponent(user.id)}&role=${encodeURIComponent(user.role)}`;

    const [wa, ig, tt] = await Promise.all([
      request<BackendConversation[]>(`/whatsapp/conversations${query}`, { method: 'GET' }, token),
      request<BackendConversation[]>(`/instagram/conversations${query}`, { method: 'GET' }, token),
      request<BackendConversation[]>(`/tiktok/conversations${query}`, { method: 'GET' }, token),
    ]);

    return [
      ...wa.map((item) => mapConversation('whatsapp', item)),
      ...ig.map((item) => mapConversation('instagram', item)),
      ...tt.map((item) => mapConversation('tiktok', item)),
    ];
  },

  async fetchMessages(token: string, platform: Platform, contactId: string): Promise<Message[]> {
    const endpointByPlatform: Record<Platform, string> = {
      whatsapp: `/whatsapp/messages/${encodeURIComponent(contactId)}`,
      instagram: `/instagram/messages/${encodeURIComponent(contactId)}`,
      tiktok: `/tiktok/messages/${encodeURIComponent(contactId)}`,
    };

    const rows = await request<any[]>(endpointByPlatform[platform], { method: 'GET' }, token);
    const mapped = rows.map((row) => mapMessage(platform, row));
    return mapped.reverse();
  },

  async fetchInboxSnapshot(token: string, user: User): Promise<Conversation[]> {
    const conversations = await this.fetchConversations(token, user);

    const withMessages = await Promise.all(
      conversations.map(async (conversation) => {
        try {
          const messages = await this.fetchMessages(token, conversation.platform, conversation.customerPhone);
          return {
            ...conversation,
            messages,
            lastMessage: messages.at(-1)?.text || conversation.lastMessage,
            lastTimestamp: messages.at(-1)?.timestamp || conversation.lastTimestamp,
          };
        } catch {
          return conversation;
        }
      })
    );

    return withMessages;
  },

  async fetchProducts(token: string): Promise<Product[]> {
    const result = await request<{ status: string; data: BackendProduct[] }>(
      '/shopify/products',
      { method: 'GET' },
      token
    );

    return (result.data || []).map(mapProduct);
  },

  async suggestAiResponse(
    token: string,
    conversationContext: string,
    customerQuery: string,
    settings?: Record<string, unknown>
  ): Promise<string> {
    const result = await request<{ suggestion: string }>(
      '/ai/suggest',
      {
        method: 'POST',
        body: JSON.stringify({ conversationContext, customerQuery, settings }),
      },
      token
    );

    return result.suggestion;
  },

  async analyzeSentiment(token: string, text: string): Promise<string> {
    const result = await request<{ sentiment: string }>(
      '/ai/sentiment',
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      },
      token
    );

    return result.sentiment;
  },

  async sendMessage(token: string, platform: Platform, to: string, message: string) {
    const endpointByPlatform: Record<Platform, string> = {
      whatsapp: '/whatsapp/send',
      instagram: '/instagram/send',
      tiktok: '/tiktok/send',
    };

    return request(
      endpointByPlatform[platform],
      {
        method: 'POST',
        body: JSON.stringify({ to, message }),
      },
      token
    );
  },

  // --- Orders ---
  async fetchOrders(token: string): Promise<any[]> {
    try {
      const result = await request<{ status: string; data: any[] }>(
        '/shopify/orders',
        { method: 'GET' },
        token
      );
      return result.data || [];
    } catch {
      return [];
    }
  },

  // --- Notifications ---
  async fetchNotifications(token: string): Promise<any[]> {
    try {
      return await request<any[]>('/notifications', { method: 'GET' }, token);
    } catch {
      return [];
    }
  },

  async markNotificationRead(token: string, id: string): Promise<void> {
    await request(`/notifications/${id}/read`, { method: 'PUT' }, token);
  },

  async markAllNotificationsRead(token: string): Promise<void> {
    await request('/notifications/read-all', { method: 'PUT' }, token);
  },

  // --- Follow-ups ---
  async fetchFollowUps(token: string): Promise<any[]> {
    try {
      return await request<any[]>('/followup/all', { method: 'GET' }, token);
    } catch {
      return [];
    }
  },

  async scheduleFollowUp(token: string, data: { conversationId: string; platform: string; contactId: string; message: string; delayMinutes: number }): Promise<any> {
    return request('/followup/schedule', { method: 'POST', body: JSON.stringify(data) }, token);
  },

  async cancelFollowUp(token: string, id: string): Promise<void> {
    await request(`/followup/${id}`, { method: 'DELETE' }, token);
  },

  // --- AI Settings ---
  async fetchAiSettings(token: string): Promise<any[]> {
    try {
      return await request<any[]>('/ai-settings', { method: 'GET' }, token);
    } catch {
      return [];
    }
  },

  async updateAiSettings(token: string, id: string, updates: Record<string, unknown>): Promise<any> {
    return request(`/ai-settings/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }, token);
  },

  // --- Agent Performance ---
  async fetchAgentPerformance(token: string): Promise<any[]> {
    try {
      return await request<any[]>('/performance/agents', { method: 'GET' }, token);
    } catch {
      return [];
    }
  },

  // --- User Management ---
  async createUser(token: string, userData: { name: string; email: string; password: string; role: string }): Promise<any> {
    return request('/users', { method: 'POST', body: JSON.stringify(userData) }, token);
  },

  async updateUser(token: string, id: string, updates: Record<string, unknown>): Promise<any> {
    return request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) }, token);
  },

  async deleteUser(token: string, id: string): Promise<void> {
    await request(`/users/${id}`, { method: 'DELETE' }, token);
  },

  // --- Generic HTTP helpers (used by FollowupSettings, etc.) ---
  async get(path: string, token?: string): Promise<{ data: any }> {
    const session = this.getStoredSession();
    const tok = token || session?.token || '';
    const result = await request<any>(path, { method: 'GET' }, tok);
    return { data: result };
  },

  async post(path: string, body: Record<string, unknown>, token?: string): Promise<{ data: any }> {
    const session = this.getStoredSession();
    const tok = token || session?.token || '';
    const result = await request<any>(path, { method: 'POST', body: JSON.stringify(body) }, tok);
    return { data: result };
  },

  async patch(path: string, body: Record<string, unknown>, token?: string): Promise<{ data: any }> {
    const session = this.getStoredSession();
    const tok = token || session?.token || '';
    const result = await request<any>(path, { method: 'PATCH', body: JSON.stringify(body) }, tok);
    return { data: result };
  },

  async delete(path: string, token?: string): Promise<void> {
    const session = this.getStoredSession();
    const tok = token || session?.token || '';
    await request<any>(path, { method: 'DELETE' }, tok);
  },
};
