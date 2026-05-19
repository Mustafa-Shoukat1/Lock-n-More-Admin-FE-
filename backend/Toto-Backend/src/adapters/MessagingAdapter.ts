import { Request } from 'express';

export type MessagePayload = {
  platform: 'tiktok' | 'whatsapp' | 'instagram';
  userId: string;
  message: string;
  timestamp: number;
  rawPayload?: any;
};

export interface MessagingAdapter {
  parseIncoming(req: Request): MessagePayload;
  sendMessage(userId: string, message: string): Promise<void>;
}
