import axios from 'axios';
import pool from '../config/db.config';
import { AIService } from './ai.service';
import { NotificationService } from './notification.service';

export class TikTokService {
  private apiUrl: string;
  private accessToken: string;
  private aiService: AIService;
  private notificationService: NotificationService;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.apiUrl = 'https://open-api.tiktok.com';
    this.accessToken = process.env.TIKTOK_ACCESS_TOKEN || '';
    this.aiService = new AIService();
    this.notificationService = new NotificationService();
    // Auto-fetch client token on startup if none is configured
    if (!this.accessToken) {
      this.refreshClientToken().catch(err =>
        console.warn('⚠️ TikTok client token auto-fetch failed (non-fatal):', err.message)
      );
    }
  }

  /** Hot-update the access token without restarting the process. */
  setAccessToken(token: string): void {
    this.accessToken = token;
    process.env.TIKTOK_ACCESS_TOKEN = token;
    console.log('✅ TikTok access token updated in-process.');
  }

  /**
   * Fetch a client-credentials token (no browser/redirect needed).
   * These tokens are valid for 2 hours and auto-refresh when expired.
   */
  async refreshClientToken(): Promise<string> {
    const url = 'https://open.tiktokapis.com/v2/oauth/token/';
    const params = new URLSearchParams();
    params.append('client_key', process.env.TIKTOK_CLIENT_ID || '');
    params.append('client_secret', process.env.TIKTOK_CLIENT_SECRET || '');
    params.append('grant_type', 'client_credentials');

    const response = await axios.post(url, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in || 7200;
    this.setAccessToken(token);
    this.tokenExpiresAt = Date.now() + (expiresIn - 300) * 1000; // refresh 5 min early
    console.log(`✅ TikTok client token obtained, expires in ${expiresIn}s`);
    return token;
  }

  /** Ensure a valid token is available, refreshing if expired. */
  async ensureToken(): Promise<string> {
    if (!this.accessToken || (this.tokenExpiresAt > 0 && Date.now() > this.tokenExpiresAt)) {
      return this.refreshClientToken();
    }
    return this.accessToken;
  }

  /**
   * Exchange authorization code for access token (TikTok OAuth 2.0)
   */
  async getAccessToken(code: string): Promise<any> {
    try {
      const url = 'https://open.tiktokapis.com/v2/oauth/token/';
      const params = new URLSearchParams();
      params.append('client_key', process.env.TIKTOK_CLIENT_ID || '');
      params.append('client_secret', process.env.TIKTOK_CLIENT_SECRET || '');
      params.append('code', code);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', process.env.TIKTOK_REDIRECT_URI || '');

      const response = await axios.post(url, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error exchanging TikTok code:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error_description || 'Failed to exchange TikTok code');
    }
  }

  /**
   * Send a message via TikTok Open API
   */
  async sendMessage(openId: string, message: string, userId?: number, role?: string): Promise<any> {
    try {
      await this.ensureToken();
      const url = `${this.apiUrl}/message/send/`;
      const response = await axios.post(
        url,
        {
          recipient_open_id: openId,
          message: {
            text: message,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Save outbound message to DB
      const sessionData = await this.getSessionData(openId);
      const savedMsg = await this.saveMessage(openId, 'outbound', 'text', { text: message }, { session_id: sessionData.id });

      if (userId && role) {
        await this.logAgentResponse(sessionData.id, userId, role, savedMsg.id);
      }

      return response.data;
    } catch (error: any) {
      console.error('Error sending TikTok message:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to send TikTok message');
    }
  }

  /**
   * Get or create a TikTok contact in the DB
   */
  async getOrCreateContact(openId: string, username?: string) {
    try {
      const query = `
        INSERT INTO tiktok_contacts (id, username)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, updated_at = NOW()
        RETURNING *
      `;
      const result = await pool.query(query, [openId, username || openId]);
      return result.rows[0];
    } catch (error: any) {
      console.error('Error in getOrCreateContact (TikTok):', error.message);
      throw error;
    }
  }

  /**
   * Get or create a TikTok session in the DB
   */
  async getOrCreateSession(contactId: string) {
    try {
      const checkQuery = `
        SELECT * FROM tiktok_sessions 
        WHERE contact_id = $1 AND status = 'open'
        ORDER BY created_at DESC LIMIT 1
      `;
      const checkResult = await pool.query(checkQuery, [contactId]);

      if (checkResult.rows.length > 0) {
        return checkResult.rows[0];
      }

      const insertQuery = `
        INSERT INTO tiktok_sessions (contact_id)
        VALUES ($1)
        RETURNING *
      `;
      const insertResult = await pool.query(insertQuery, [contactId]);
      return insertResult.rows[0];
    } catch (error: any) {
      console.error('Error in getOrCreateSession (TikTok):', error.message);
      throw error;
    }
  }

  async getSessionData(contactId: string) {
    const session = await this.getOrCreateSession(contactId);
    return session;
  }

  /**
   * Save a message and its payload to the DB
   */
  async saveMessage(openId: string, direction: 'inbound' | 'outbound', type: string, content: any, metadata?: { session_id?: number }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let sessionId = metadata?.session_id;
      if (!sessionId) {
        const session = await this.getOrCreateSession(openId);
        sessionId = session.id;
      }

      const metaQuery = `
        INSERT INTO tiktok_messages (session_id, tiktok_open_id, direction, type)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at
      `;
      const metaResult = await client.query(metaQuery, [sessionId, openId, direction, type]);
      const messageId = metaResult.rows[0].id;

      const payloadQuery = `
        INSERT INTO tiktok_message_payloads (message_id, content)
        VALUES ($1, $2)
      `;
      await client.query(payloadQuery, [messageId, content]);

      await client.query('COMMIT');

      if (direction === 'inbound') {
        await client.query(
          `
            UPDATE tiktok_sessions
            SET last_customer_message_at = NOW(), awaiting_agent_reply = TRUE
            WHERE id = $1
          `,
          [sessionId]
        );

        // Trigger notification
        await this.notificationService.createNotification({
          type: 'message',
          title: 'New TikTok Message',
          message: `From ${openId}: ${content.text || '[Media]'}`,
          link: `/chat/tiktok/${openId}`,
          conversation_id: String(sessionId)
        });
      }

      return { ...metaResult.rows[0], tiktok_open_id: openId, direction, type, content };
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('Error saving TikTok message:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process AI response for TikTok
   */
  async handleAIResponse(openId: string, message: string, sessionId: number) {
    try {
      // Check if AI is active for this session
      const sessionResult = await pool.query('SELECT is_ai_active FROM tiktok_sessions WHERE id = $1', [sessionId]);
      if (sessionResult.rows[0]?.is_ai_active) {
        console.log(`🤖 Generating AI response for TikTok session ${sessionId}`);
        const aiResponse = await this.aiService.generateResponse(String(sessionId), message, undefined, {
          userId: openId,
          platform: 'tiktok'
        });
         await this.sendMessage(openId, aiResponse);
      }
    } catch (error: any) {
      console.error('Error handling AI response for TikTok:', error.message);
    }
  }

  async logAgentResponse(sessionId: number, userId: number, role: string, outboundMessageId: number, inboundMessageId?: number) {
    try {
      if (role === 'super_admin') return;

      const sessionResult = await pool.query(`SELECT * FROM tiktok_sessions WHERE id = $1`, [sessionId]);
      const session = sessionResult.rows[0];

      if (session && session.awaiting_agent_reply && session.assigned_user_id === userId) {
        const inboundAt = new Date(session.last_customer_message_at);
        const repliedAt = new Date();
        const diffMs = repliedAt.getTime() - inboundAt.getTime();

        let finalInboundId = inboundMessageId;
        if (!finalInboundId) {
          const lastInbound = await pool.query(
            `SELECT id FROM tiktok_messages WHERE session_id = $1 AND direction = 'inbound' ORDER BY created_at DESC LIMIT 1`,
            [sessionId]
          );
          finalInboundId = lastInbound.rows[0]?.id;
        }

        if (finalInboundId) {
          await pool.query(
            `
              INSERT INTO agent_response_metrics
              (platform, session_id, user_id, inbound_message_id, outbound_message_id, response_time_ms, inbound_at, replied_at)
              VALUES ('tiktok', $1, $2, $3, $4, $5, $6, $7)
            `,
            [sessionId, userId, finalInboundId, outboundMessageId, diffMs, inboundAt, repliedAt]
          );

          await pool.query(
            `
              UPDATE tiktok_sessions
              SET awaiting_agent_reply = FALSE, last_customer_message_at = NULL
              WHERE id = $1
            `,
            [sessionId]
          );

          if ((global as any).io) {
            (global as any).io.emit('agent_performance_updated', { userId });
          }
        }
      }
    } catch (error: any) {
      console.error('Error logging TikTok agent response:', error.message);
    }
  }

  /**
   * Fetch all TikTok conversations (sessions)
   */
  async getConversations(userId?: string | number, role?: string) {
    try {
      let query = `
        SELECT 
          s.id, 
          s.contact_id as open_id, 
          c.username, 
          c.name, 
          c.profile_pic_url as "profilePic",
          s.is_ai_active,
          s.is_archived,
          s.assigned_user_id,
          (SELECT content->>'text' FROM tiktok_messages m 
           JOIN tiktok_message_payloads p ON m.id = p.message_id 
           WHERE m.session_id = s.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
          (SELECT m.created_at FROM tiktok_messages m 
           WHERE m.session_id = s.id ORDER BY m.created_at DESC LIMIT 1) as last_timestamp,
          (SELECT COUNT(*) FROM tiktok_messages WHERE session_id = s.id AND direction = 'inbound' AND is_read = false) as unread_count
        FROM tiktok_sessions s
        JOIN tiktok_contacts c ON s.contact_id = c.id
      `;

      const params: any[] = [];
      if (role === 'agent' && userId) {
        query += ` WHERE s.assigned_user_id = $1`;
        params.push(userId);
      }

      query += ` ORDER BY last_timestamp DESC NULLS LAST`;

      const result = await pool.query(query, params);
      return result.rows.map(row => ({
        id: row.id,
        participant: {
          id: row.open_id,
          username: row.username,
          name: row.name || row.username || row.open_id,
          profilePic: row.profilePic
        },
        lastMessage: {
          text: row.last_message || '',
          timestamp: row.last_timestamp
        },
        unreadCount: parseInt(row.unread_count),
        is_ai_active: row.is_ai_active,
        is_archived: row.is_archived,
        assigned_user_id: row.assigned_user_id
      }));
    } catch (error: any) {
      console.error('Error fetching TikTok conversations:', error.message);
      throw error;
    }
  }

  /**
   * Fetch message history for a specific TikTok user
   */
  async getMessageHistory(openId: string) {
    try {
      const query = `
        SELECT 
          m.id, 
          m.direction, 
          m.type, 
          m.created_at as timestamp,
          p.content,
          p.media_url,
          m.is_read
        FROM tiktok_messages m
        JOIN tiktok_message_payloads p ON m.id = p.message_id
        WHERE m.tiktok_open_id = $1
        ORDER BY m.created_at ASC
      `;
      const result = await pool.query(query, [openId]);
      return result.rows.map(row => ({
        id: row.id,
        direction: row.direction,
        type: row.type,
        timestamp: row.timestamp,
        text: row.content?.text || '',
        mediaUrl: row.media_url,
        is_read: row.is_read,
        is_from_user: row.direction === 'inbound'
      }));
    } catch (error: any) {
      console.error('Error fetching TikTok history:', error.message);
      throw error;
    }
  }

  /**
   * Toggle Gemini AI for a specific TikTok chat
   */
  async updateAiStatus(openId: string, is_ai_active: boolean) {
    try {
      const query = `
        UPDATE tiktok_sessions 
        SET is_ai_active = $2
        WHERE contact_id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [openId, is_ai_active]);
      return result.rows[0];
    } catch (error: any) {
      console.error('Error updating TikTok AI status:', error.message);
      throw error;
    }
  }
}
