import { io, Socket } from 'socket.io-client';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:5000';

let socket: Socket | null = null;

export const socketService = {
  connect() {
    if (socket?.connected) return socket;
    socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    return socket;
  },

  disconnect() {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
  },

  on<T = any>(event: string, callback: (data: T) => void) {
    if (!socket) this.connect();
    socket?.on(event, callback as any);
  },

  off(event: string) {
    socket?.off(event);
  },

  getSocket() {
    return socket;
  },
};
